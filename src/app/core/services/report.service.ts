import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private apiUrl = `${environment.apiUrl}/api/reports`;

  constructor(
    private http: HttpClient,
    private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  // Generate PDF report
  generatePdfReport(): Observable<any> {
    return this.http.get(`${this.apiUrl}/generate/pdf`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  // Generate Excel report
  generateExcelReport(): Observable<any> {
    return this.http.get(`${this.apiUrl}/generate/excel`, {
      headers: this.getHeaders(),
      responseType: 'blob'
    });
  }

  // Get all reports
  getAllReports(): Observable<any> {
    return this.http.get(`${this.apiUrl}/list`, {
      headers: this.getHeaders()
    });
  }
}