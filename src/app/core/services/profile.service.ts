import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private apiUrl = `${environment.apiUrl}/api/profile`;

  constructor(
    private http: HttpClient,
    private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  // Get current user profile
  getProfile(): Observable<any> {
    return this.http.get(this.apiUrl, {
      headers: this.getHeaders()
    });
  }

  // Update full name
  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`,
        data, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  // Change password
  changePassword(data: any): Observable<any> {
    return this.http.put(
        `${this.apiUrl}/change-password`,
        data, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }
}