import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CreateIntentResponse {
  clientSecret: string;
  publicKey: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment.apiUrl + '/payment';

  constructor(private http: HttpClient) {}

  createIntent(attemptId: string): Observable<CreateIntentResponse> {
    return this.http.post<CreateIntentResponse>(`${this.apiUrl}/create-intent`, { attemptId });
  }

  syncPayment(paymentIntentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/sync`, { paymentIntentId });
  }
}
