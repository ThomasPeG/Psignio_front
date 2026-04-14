import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AiChatRequest {
  message: string;
  archetypeId: number;
  secondaryArchetypeId: number;
  mode?: 'mentor' | 'friend';
}

export interface AiChatResponse {
  reply: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/ai/chat`;

  getChatResponse(message: string, archetypeId: number, secondaryTypeId: number, mode: 'mentor' | 'friend' = 'mentor'): Observable<AiChatResponse> {
    const body: AiChatRequest = { message, archetypeId, secondaryArchetypeId: secondaryTypeId, mode };
    return this.http.post<AiChatResponse>(this.apiUrl, body);
  }
}
