import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private storageService: StorageService,
    private injector: Injector,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return from(this.storageService.get('auth_token')).pipe(
      switchMap(token => {
        let authReq = request;
        if (token) {
          authReq = request.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
        }
        
        return next.handle(authReq).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
              console.warn('Sesión expirada o token inválido (401). Cerrando sesión...');
              // Usar Injector para evitar dependencia circular
              const authService = this.injector.get(AuthService);
              authService.logout().then(() => {
                 this.router.navigate(['/auth']);
              });
            }
            return throwError(() => error);
          })
        );
      })
    );
  }
}
