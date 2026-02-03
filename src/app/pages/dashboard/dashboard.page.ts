import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { QuizService } from '../../services/quiz';
import { QuizHistoryItem } from '../../models/quiz.models';
import { ViewWillEnter, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit, ViewWillEnter {

  user: any = null;
  history: QuizHistoryItem[] = [];
  isLoading = true;

  constructor(
    private authService: AuthService, 
    private quizService: QuizService,
    private router: Router,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.loadProfile();
    this.loadHistory();
  }

  ionViewWillEnter() {
    // Recargar historial cada vez que se entra a la vista
    this.loadHistory();
  }

  handleRefresh(event: any) {
    this.quizService.getHistory().subscribe({
      next: (data) => {
        this.history = data || [];
        event.target.complete();
      },
      error: () => {
        event.target.complete();
      }
    });
  }

  loadProfile() {
    this.authService.getProfile().subscribe({
      next: (data) => {
        console.log('Perfil cargado:', data);
        this.user = data.user || data; // Ajuste por si el back devuelve directo el user o envuelto
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        this.authService.getUser().then(u => {
          this.user = u;
        });
      }
    });
  }

  loadHistory() {
    this.isLoading = true;
    this.quizService.getHistory().subscribe({
      next: (data) => {
        console.log('Historial cargado RAW:', data);
        if (data && data.length > 0) {
             console.log('Primer item del historial:', data[0]);
             console.log('¿Tiene propiedad is_paid?:', 'is_paid' in data[0]);
        }
        this.history = data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar historial:', err);
        this.isLoading = false;
        // Si falla el historial, mostramos array vacío pero mantenemos usuario si cargó
      }
    });
  }

  async startNewQuiz() {
    // Verificar si el usuario ya tiene historial y NO es premium
    if (this.history.length > 0 && !this.user?.isPremium) {
      const alert = await this.alertCtrl.create({
        header: 'Límite Gratuito',
        message: 'Has alcanzado el límite de pruebas gratuitas. Hazte Premium para realizar tests ilimitados y desbloquear tus análisis completos.',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Ser Premium',
            handler: () => {
              this.router.navigate(['/payment']);
            }
          }
        ],
        cssClass: 'custom-alert'
      });
      await alert.present();
      return;
    }

    this.router.navigate(['/question']); 
  }

  async editProfile() {
    const alert = await this.alertCtrl.create({
      header: 'Editar Perfil',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Tu nombre',
          value: this.user?.name || ''
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            // Aquí iría la llamada al backend para actualizar
            if (this.user) {
              this.user.name = data.name;
            }
            // TODO: Implementar updateProfile en AuthService
          }
        }
      ]
    });
    await alert.present();
  }

  viewResult(attempt: QuizHistoryItem) {
    this.router.navigate(['/premium-result'], { queryParams: { id: attempt._id } });
  }

  shareResult(attempt: QuizHistoryItem, event: Event) {
    event.stopPropagation();
    // TODO: Implementar share
    console.log('Share', attempt);
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/home']);
  }

}
