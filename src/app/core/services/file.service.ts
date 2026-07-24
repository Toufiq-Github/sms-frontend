import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private apiUrl = `${environment.apiUrl}/api/files`;

  constructor(
    private http: HttpClient,
    private authService: AuthService) {}

  // Upload file
  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.post(`${this.apiUrl}/upload`, formData, {
      headers: headers,
      responseType: 'text'
    });
  }

  // Get all files
  getAllFiles(): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.apiUrl}/list`, {
      headers: headers
    });
  }

  // Download file
  downloadFile(id: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.apiUrl}/download/${id}`, {
      headers: headers,
      responseType: 'blob'
    });
  }

  // Delete file
  deleteFile(id: number): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete(`${this.apiUrl}/delete/${id}`, {
      headers: headers,
      responseType: 'text'
    });
  }
}