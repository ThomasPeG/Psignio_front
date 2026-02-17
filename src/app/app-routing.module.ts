import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then((m) => m.HomePageModule),
    canActivate: [NoAuthGuard],
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'question',
    loadChildren: () => import('./pages/question/question.module').then((m) => m.QuestionPageModule),
  },
  {
    path: 'result-preview',
    loadChildren: () => import('./pages/result-preview/result-preview.module').then((m) => m.ResultPreviewPageModule),
  },
  {
    path: 'payment',
    loadChildren: () => import('./pages/payment/payment.module').then((m) => m.PaymentPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'premium-result',
    loadChildren: () => import('./pages/premium-result/premium-result.module').then((m) => m.PremiumResultPageModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then((m) => m.AuthPageModule),
    canActivate: [NoAuthGuard],
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then((m) => m.DashboardPageModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'instructions',
    loadChildren: () => import('./pages/instructions/instructions.module').then((m) => m.InstructionsPageModule),
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./pages/privacy-policy/privacy-policy.page').then( m => m.PrivacyPolicyPage)
  },
  {
    path: 'delete-account',
    loadComponent: () => import('./pages/delete-account/delete-account.page').then( m => m.DeleteAccountPage),
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
