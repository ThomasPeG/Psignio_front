import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delete-account',
  standalone: true,
  imports: [CommonModule, IonicModule],
  styles: [`
    .delete-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
      padding: 24px;
    }
    .warning-icon {
      font-size: 80px;
      color: var(--ion-color-danger);
      margin-bottom: 20px;
    }
  
    .actions {
      width: 100%;
      max-width: 350px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  `],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/dashboard"></ion-back-button>
        </ion-buttons>
        <ion-title>Eliminar Cuenta</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="delete-container">
        <ion-icon name="warning-outline" class="warning-icon"></ion-icon>
        
        <h1>¿Estás seguro?</h1>
        
        <p>
          Esta acción es <strong>irreversible</strong>. Si eliminas tu cuenta:
        </p>
        
        <ul>
          <li>Perderás todos tus resultados y arquetipos.</li>
          <li>Perderás acceso a cualquier contenido premium comprado.</li>
          <li>Tus datos personales serán borrados de nuestros servidores.</li>
        </ul>

        <div class="actions">
          <ion-button expand="block" color="secondary" fill="outline" (click)="goBack()">
            Cancelar, quiero quedarme
          </ion-button>
          
          <ion-button expand="block" color="danger" (click)="confirmDelete()">
            Sí, eliminar mi cuenta
          </ion-button>
        </div>
      </div>
    </ion-content>
  `
})
export class DeleteAccountPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private loadingCtrl = inject(LoadingController);
  private toastCtrl = inject(ToastController);

  async confirmDelete() {

    const alert = await this.alertCtrl.create({
      header: 'Confirmación Final',
      message: 'Por favor confirma que entiendes que esta acción no se puede deshacer y perderás todos tus datos.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar Definitivamente',
          role: 'destructive',
          handler: () => {
            this.processDelete();
          }
        }
      ]
    });
    await alert.present();
  }

  goBack() {
    this.router.navigate(['/dashboard'], { replaceUrl: true });
  }

  async processDelete() {
    const loading = await this.loadingCtrl.create({
      message: 'Eliminando cuenta...',
    });
    await loading.present();

    this.authService.deleteAccount().subscribe({
      next: async () => {
        await loading.dismiss();
        this.showToast('Tu cuenta ha sido eliminada exitosamente.');
        this.router.navigate(['/home'], { replaceUrl: true });
      },
      error: async (err) => {
        console.error('Error deleting account:', err);
        await loading.dismiss();
        this.showToast('Error al eliminar cuenta. Intenta nuevamente.');
      }
    });
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom'
    });
    await toast.present();
  }
}
