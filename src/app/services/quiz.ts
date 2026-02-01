import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question, QuizResultResponse, QuizHistoryItem } from '../models/quiz.models';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  
  // TODO: Ajusta esta URL a la dirección de tu backend real
  // Usar IP local para permitir acceso desde Android/iOS y Web en la misma red
  private apiUrl = 'http://192.168.1.126:3000/api';
  
  public lastResult: QuizResultResponse | undefined;

  constructor(private http: HttpClient) {}

  getQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>(`${this.apiUrl}/questions`);
  }

  submitQuiz(answers: {questionId: number, value: number}[]): Observable<QuizResultResponse> {
    // Enviamos el array directamente ya que el backend valida los campos questionId y value dentro de answers
    return this.http.post<QuizResultResponse>(`${this.apiUrl}/quiz/submit`, { answers });
  }

  getResult(attemptId: string): Observable<QuizResultResponse> {
    return this.http.get<QuizResultResponse>(`${this.apiUrl}/quiz/result/${attemptId}`);
  }

  getHistory(): Observable<QuizHistoryItem[]> {
    return this.http.get<QuizHistoryItem[]>(`${this.apiUrl}/quiz/history`);
  }
}
