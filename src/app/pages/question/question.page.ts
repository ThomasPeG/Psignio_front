import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { QuizService } from '../../services/quiz';
import { StorageService } from '../../services/storage.service';
import { Question, QuizOption } from '../../models/quiz.models';

@Component({
  selector: 'app-question',
  templateUrl: './question.page.html',
  styleUrls: ['./question.page.scss'],
  standalone: false,
})
export class QuestionPage implements OnInit {

  questions: Question[] = [];
  currentQuestionIndex: number = 0;
  answers: {questionId: number, value: number}[] = [];
  progress: number = 0;
  isLoading: boolean = true;

  // Opciones por defecto (Escala Likert)
  private defaultOptions: QuizOption[] = [
    { label: "Muy en desacuerdo", value: 1 },
    { label: "En desacuerdo", value: 2 },
    { label: "Neutral", value: 3 },
    { label: "De acuerdo", value: 4 },
    { label: "Muy de acuerdo", value: 5 }
  ];

  constructor(
    private quizService: QuizService, 
    private router: Router,
    private storage: StorageService,
    private navCtrl: NavController
  ) { }

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
      }
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
    const answer = this.answers.find(a => a.questionId === this.currentQuestion.id);
    return answer ? answer.value === value : false;
  }

  async selectOption(value: number) {
    const questionId = this.currentQuestion.id;
    
    // Si ya respondimos esta pregunta (al retroceder, por ejemplo), actualizamos
    const existingAnswerIndex = this.answers.findIndex(a => a.questionId === questionId);
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
    // Ya no enviamos aquí. Redirigimos al preview para guardar en DB.
    this.router.navigate(['/result-preview']);
  }

}
