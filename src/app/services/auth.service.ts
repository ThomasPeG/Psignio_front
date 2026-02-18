import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { QuizService } from './quiz';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Platform } from '@ionic/angular';
import { environment } from '../../environments/environment';

export interface User {
  _id: string;
  email: string;
  name: string;
  isPremium: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

declare var google: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private storageService = inject(StorageService);
  private platform = inject(Platform);
  private quizService = inject(QuizService);

  // Usar IP local para permitir acceso desde Android/iOS y Web en la misma red
  private baseUrl = environment.apiUrl;
  private apiUrl = `${this.baseUrl}/auth`;
  private _authState = new BehaviorSubject<User | null>(null);

  public readonly authState$ = this._authState.asObservable();

  constructor() {
    this.loadSession();
    // La inicialización nativa se mantiene perezosa o bajo demanda
  }

  // Eliminamos initGoogleAuth automático para evitar conflictos

  async loadSession() {
    const user = await this.storageService.get('user_info');
    if (user) {
      this._authState.next(user);
    }
  }

  register(data: { email: string; password: string; name?: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, data)
      .pipe(tap((response) => this.saveSession(response)));
  }

  login(data: { email: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, data)
      .pipe(tap((response) => this.saveSession(response)));
  }

  async loginGoogle(): Promise<Observable<AuthResponse>> {
    // ESTRATEGIA HÍBRIDA:
    // 1. Si es Nativo (Android/iOS) -> Usar Plugin Capacitor
    if (this.platform.is('capacitor')) {
      try {
        const googleUser = await GoogleAuth.signIn();
        const idToken = googleUser.authentication.idToken;
        return this.processGoogleToken(idToken);
      } catch (error) {
        console.error('Google Auth Nativo Error:', error);
        throw error;
      }
    }

    // 2. Si es Web -> Usar SDK oficial de Google (gsi) manualmente
    // Esto evita los problemas de "Origin" del plugin en localhost
    return new Promise((resolve, reject) => {
      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: '661874119102-pnb89egen6einv28aetiftfrmpcmdi2h.apps.googleusercontent.com',
          scope: 'email profile openid',
          callback: (tokenResponse: any) => {
            if (tokenResponse && tokenResponse.access_token) {
              // En flujo implícito obtenemos access_token, pero nuestro back espera idToken
              // OJO: Para idToken en web necesitamos flujo Code o credenciales
              // VAMOS A SIMPLIFICAR: Usar el endpoint de userinfo de google con el access token
              // Y enviar eso al backend, O pedirle al backend que verifique el access token.

              // OPCIÓN RÁPIDA: Obtener id_token forzando prompt o usando nueva librería es complejo.
              // MEJOR: Enviar access_token al backend y que el backend obtenga el perfil de Google.

              console.log('Token de Google recibido (Web):', tokenResponse);
              resolve(
                this.http
                  .post<AuthResponse>(`${this.apiUrl}/google-web`, { accessToken: tokenResponse.access_token })
                  .pipe(tap((response) => this.saveSession(response))),
              );
            } else {
              reject('No se recibió token de Google');
            }
          },
          error_callback: (err: any) => {
            console.error('Error Google Web:', err);
            reject(err);
          },
        });
        client.requestAccessToken();
      } catch (e) {
        console.error('Error inicializando cliente Google Web:', e);
        reject(e);
      }
    });
  }

  // Método auxiliar para procesar idToken (Nativo)
  private processGoogleToken(token: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/google`, { token })
      .pipe(tap((response) => this.saveSession(response)));
  }

  async logout(preserveQuiz: boolean = false) {
    let savedAnswers = null;
    let savedIndex = null;

    if (preserveQuiz) {
      savedAnswers = await this.storageService.get('currentAnswers');
      savedIndex = await this.storageService.get('currentQuestionIndex');
    }

    await this.storageService.clear(); // Limpiar TODO el almacenamiento local

    if (preserveQuiz && savedAnswers) {
      await this.storageService.set('currentAnswers', savedAnswers);
      if (savedIndex !== null) {
        await this.storageService.set('currentQuestionIndex', savedIndex);
      }
    }

    this.quizService.clearSession(); // Limpiar estado en memoria del quiz
    this._authState.next(null);
    if (this.platform.is('capacitor')) {
      await GoogleAuth.signOut();
    }
  }

  async isLoggedIn(): Promise<boolean> {
    const token = await this.storageService.get('auth_token');
    return !!token;
  }

  async getUser() {
    return await this.storageService.get('user_info');
  }

  getProfile(): Observable<any> {
    // Si el backend devuelve solo el usuario, lo mapeamos
    return this.http.get<any>(`${this.baseUrl}/user/profile`).pipe(
      tap((response) => {
        // Asumimos que la respuesta puede ser el usuario directo o { user: ... }
        const user = response.user || response;
        if (user) {
          this.updateLocalSession(user);
        }
      }),
    );
  }

  private async updateLocalSession(user: User) {
    const current = await this.storageService.get('user_info');
    const updated = { ...current, ...user };
    await this.storageService.set('user_info', updated);
    this._authState.next(updated);
  }

  private async saveSession(response: AuthResponse) {
    await this.storageService.set('auth_token', response.token);
    await this.storageService.set('user_info', response.user);
    this._authState.next(response.user);
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/user/me`).pipe(
      tap(() => {
        this.logout();
      })
    );
  }
}
