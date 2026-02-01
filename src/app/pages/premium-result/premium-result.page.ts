import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QuizService } from '../../services/quiz';
import { QuizResultResponse } from '../../models/quiz.models';

@Component({
  selector: 'app-premium-result',
  templateUrl: './premium-result.page.html',
  styleUrls: ['./premium-result.page.scss'],
  standalone: false,
})
export class PremiumResultPage implements OnInit {

  result: QuizResultResponse | undefined;
  previewImage: string = 'assets/icon/favicon.png';

  constructor(private quizService: QuizService, private router: Router) { }

  ngOnInit() {
    this.result = this.quizService.lastResult;
    if (!this.result) {
      this.router.navigate(['/home']);
      return;
    }

    // Si tenemos preview pero no el resultado completo, preparamos la imagen
    if (!this.result.result && this.result.preview) {
      if (this.result.preview.imageUrl) {
        this.previewImage = this.result.preview.imageUrl;
      } else {
        this.previewImage = this.getImageByName(this.result.preview.typeName);
      }
    }
  }

  getImageByName(typeName: string): string {
    // TODO: Asegúrate de tener estas imágenes en src/assets/types/ o usa URLs externas
    const map: {[key: string]: string} = {
      'El Impulso': 'assets/types/impulso.png',
      'El Sabio': 'assets/types/sabio.png',
    };
    return map[typeName] || 'assets/icon/favicon.png';
  }

  restart() {
    this.router.navigate(['/home']);
  }

  goToPayment() {
    this.router.navigate(['/payment']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

}
