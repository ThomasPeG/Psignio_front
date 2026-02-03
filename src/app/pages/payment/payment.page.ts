import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { PaymentService } from '../../services/payment.service';
import { QuizService } from '../../services/quiz';
import { StorageService } from '../../services/storage.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
  standalone: false,
})
export class PaymentPage implements OnInit {

  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  isLoading = true;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private paymentService: PaymentService,
    private quizService: QuizService,
    private storageService: StorageService
  ) {}

  async ngOnInit() {
    this.initializePayment();
  }

  async initializePayment() {
    // Intentar obtener ID de los parámetros de la URL
    const params = await firstValueFrom(this.route.queryParams);
    let attemptId = params['attemptId'];

    // Si no hay parámetro, intentar desde el servicio (estado volátil)
    if (!attemptId) {
       const result = this.quizService.lastResult;
       if (result && result._id) {
           attemptId = result._id;
       }
    }

    if (!attemptId) {
      this.presentToast('No se encontró el intento de quiz. Vuelve a intentarlo.', 'danger');
      this.router.navigate(['/dashboard']);
      return;
    }

    // Guardar el ID del intento por si hay redirección y recarga
    await this.storageService.set('pending_payment_attempt_id', attemptId);

    try {
      this.isLoading = true;
      this.errorMessage = ''; // Limpiar errores previos
      const response = await firstValueFrom(this.paymentService.createIntent(attemptId));
      const { clientSecret, publicKey } = response || {};
      
      if (!clientSecret || !publicKey) {
        throw new Error('Error al iniciar el pago');
      }

      this.stripe = await loadStripe(publicKey);
      if (!this.stripe) {
        throw new Error('No se pudo cargar Stripe');
      }

      const appearance = { /* theme: 'stripe' */ };
      this.elements = this.stripe.elements({ clientSecret, appearance: { theme: 'stripe' } });
      
      const paymentElement = this.elements.create('payment');
      paymentElement.mount('#payment-element');
      
      this.isLoading = false;

    } catch (error) {
      console.error(error);
      this.errorMessage = 'Error al cargar el sistema de pago. Verifica tu conexión.';
      this.isLoading = false;
    }
  }

  async processPayment() {
    if (!this.stripe || !this.elements) return;

    const loading = await this.loadingCtrl.create({
      message: 'Procesando pago seguro...',
    });
    await loading.present();

    try {
      const result = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          return_url: window.location.origin + '/premium-result',
        },
        redirect: 'if_required'
      });

      if (result.error) {
        // Error en el pago (tarjeta rechazada, etc)
        await loading.dismiss();
        this.errorMessage = result.error.message || 'Ocurrió un error desconocido';
        this.presentToast(this.errorMessage, 'danger');
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        // Éxito inmediato (sin redirección)
        // Actualizamos el mensaje del loading para dar feedback
        // loading.dismiss() se llamará al final
        
        try {
          // 1. FAIL-SAFE SYNC: Forzar notificación al backend
          console.log('Pago exitoso en cliente, sincronizando con backend...');
          await firstValueFrom(this.paymentService.syncPayment(result.paymentIntent.id));
          console.log('Sincronización completada.');
        } catch (syncError) {
          console.warn('Sync manual falló, confiando en webhook:', syncError);
          // No bloqueamos el flujo, el usuario pagó y debe ver algo (aunque sea "procesando")
        }

        await loading.dismiss();
        
        // 2. Navegar a resultados pasando el ID para asegurar la carga correcta
        const attemptId = await this.storageService.get('pending_payment_attempt_id');
        this.router.navigate(['/premium-result'], { 
          queryParams: { 
            id: attemptId,
            payment_status: 'confirmed' // Flag extra para la UI
          } 
        });

      } else {
        // Casos raros (requires_action que no se manejó auto, processing, etc)
        // Normalmente con 'if_required', si requiere acción (3DS), Stripe maneja la redirección o el popup
        // Si llegamos aquí sin error y sin paymentIntent exitoso, asumimos redirección en curso o estado pendiente
        await loading.dismiss();
      }

    } catch (e) {
      await loading.dismiss();
      console.error(e);
      this.presentToast('Error de comunicación con Stripe', 'danger');
    }
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color
    });
    toast.present();
  }
}
