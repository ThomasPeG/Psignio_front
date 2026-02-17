import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  private router = inject(Router);
  private storage = inject(StorageService);

  async startQuiz() {
    // Limpiamos cualquier progreso anterior para empezar de cero
    await this.storage.remove('currentAnswers');
    await this.storage.remove('currentQuestionIndex');

    // Redirigir a la página de instrucciones antes del quiz
    this.router.navigate(['/instructions']);
  }

  async login() {
    // Si el usuario elige explícitamente "Ya tengo cuenta" desde el inicio,
    // limpiamos cualquier progreso de quiz abandonado para evitar
    // que la página de Auth piense que acaba de terminar un test.
    await this.storage.remove('currentAnswers');
    await this.storage.remove('currentQuestionIndex');

    this.router.navigate(['/auth']);
  }
}
