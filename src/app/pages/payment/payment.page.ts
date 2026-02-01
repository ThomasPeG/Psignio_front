import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
  standalone: false,
})
export class PaymentPage {

  cardNumber: string = '';
  expiry: string = '';
  cvc: string = '';

  constructor(
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  async processPayment() {
    if (!this.cardNumber || !this.expiry || !this.cvc) {
       const toast = await this.toastCtrl.create({
        message: 'Por favor completa todos los campos (Simulados)',
        duration: 2000,
        color: 'warning'
      });
      toast.present();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Procesando pago seguro...',
      duration: 2000
    });
    await loading.present();

    await loading.onDidDismiss();

    const toast = await this.toastCtrl.create({
      message: '¡Pago exitoso! Acceso desbloqueado.',
      duration: 2000,
      color: 'success'
    });
    await toast.present();

    this.router.navigate(['/premium-result']);
  }

}
