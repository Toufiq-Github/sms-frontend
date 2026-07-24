import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DataUploadService {

  private apiUrl = 'http://localhost:8080/api/data';

  constructor(
    private http: HttpClient,
    private authService: AuthService) {}

  private getToken(): string {
    return `Bearer ${this.authService.getToken()}`;
  }

  // Upload single file
  uploadFile(
    file: File,
    category: string,
    eodDate: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('eodDate', eodDate);
    return this.http.post(
      `${this.apiUrl}/upload`,
      formData,
      {
        headers: new HttpHeaders({
          'Authorization': this.getToken()
        })
      }
    );
  }

  // Upload multiple files
  uploadMultiple(
    files: File[],
    category: string,
    eodDate: string): Observable<any> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    formData.append('category', category);
    formData.append('eodDate', eodDate);
    return this.http.post(
      `${this.apiUrl}/upload-multiple`,
      formData,
      {
        headers: new HttpHeaders({
          'Authorization': this.getToken()
        })
      }
    );
  }

  // Get all files (role-aware)
  getAllDataFiles(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/files`,
      {
        headers: new HttpHeaders({
          'Authorization': this.getToken()
        })
      }
    );
  }

  // Get files filtered by date
  getFilteredFiles(
    year: number,
    month: number,
    day?: number,
    fileType?: string): Observable<any> {
    let params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());
    if (day) params = params.set('day', day.toString());
    if (fileType) params = params.set('fileType', fileType);
    return this.http.get(
      `${this.apiUrl}/files/filter`,
      {
        headers: new HttpHeaders({
          'Authorization': this.getToken()
        }),
        params
      }
    );
  }

  // Get extracted data for a file
  getFileData(fileName: string): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/view`,
      {
        headers: new HttpHeaders({
          'Authorization': this.getToken()
        }),
        params: { fileName }
      }
    );
  }

  // Delete file data
  deleteFileData(fileName: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/delete`,
      {
        headers: new HttpHeaders({
          'Authorization': this.getToken()
        }),
        params: { fileName },
        responseType: 'text'
      }
    );
  }
}