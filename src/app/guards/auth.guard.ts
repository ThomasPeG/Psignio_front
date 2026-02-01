import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private storageService: StorageService, private router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    const token = await this.storageService.get('auth_token');
    if (token) {
      return true;
    }
    // Si no hay token, redirigir a home (landing page)
    return this.router.parseUrl('/home');
  }
}
