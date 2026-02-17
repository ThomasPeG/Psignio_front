import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-instructions',
  templateUrl: './instructions.page.html',
  styleUrls: ['./instructions.page.scss'],
  standalone: false,
})
export class InstructionsPage {
  private router = inject(Router);

  start() {
    this.router.navigate(['/question'], { replaceUrl: true });
  }
}
