import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, LayoutDashboard,
  FolderOpen, FileText, User, LogOut, FileType,
  FileSpreadsheet, Database, Download } from 'lucide-angular';
import { ReportService } from '../../core/services/report.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  readonly LayoutDashboard = LayoutDashboard;
  readonly FolderOpen = FolderOpen;
  readonly FileText = FileText;
  readonly User = User;
  readonly LogOut = LogOut;
  readonly FileType = FileType;
  readonly FileSpreadsheet = FileSpreadsheet;
  readonly Download = Download;
  readonly Database = Database;

  reports: any[] = [];
  isLoading = true;
  isGenerating = false;
  successMessage = '';
  errorMessage = '';
  currentUser: any;

  constructor(
    private reportService: ReportService,
    private authService: AuthService,
    private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadReports();
  }

  loadReports(): void {
    this.reportService.getAllReports().subscribe({
      next: (data) => {
        this.reports = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }

  generatePdfReport(): void {
    this.isGenerating = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.reportService.generatePdfReport().subscribe({
      next: (blob) => {
        this.isGenerating = false;
        this.successMessage = 'PDF Report generated successfully!';
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'report_' + new Date().getTime() + '.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
        this.loadReports();
      },
      error: (err) => {
        this.isGenerating = false;
        this.errorMessage = 'Failed to generate PDF report!';
      }
    });
  }

  generateExcelReport(): void {
    this.isGenerating = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.reportService.generateExcelReport().subscribe({
      next: (blob) => {
        this.isGenerating = false;
        this.successMessage = 'Excel Report generated successfully!';
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'report_' + new Date().getTime() + '.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        this.loadReports();
      },
      error: (err) => {
        this.isGenerating = false;
        this.errorMessage = 'Failed to generate Excel report!';
      }
    });
  }

  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}