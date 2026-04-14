import { Component, inject, ViewChild } from '@angular/core';
import { IonContent, IonicModule, ModalController, NavController, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AiService } from '../../services/ai.service';
import { QuizService } from '../../services/quiz.service';
import { QuizSelectorComponent } from '../../components/quiz-selector/quiz-selector.component';
import { Message } from '../../models/message.model';

@Component({
  selector: 'app-ai-chat',
  templateUrl: './ai-chat.page.html',
  styleUrls: ['./ai-chat.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, QuizSelectorComponent]
})
export class AiChatPage {
  @ViewChild(IonContent) content!: IonContent;

  private aiService = inject(AiService);
  private quizService = inject(QuizService);
  private modalCtrl = inject(ModalController);
  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);

  prompt: string = '';
  messages: Message[] = [];
  isLoading = false;
  selectedArchetypeId: number| null = null;
  selectedSecondaryTypeId: number | null = null;
  isFriendMode = false;

  ionViewWillEnter() {
    if (!this.selectedArchetypeId || !this.selectedSecondaryTypeId) {
      this.presentQuizSelector();
    }
  }

  async presentQuizSelector() {
    this.quizService.getHistory().subscribe(async (quizzes) => {
      if (!quizzes || quizzes.length === 0) {
        const alert = await this.alertCtrl.create({
          header: 'Realiza un Test Primero',
          message: 'Para usar el chat con IA, necesitas completar al menos un test.',
          buttons: [
            {
              text: 'Realizar Test',
              handler: () => this.navCtrl.navigateRoot('/home'),
            },
            {
              text: 'Volver',
              role: 'cancel',
              handler: () => this.navCtrl.back(),
            },
          ],
          backdropDismiss: false,
        });
        await alert.present();
        return;
      }

      const modal = await this.modalCtrl.create({
        component: QuizSelectorComponent,
        componentProps: { quizzes },
        backdropDismiss: false,
        breakpoints: [0, 0.4, 0.6, 0.9], // El modal puede ocupar 40%, 60% o 90% de la pantalla
        initialBreakpoint: 0.6, // Inicia en un 60% de altura
        handle: false, // Opcional: quita la barra para arrastrar
      });

      await modal.present();

      const { data, role } = await modal.onWillDismiss();

      if (role === 'confirm' && data) {
        this.selectedArchetypeId = data.archetypeId; // Guardamos el archetypeId
        this.selectedSecondaryTypeId = data.secondaryTypeId; // Guardamos el segundo ID
        this.messages = [];
      } else {
        this.navCtrl.back();
      }
    });
  }

  sendPrompt() {
    if (!this.prompt.trim() || !this.selectedArchetypeId || !this.selectedSecondaryTypeId) {
      return;
    }

    this.messages.push({ content: this.prompt, sender: 'user' });
    const userPrompt = this.prompt;
    this.prompt = '';
    this.scrollToBottom();

    this.isLoading = true;
    this.messages.push({ content: '', sender: 'ai' });

    const mode = this.isFriendMode ? 'friend' : 'mentor';
    this.aiService.getChatResponse(userPrompt, this.selectedArchetypeId, this.selectedSecondaryTypeId, mode).subscribe({
      next: (res) => {
        this.messages[this.messages.length - 1].content = res.reply;
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (err) => {
        this.messages[this.messages.length - 1].content = 'Error al obtener respuesta.';
        console.error('Error al contactar con la IA:', err);
        this.isLoading = false;
        this.scrollToBottom();
      }
    });
  }

  scrollToBottom() {
    setTimeout(() => this.content?.scrollToBottom(300), 100);
  }
}
