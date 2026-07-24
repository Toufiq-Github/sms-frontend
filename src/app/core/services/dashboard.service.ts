import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'http://localhost:8080/api/dashboard';

  constructor(
    private http: HttpClient,
    private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  // Get dashboard stats
  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/stats`, {
      headers: this.getHeaders()
    });
  }

  // Get recent logins
  getRecentLogins(): Observable<any> {
    return this.http.get(`${this.apiUrl}/recent-logins`, {
      headers: this.getHeaders()
    });
  }
}