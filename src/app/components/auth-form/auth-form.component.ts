import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-auth-form',
  templateUrl: './auth-form.component.html',
  styleUrls: ['./auth-form.component.scss'],
  standalone: false,
})
export class AuthFormComponent {

  @Output() authSuccess = new EventEmitter<any>();

  showEmailForm = false;
  isRegister = false;
  email = '';
  password = '';
  name = '';

  constructor(
    private authService: AuthService,
    private alertController: AlertController
  ) { }

  async loginWithGoogle() {
    try {
      // Nota: En web esto puede fallar si no está configurado el client ID
      // En dispositivo real usa el plugin nativo
      const obs = await this.authService.loginGoogle();
      const response = await obs.toPromise();
      if (response) {
        this.authSuccess.emit(response);
      }
    } catch (error) {
      console.error('Google login error:', error);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo iniciar sesión con Google.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async submitEmailForm() {
    if (!this.email || !this.password) {
      const alert = await this.alertController.create({
        header: 'Datos incompletos',
        message: 'Por favor ingresa correo y contraseña.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    try {
      let result;
      if (this.isRegister) {
        if (!this.name) {
          const alert = await this.alertController.create({
            header: 'Datos incompletos',
            message: 'Por favor ingresa tu nombre.',
            buttons: ['OK']
          });
          await alert.present();
          return;
        }
        result = await this.authService.register({ email: this.email, password: this.password, name: this.name }).toPromise();
      } else {
        result = await this.authService.login({ email: this.email, password: this.password }).toPromise();
      }
      
      this.authSuccess.emit(result);

    } catch (error: any) {
      console.error('Auth error:', error);
      const message = error.error?.message || 'Error de autenticación';
      const alert = await this.alertController.create({
        header: 'Error',
        message: message,
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  toggleMode() {
    this.isRegister = !this.isRegister;
  }
}
