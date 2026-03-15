import { Component, Input } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { QuizHistoryItem } from '../../models/quiz.models';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-quiz-selector',
  templateUrl: './quiz-selector.component.html',
  styleUrls: ['./quiz-selector.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class QuizSelectorComponent {
  @Input() quizzes: QuizHistoryItem[] = [];

  get hasUnpaidQuizzes(): boolean {
    return this.quizzes.some(q => !q.is_paid);
  }

  constructor(private modalCtrl: ModalController, private navCtrl: NavController) {}

  selectQuiz(quiz: QuizHistoryItem) {
    // Asumimos que el ID del arquetipo es el `resultTypeName` o un campo similar.
    // Si el campo tiene otro nombre, se debe ajustar aquí.
    this.modalCtrl.dismiss({archetypeId: quiz.resultTypeId, secondaryTypeId: quiz.secondaryTypeId}, 'confirm');
  }

  close() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  goToPremium() {
    this.modalCtrl.dismiss(null, 'cancel');
    // Asumo que tienes una página llamada 'premium' para las compras
    this.navCtrl.navigateForward('/premium');
  }
}
