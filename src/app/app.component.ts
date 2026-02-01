import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private storage: StorageService, private router: Router) {
    this.initializeApp();
  }

  async initializeApp() {
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
