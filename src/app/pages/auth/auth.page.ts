import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { QuizService } from '../../services/quiz';
import { StorageService } from '../../services/storage.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: false,
})
export class AuthPage implements OnInit {

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  onAuthSuccess(user: any) {
    console.log('Login exitoso:', user);
    this.router.navigate(['/dashboard'], { replaceUrl: true });
  }

}
