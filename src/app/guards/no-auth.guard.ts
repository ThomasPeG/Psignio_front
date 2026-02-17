import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  private storageService = inject(StorageService);
  private router = inject(Router);

  async canActivate(): Promise<boolean | UrlTree> {
    const token = await this.storageService.get('auth_token');
    if (token) {
      // Si hay token (sesión iniciada), redirigir al dashboard
      return this.router.parseUrl('/dashboard');
    }
    // Si no hay token, permitir acceso a Home/Auth
    return true;
  }
}
