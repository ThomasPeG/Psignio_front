import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { PaymentService } from '../../services/payment.service';
import { QuizService } from '../../services/quiz';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
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
  
  // Payment Mode: 'result' | 'upgrade'
  paymentMode: 'result' | 'upgrade' = 'result';
  priceDisplay: string = '$2.99 USD';
  productTitle: string = 'Desbloquea tu Potencial';
  productSubtitle: string = 'Obtén tu análisis de personalidad completo';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private paymentService: PaymentService,
    private quizService: QuizService,
    private storageService: StorageService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    this.initializePayment();
  }

  async initializePayment() {
    // Intentar obtener parámetros de la URL
    const params = await firstValueFrom(this.route.queryParams);
    let attemptId = params['attemptId'];
    const type = params['type']; // 'upgrade' o undefined (default result)

    // Configurar modo
    if (type === 'upgrade') {
        this.paymentMode = 'upgrade';
        this.priceDisplay = '$1.99 USD';
        this.productTitle = 'Cuenta Premium';
        this.productSubtitle = 'Tests ilimitados y acceso exclusivo';
    } else {
        this.paymentMode = 'result';
        this.priceDisplay = '$2.99 USD';
        this.productTitle = 'Desbloquea tu Potencial';
        this.productSubtitle = 'Obtén tu análisis de personalidad completo';
        
        // Lógica legacy para encontrar ID si no viene en params
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
        
        // Guardar el ID del intento
        await this.storageService.set('pending_payment_attempt_id', attemptId);
    }

    try {
      this.isLoading = true;
      this.errorMessage = ''; // Limpiar errores previos
      
      let response;
      
      if (this.paymentMode === 'upgrade') {
          // Obtener usuario actual para el upgrade
          const user = await this.storageService.get('user_info');
          if (!user || !user._id) {
              throw new Error('Debes iniciar sesión para ser Premium');
          }
          response = await firstValueFrom(this.paymentService.createPremiumUpgradeIntent(user._id));
      } else {
          // Pago de resultado normal
          response = await firstValueFrom(this.paymentService.createIntent(attemptId));
      }

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

    } catch (error: any) {
      console.error(error);
      this.errorMessage = error.message || 'Error al cargar el sistema de pago. Verifica tu conexión.';
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
      // Definir URL de retorno según el modo
      const returnUrl = this.paymentMode === 'upgrade' 
        ? window.location.origin + '/dashboard?payment_status=confirmed&type=upgrade'
        : window.location.origin + '/premium-result';

      const result = await this.stripe.confirmPayment({
        elements: this.elements,
        confirmParams: {
          return_url: returnUrl,
        },
        redirect: 'if_required'
      });

      if (result.error) {
        // Error en el pago
        await loading.dismiss();
        this.errorMessage = result.error.message || 'Ocurrió un error desconocido';
        this.presentToast(this.errorMessage, 'danger');
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        // Éxito inmediato
        
        try {
          console.log('Pago exitoso, sincronizando...');
          await firstValueFrom(this.paymentService.syncPayment(result.paymentIntent.id));
        } catch (syncError) {
          console.warn('Sync manual falló:', syncError);
        }

        await loading.dismiss();
        
        if (this.paymentMode === 'upgrade') {
            // Forzar actualización del perfil antes de volver
            try {
              const updatedProfile = await firstValueFrom(this.authService.getProfile());
              console.log('Perfil actualizado tras pago:', updatedProfile);
            } catch (e) {
              console.warn('No se pudo refrescar el perfil automáticamente:', e);
            }

            this.presentToast('¡Bienvenido a Premium!', 'success');
            this.router.navigate(['/dashboard'], { queryParams: { refresh: 'true' } });
        } else {
            const attemptId = await this.storageService.get('pending_payment_attempt_id');
            this.router.navigate(['/premium-result'], { 
              queryParams: { 
                id: attemptId,
                payment_status: 'confirmed' 
              } 
            });
        }

      } else {
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
