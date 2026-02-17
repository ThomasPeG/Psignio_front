import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { QuizService } from '../../services/quiz';
import { StorageService } from '../../services/storage.service';
import { QuizResultResponse } from '../../models/quiz.models';

@Component({
  selector: 'app-premium-result',
  templateUrl: './premium-result.page.html',
  styleUrls: ['./premium-result.page.scss'],
  standalone: false,
})
export class PremiumResultPage {
  private quizService = inject(QuizService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private storageService = inject(StorageService);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);

  result: QuizResultResponse | undefined;
  previewImage: string = 'assets/icon/favicon.png';
  isLoadingPayment = false;
  showPaymentWaitMessage = false;
  currentResultId: string | undefined;

  // Compatibilities
  compatibilities: any[] = [];
  isLoadingCompatibilities = false;
  compatibilitiesLoaded = false;

  handleRefresh(event: any) {
    this.ionViewWillEnter().then(() => {
      event.target.complete();
    });
  }

  refresh() {
    this.ionViewWillEnter();
  }

  async ionViewWillEnter() {
    this.isLoadingPayment = true;
    this.showPaymentWaitMessage = false;
    this.result = undefined; // Limpiar resultado anterior para evitar flash de contenido viejo

    // Usar queryParams.subscribe para asegurar que obtenemos los params actualizados
    // incluso si el componente es reutilizado por Ionic/Angular
    this.route.queryParams.subscribe(async (params) => {
      const redirectStatus = params['redirect_status'];
      const idFromParams = params['id'];

      if (idFromParams) {
        this.currentResultId = idFromParams;
      }

      console.log('PremiumResult Params:', params);

      if (redirectStatus === 'succeeded') {
        await this.handlePaymentSuccess();
        return;
      }

      // Si viene ID explícito por parámetro (e.g. desde Dashboard o tras pago exitoso)
      if (idFromParams) {
        console.log('Cargando resultado por ID:', idFromParams);
        const paymentJustConfirmed = params['payment_status'] === 'confirmed';
        await this.loadResult(idFromParams, paymentJustConfirmed);
        return;
      }

      // Flujo normal (tras terminar quiz y pagar inmediatamente sin recarga)
      const attemptId = await this.storageService.get('pending_payment_attempt_id');
      if (attemptId) {
        console.log('Cargando intento pendiente:', attemptId);
        await this.loadResult(attemptId);
        return;
      }

      // Último recurso: lo que haya en memoria del servicio
      this.result = this.quizService.lastResult;

      if (!this.result) {
        console.warn('No se encontró resultado, redirigiendo a Dashboard');
        this.isLoadingPayment = false;
        // Solo redirigir si realmente no hay nada y no estamos cargando
        this.router.navigate(['/dashboard']);
        return;
      }

      this.isLoadingPayment = false;
      this.setupView();
    });
  }

  async loadResult(id: string, expectPayment = false) {
    this.isLoadingPayment = true;
    try {
      const data = await this.quizService.getResult(id).toPromise();
      console.log('LoadResult Data:', data);

      if (data) {
        // Normalización robusta para vista previa
        if (!data.is_paid && !data.result) {
          // Si no está pagado y no tiene objeto result completo, construimos preview
          data.preview = {
            typeName: data.typeName || data.preview?.typeName || 'Arquetipo',
            snippet: data.snippet || data.preview?.snippet || 'Descubre tu personalidad completa.',
            imageUrl: 'assets/icon/favicon.png', // Fallback seguro
          };
        }

        this.result = data;
        this.quizService.lastResult = data;

        // Si esperábamos un pago confirmado pero la DB dice que NO está pagado,
        // iniciamos el polling para esperar la actualización del webhook/sync.
        if (expectPayment && !data.is_paid) {
          console.log('Pago confirmado localmente pero no en DB. Iniciando polling...');
          // Guardamos el ID temporalmente para el polling
          await this.storageService.set('pending_payment_attempt_id', id);
          this.handlePaymentSuccess(); // Reutilizamos la lógica de polling
          return;
        }

        this.setupView();
      } else {
        throw new Error('No data found for ID: ' + id);
      }
    } catch (error) {
      console.error('Error cargando resultado:', error);
      this.presentAlert('Error', 'No se pudo cargar el resultado. Intenta nuevamente desde el historial.');
    } finally {
      // Solo desactivamos loading si NO derivamos al polling (que maneja su propio loading)
      if (!expectPayment || (this.result && this.result.is_paid)) {
        this.isLoadingPayment = false;
      }
    }
  }

  async handlePaymentSuccess() {
    this.isLoadingPayment = true;

    // No usamos LoadingController bloqueante, sino el estado de la página para mejor UX
    // const loading = await this.loadingCtrl.create({ message: 'Confirmando pago...' });
    // await loading.present();

    const attemptId = await this.storageService.get('pending_payment_attempt_id');

    if (!attemptId) {
      this.isLoadingPayment = false;
      this.presentAlert('Aviso', 'No se encontró información del intento de pago. Verifica tu historial.');
      this.router.navigate(['/dashboard']);
      return;
    }

    // Polling loop
    let attempts = 0;
    const maxAttempts = 15; // 30 segundos aprox
    const pollInterval = 2000;

    const poll = async () => {
      try {
        const data = await this.quizService.getResult(attemptId).toPromise();
        if (data && data.is_paid) {
          // Pago confirmado
          this.result = data;
          this.quizService.lastResult = data;
          await this.storageService.remove('pending_payment_attempt_id');
          this.isLoadingPayment = false;
          this.setupView();
        } else {
          // Aún no procesado
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, pollInterval);
          } else {
            // Timeout - Mostrar estado de "Procesando" pero no salir
            this.isLoadingPayment = false;
            this.showPaymentWaitMessage = true;
            // No redirigimos, dejamos que el usuario vea un mensaje de "Pendiente" y pueda refrescar
            this.result = data; // Mostramos lo que tengamos (probablemente locked)
            if (this.result) {
              // Forzamos un estado visual de "Pendiente" si es necesario
              // O confiamos en que el template mostrará "Bloqueado" y un mensaje explicativo
            }
            this.presentAlert(
              'Pago en Proceso',
              'Tu pago ha sido recibido pero el banco aún está confirmando la transacción. El contenido se desbloqueará automáticamente en unos momentos. Puedes refrescar esta página.',
            );
          }
        }
      } catch (error) {
        console.error('Error polling result', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, pollInterval);
        } else {
          this.isLoadingPayment = false;
          this.presentAlert(
            'Error de Conexión',
            'Hubo un problema al verificar el estado. Por favor refresca la página.',
          );
        }
      }
    };

    poll();
  }

  setupView() {
    // Si tenemos preview pero no el resultado completo, preparamos la imagen
    if (this.result && !this.result.result && this.result.preview) {
      if (this.result.preview.imageUrl) {
        this.previewImage = this.result.preview.imageUrl;
      } else {
        this.previewImage = this.getImageByName(this.result.preview.typeName);
      }
    }
  }

  getImageByName(typeName: string): string {
    // TODO: Asegúrate de tener estas imágenes en src/assets/types/ o usa URLs externas
    const map: { [key: string]: string } = {
      'El Impulso': 'assets/types/impulso.png',
      'El Sabio': 'assets/types/sabio.png',
    };
    return map[typeName] || 'assets/icon/favicon.png';
  }

  getArchetypeCode(name: string): string {
    const map: { [key: string]: string } = {
      'El Impulso': 'T1',
      'El Vínculo': 'T2',
      'El Estratega': 'T3',
      'El Soberano': 'T4',
      'El Visionario': 'T5',
      'El Arquitecto': 'T6',
      'El Alquimista': 'T7',
    };
    if (!name) return 'T1';
    const key = Object.keys(map).find((k) => name.toLowerCase().includes(k.toLowerCase()));
    return key ? map[key] : 'T1';
  }

  getArchetypeName(code: string): string {
    const map: { [key: string]: string } = {
      T1: 'El Impulso',
      T2: 'El Vínculo',
      T3: 'El Estratega',
      T4: 'El Soberano',
      T5: 'El Visionario',
      T6: 'El Arquitecto',
      T7: 'El Alquimista',
    };
    return map[code] || code;
  }

  loadCompatibilities() {
    if (!this.result?.result?.dominant) return;

    let code = this.result.result.dominant.codigo;
    if (!code || !code.startsWith('T')) {
      code = this.getArchetypeCode(this.result.result.dominant.titulo);
    }

    this.isLoadingCompatibilities = true;
    this.quizService.getCompatibilities(code).subscribe({
      next: (data) => {
        console.log('Compatibilities loaded:', data);
        this.compatibilities = data;
        this.compatibilitiesLoaded = true;
        this.isLoadingCompatibilities = false;
      },
      error: (err) => {
        console.error('Error loading compatibilities', err);
        this.presentAlert('Error', 'No se pudieron cargar las compatibilidades.');
        this.isLoadingCompatibilities = false;
      },
    });
  }

  restart() {
    this.router.navigate(['/home']);
  }

  goToPayment() {
    // Prioridad: 1. ID de params, 2. ID del objeto resultado (legacy o nuevo), 3. ID almacenado
    let resultId = this.result?._id;
    if (!resultId && this.result?.result?.dominant?._id) {
      resultId = this.result.result.dominant._id;
    }

    const targetId = this.currentResultId || resultId;

    if (targetId) {
      this.router.navigate(['/payment'], {
        queryParams: { attemptId: targetId },
      });
    } else {
      console.warn('No hay ID de resultado para procesar pago');
      this.presentAlert('Error', 'No se pudo identificar el quiz. Por favor regresa al historial.');
    }
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
