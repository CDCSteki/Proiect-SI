import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, Subscription, interval } from 'rxjs';
import { TabSyncService } from './tabsync';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface AuthResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:8080/api';
  private pollingSub?: Subscription;

  constructor(
    private http: HttpClient,
    private router: Router,
    private tabSync: TabSyncService
  ) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, request).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        // Anunta celelalte tab-uri sa se deconecteze
        this.tabSync.broadcastLogin();
        this.startSessionPolling();
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, request).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.tabSync.broadcastLogin();
      })
    );
  }

  logout(): void {
    this.stopSessionPolling();
    this.tabSync.broadcastLogout();
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getRole(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role;
  }

  getUserId(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  }

  getUserName(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.name || '';
  }

  startSessionPolling(): void {
    if (this.pollingSub) return;
    
    // Verifică sesiunea la fiecare 15 secunde
    this.pollingSub = interval(15000).subscribe(() => {
      if (this.isLoggedIn()) {
        this.http.get(`${this.apiUrl}/auth/validate`).subscribe({
          error: () => this.stopSessionPolling() // Interceptorul prinde 401 și face redirect
        });
      }
    });
  }

  stopSessionPolling(): void {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = undefined;
    }
  }
}