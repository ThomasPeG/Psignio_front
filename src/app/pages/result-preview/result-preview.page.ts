import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QuizService } from '../../services/quiz';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { AlertController } from '@ionic/angular';
import { QuizResultResponse } from '../../models/quiz.models';

@Component({
  selector: 'app-result-preview',
  templateUrl: './result-preview.page.html',
  styleUrls: ['./result-preview.page.scss'],
  standalone: false,
})
export class ResultPreviewPage implements OnInit {

  result: QuizResultResponse | undefined;
  previewImage: string = 'assets/types/1.png'; // Default fallback
  
  hasPendingAnswers = false;
  isLoading = false;

  constructor(
    private quizService: QuizService, 
    private router: Router,
    private authService: AuthService,
    private storage: StorageService,
    private alertController: AlertController
  ) { }

  async ngOnInit() {
    // 1. Check if we already have a result (e.g. from history or just submitted)
    this.result = this.quizService.lastResult;
    
    if (this.result) {
      this.setupResultView();
      return;
    }

    // 2. If no result, check if we have pending answers to submit
    const answers = await this.storage.get('currentAnswers');
    if (answers && answers.length > 0) {
      this.hasPendingAnswers = true;
      // Check if user is already logged in (e.g. page refresh)
      const isLoggedIn = await this.authService.isLoggedIn();
      if (isLoggedIn) {
        this.submitAnswers(answers);
      }
    } else {
      // No result and no answers? Go home.
      // But maybe allow staying if it's a direct navigation (handled by auth guard usually)
      // For now, redirect to home if completely empty state
      this.router.navigate(['/home'], { replaceUrl: true });
    }
  }

  setupResultView() {
    if (this.result?.preview) {
      if (this.result.preview.imageUrl) {
        this.previewImage = this.result.preview.imageUrl;
      } else {
        this.previewImage = this.getImageByName(this.result.preview.typeName);
      }
    }
  }

  async onAuthSuccess(user: any) {
    console.log('Auth successful in preview, submitting answers...');
    const answers = await this.storage.get('currentAnswers');
    if (answers) {
      this.submitAnswers(answers);
    }
  }

  submitAnswers(answers: any[]) {
    this.isLoading = true;
    this.quizService.submitQuiz(answers).subscribe({
      next: async (response) => {
        console.log('Resultados guardados:', response);
        this.quizService.lastResult = response;
        this.result = response;
        this.setupResultView();
        
        // Clear local storage
        await this.storage.remove('currentAnswers');
        await this.storage.remove('currentQuestionIndex');
        
        this.isLoading = false;
        this.hasPendingAnswers = false;

        // Redirigir al dashboard como solicitó el usuario
        this.router.navigate(['/dashboard']);
      },
      error: async (err) => {
        console.error('Error al guardar:', err);
        this.isLoading = false;

        if (err.status === 403) {
          const alert = await this.alertController.create({
            header: 'Límite de Cuenta Alcanzado',
            message: 'Tu cuenta actual ha alcanzado el límite de tests gratuitos. Inicia sesión con otra cuenta para guardar este resultado.',
            buttons: [
              {
                text: 'Cambiar Cuenta',
                handler: async () => {
                  await this.authService.logout(true);
                  // No need to navigate, we are already on the preview/login page
                }
              }
            ]
          });
          await alert.present();
        } else {
          const alert = await this.alertController.create({
            header: 'Error',
            message: 'Error al guardar el resultado. Intenta nuevamente.',
            buttons: ['OK']
          });
          await alert.present();
        }
      }
    });
  }

  checkHistoryAndRedirect(response: QuizResultResponse) {
     this.quizService.getHistory().subscribe({
      next: async (history) => {
        if (history && history.length > 1) {
           // User has history, maybe show alert or just stay here?
           // The user wants to show "Preview (Free)". 
           // If we stay here, we show the preview.
           // So we don't necessarily need to redirect to premium-result immediately
           // UNLESS premium-result IS the preview page?
           // The prompt said: "la cual mostrara el previw del resultado (free)"
           // ResultPreviewPage seems to be that page.
           // So we stay here.
        }
      }
    });
  }

  // Helper to get image by type name (simplified logic)
  getImageByName(typeName: string): string {
    // Map type names to assets if needed
    // For now returning default or based on ID logic if available
    return 'assets/types/1.png'; 
  }

  async goToPayment() {
    // Buscar ID en: 1. Objeto result, 2. Estructura anidada, 3. Servicio (último resultado)
    let resultId = this.result?._id || this.result?.result?.dominant?._id;
    
    if (!resultId && this.quizService.lastResult) {
       resultId = this.quizService.lastResult._id;
    }

    if (resultId) {
      // Guardar también en storage por seguridad, ya que PaymentPage lo busca ahí si falla params
      await this.storage.set('pending_payment_attempt_id', resultId);
      
      this.router.navigate(['/payment'], { queryParams: { attemptId: resultId } });
    } else {
      console.warn('No ID found for payment');
      this.alertController.create({
        header: 'Error',
        message: 'No se pudo identificar el resultado. Por favor intenta desde tu historial en el Dashboard.',
        buttons: ['OK']
      }).then(alert => alert.present());
      
      // Intentar navegar de todos modos, PaymentPage tiene lógica de fallback
      this.router.navigate(['/payment']);
    }
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
