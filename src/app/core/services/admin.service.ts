import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = `${environment.apiUrl}/api/admin`;

  constructor(
    private http: HttpClient,
    private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  // Get all users
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, {
      headers: this.getHeaders()
    });
  }

  // Delete user
  deleteUser(id: number): Observable<any> {
    return this.http.delete(
        `${this.apiUrl}/users/${id}`, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  // Toggle user status
  toggleUserStatus(id: number): Observable<any> {
    return this.http.put(
        `${this.apiUrl}/users/${id}/toggle-status`,
        {}, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  // Make user admin
  makeAdmin(id: number): Observable<any> {
    return this.http.put(
        `${this.apiUrl}/users/${id}/make-admin`,
        {}, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }
}