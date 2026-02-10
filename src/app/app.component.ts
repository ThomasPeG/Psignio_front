import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './services/storage.service';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Platform } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private storage: StorageService, 
    private router: Router,
    private platform: Platform
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    this.platform.ready().then(async () => {
      // Configurar Status Bar Transparente (Edge-to-Edge)
      try {
        if (this.platform.is('capacitor')) {
          await StatusBar.setStyle({ style: Style.Dark });
          // Hace que el contenido suba detrás de la barra de estado
          await StatusBar.setOverlaysWebView({ overlay: true });
        }
      } catch (err) {
        console.warn('StatusBar plugin not implemented', err);
      }

      // Inicializar Google Auth solo en nativo (en web usamos SDK manual en AuthService)
      if (this.platform.is('capacitor')) {
        GoogleAuth.initialize({
          clientId: '661874119102-pnb89egen6einv28aetiftfrmpcmdi2h.apps.googleusercontent.com',
          scopes: ['profile', 'email'],
          grantOfflineAccess: true,
        });
      }
    });

    // Inicializar almacenamiento
    await this.storage.init();
    
    // Verificar sesión existente
    const token = await this.storage.get('auth_token');
    if (token) {
      // Si ya hay token, redirigir al dashboard si está en ruta raíz o home
      const currentUrl = window.location.pathname;
      if (currentUrl === '/' || currentUrl === '/home' || currentUrl === '/auth') {
        this.router.navigate(['/dashboard']);
      }
    } else {
      // Si no hay sesión, asegurar que vamos al home (evitar que quede en auth)
      const currentUrl = window.location.pathname;
      if (currentUrl === '/' || currentUrl === '' || currentUrl.includes('/auth')) {
        this.router.navigate(['/home']);
      }
    }
  }
}
