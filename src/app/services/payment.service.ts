import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateIntentResponse {
  clientSecret: string;
  publicKey: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl + '/payment';

  createIntent(attemptId: string): Observable<CreateIntentResponse> {
    return this.http.post<CreateIntentResponse>(`${this.apiUrl}/create-intent`, { attemptId });
  }

  createPremiumUpgradeIntent(userId: string): Observable<CreateIntentResponse> {
    return this.http.post<CreateIntentResponse>(`${this.apiUrl}/create-premium-intent`, { userId });
  }

  syncPayment(paymentIntentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/sync`, { paymentIntentId });
  }

  getPrices(): Observable<{priceAmount: number; premiumPriceAmount: number; currency: string}> {
    return this.http.get<{priceAmount: number; premiumPriceAmount: number; currency: string}>(`${this.apiUrl}/prices`);
  }
}
