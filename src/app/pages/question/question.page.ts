import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import { QuizService } from '../../services/quiz';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';
import { Question, QuizOption } from '../../models/quiz.models';

@Component({
  selector: 'app-question',
  templateUrl: './question.page.html',
  styleUrls: ['./question.page.scss'],
  standalone: false,
})
export class QuestionPage implements OnInit {
  private quizService = inject(QuizService);
  private router = inject(Router);
  private storage = inject(StorageService);
  private navCtrl = inject(NavController);
  private authService = inject(AuthService);
  private alertCtrl = inject(AlertController);
  private loadingCtrl = inject(LoadingController);

  questions: Question[] = [];
  currentQuestionIndex: number = 0;
  answers: { questionId: number; value: number }[] = [];
  progress: number = 0;
  isLoading: boolean = true;

  // Opciones por defecto (Escala Likert)
  private defaultOptions: QuizOption[] = [
    { label: 'Muy en desacuerdo', value: 1 },
    { label: 'En desacuerdo', value: 2 },
    { label: 'Neutral', value: 3 },
    { label: 'De acuerdo', value: 4 },
    { label: 'Muy de acuerdo', value: 5 },
  ];

  ngOnInit() {
    this.isLoading = true;
    this.quizService.getQuestions().subscribe({
      next: async (data) => {
        console.log('Preguntas recibidas:', data);
        this.questions = data; // Usamos las preguntas tal cual vienen del backend

        // Restaurar estado si existe
        const savedIndex = await this.storage.get('currentQuestionIndex');
        const savedAnswers = await this.storage.get('currentAnswers');

        if (savedIndex !== null && savedAnswers !== null) {
          this.currentQuestionIndex = savedIndex;
          this.answers = savedAnswers;
          this.updateProgress();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar preguntas:', err);
        this.isLoading = false;
      },
    });
  }

  get currentQuestion(): Question {
    return this.questions[this.currentQuestionIndex];
  }

  handleBack() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.updateProgress();
      this.storage.set('currentQuestionIndex', this.currentQuestionIndex);
    } else {
      this.navCtrl.navigateBack('/home');
    }
  }

  isOptionSelected(value: number): boolean {
    if (!this.currentQuestion) return false;
    const answer = this.answers.find((a) => a.questionId === this.currentQuestion.id);
    return answer ? answer.value === value : false;
  }

  async selectOption(value: number) {
    const questionId = this.currentQuestion.id;

    // Si ya respondimos esta pregunta (al retroceder, por ejemplo), actualizamos
    const existingAnswerIndex = this.answers.findIndex((a) => a.questionId === questionId);
    if (existingAnswerIndex > -1) {
      this.answers[existingAnswerIndex].value = value;
    } else {
      this.answers.push({ questionId, value });
    }

    // Guardar progreso
    await this.storage.set('currentAnswers', this.answers);

    if (this.currentQuestionIndex < this.questions.length - 1) {
      // Pequeño delay para dar feedback visual antes de cambiar
      setTimeout(async () => {
        this.currentQuestionIndex++;
        this.updateProgress();
        await this.storage.set('currentQuestionIndex', this.currentQuestionIndex);
      }, 200);
    } else {
      this.finishQuiz();
    }
  }

  updateProgress() {
    this.progress = this.currentQuestionIndex / this.questions.length;
  }

  async finishQuiz() {
    this.progress = 1;

    // Verificar sesión multiplataforma antes de decidir flujo
    const isLoggedIn = await this.authService.isLoggedIn();

    if (isLoggedIn) {
      // Usuario autenticado -> Flujo Premium (Guardar y Pagar)
      await this.submitQuiz();
    } else {
      // Usuario anónimo -> Flujo Preview (Ver resultado parcial y Auth)
      // Guardamos respuestas en storage para recuperarlas tras login
      await this.storage.set('currentAnswers', this.answers);
      this.router.navigate(['/result-preview']);
    }
  }

  async submitQuiz() {
    const loading = await this.loadingCtrl.create({
      message: 'Analizando tus respuestas...',
      spinner: 'crescent',
    });
    await loading.present();

    this.quizService.submitQuiz(this.answers).subscribe({
      next: async (response) => {
        console.log('Resultados guardados:', response);
        this.quizService.lastResult = response;

        // Limpiar progreso local solo tras éxito
        await this.storage.remove('currentAnswers');
        await this.storage.remove('currentQuestionIndex');

        await loading.dismiss();

        // Navegar a Premium Result (que actúa como preview y full result)
        this.router.navigate(['/premium-result'], {
          queryParams: { id: response._id },
        });
      },
      error: async (err) => {
        await loading.dismiss();
        console.error('Error al guardar:', err);

        if (err.status === 403) {
          // Límite alcanzado
          const alert = await this.alertCtrl.create({
            header: 'Límite de Cuenta Alcanzado',
            message:
              'Tu cuenta actual ha alcanzado el límite de tests gratuitos. Inicia sesión con otra cuenta para guardar este resultado sin perder tu progreso.',
            buttons: [
              {
                text: 'Cancelar',
                role: 'cancel',
              },
              {
                text: 'Cambiar Cuenta',
                handler: async () => {
                  // Logout preservando el quiz
                  await this.authService.logout(true);
                  // Redirigir a login
                  this.router.navigate(['/auth']);
                },
              },
            ],
            backdropDismiss: false,
          });
          await alert.present();
        } else if (err.status === 401) {
          // No autenticado (si el backend requiere auth)
          // Si el backend permite anónimos, esto no debería pasar.
          // Si pasa, redirigimos a auth.
          const alert = await this.alertCtrl.create({
            header: 'Guardar Resultado',
            message: 'Para guardar tu análisis, necesitas iniciar sesión o registrarte.',
            buttons: [
              {
                text: 'Iniciar Sesión / Registrarse',
                handler: () => {
                  this.router.navigate(['/auth']);
                },
              },
            ],
          });
          await alert.present();
        } else {
          const alert = await this.alertCtrl.create({
            header: 'Error',
            message: 'Hubo un problema al guardar tus respuestas. Intenta nuevamente.',
            buttons: ['OK'],
          });
          await alert.present();
        }
      },
    });
  }
}
