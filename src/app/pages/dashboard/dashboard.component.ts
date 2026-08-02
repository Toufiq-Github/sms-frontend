import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, Users,
  FolderOpen, FileText, User, LogOut, ShieldCheck,
  UserCheck, FileType, FileSpreadsheet, FileCode,
  ArrowRight, Database, Table2 } from 'lucide-angular';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { FileService } from '../../core/services/file.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  // Icons
  readonly LayoutDashboard = LayoutDashboard;
  readonly Users = Users;
  readonly FolderOpen = FolderOpen;
  readonly FileText = FileText;
  readonly User = User;
  readonly LogOut = LogOut;
  readonly ShieldCheck = ShieldCheck;
  readonly UserCheck = UserCheck;
  readonly FileType = FileType;
  readonly FileSpreadsheet = FileSpreadsheet;
  readonly FileCode = FileCode;
  readonly ArrowRight = ArrowRight;
  readonly Database = Database;
  readonly Table2 = Table2; // 👈 New icon added here

  stats: any = {
    totalUsers: 0,
    activeUsers: 0,
    totalFiles: 0,
    totalReports: 0
  };

  recentLogins: any[] = [];
  currentUser: any;
  isAdmin = false;
  isLoading = true;

  files: any[] = [];
  pdfCount = 0;
  excelCount = 0;
  txtCount = 0;
  chartLoaded = false;

  recentActivity: any[] = [];
  filesThisMonth = 0;

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private fileService: FileService,
    private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.currentUser?.role === 'ADMIN';
    this.loadStats();
    this.loadFiles();
    if (this.isAdmin) {
      this.loadRecentLogins();
    }
  }

  loadStats(): void {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }

  loadFiles(): void {
    this.fileService.getAllFiles().subscribe({
      next: (data) => {
        this.files = data;
        this.calculateFileStats();
        this.calculateRecentActivity();
        this.chartLoaded = true;
      },
      error: (err) => {
        console.error('Error loading files', err);
      }
    });
  }

  calculateFileStats(): void {
    this.pdfCount = this.files.filter(
      f => f.fileType === 'PDF').length;
    this.excelCount = this.files.filter(
      f => f.fileType === 'XLSX' ||
           f.fileType === 'XLS').length;
    this.txtCount = this.files.filter(
      f => f.fileType === 'TXT').length;
  }

  calculateRecentActivity(): void {
    const sorted = [...this.files].sort((a, b) =>
      new Date(b.uploadedAt).getTime() -
      new Date(a.uploadedAt).getTime()
    );
    this.recentActivity = sorted.slice(0, 4);

    const now = new Date();
    this.filesThisMonth = this.files.filter(f => {
      const uploaded = new Date(f.uploadedAt);
      return uploaded.getMonth() === now.getMonth() &&
             uploaded.getFullYear() === now.getFullYear();
    }).length;
  }

  getTimeAgo(dateString: string): string {
    const now = new Date().getTime();
    const past = new Date(dateString).getTime();
    const diffMs = now - past;

    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(dateString).toLocaleDateString();
  }

  getFileIconType(fileType: string): any {
    if (fileType === 'PDF') return this.FileType;
    if (fileType === 'XLSX' || fileType === 'XLS')
      return this.FileSpreadsheet;
    return this.FileCode;
  }

  getPercentage(count: number): number {
    if (this.files.length === 0) return 0;
    return Math.round(
      (count / this.files.length) * 100);
  }

  getActiveUserWidth(): number {
    if (this.stats.totalUsers === 0) return 0;
    return Math.round(
      (this.stats.activeUsers /
       this.stats.totalUsers) * 100);
  }

  getInactiveUserWidth(): number {
    return 100 - this.getActiveUserWidth();
  }

  getInactiveUserCount(): number {
    return this.stats.totalUsers - this.stats.activeUsers;
  }

  get pdfFileCount(): number {
    return this.pdfCount;
  }

  get latestUploadName(): string {
    return this.recentActivity.length > 0
      ? this.recentActivity[0].fileName
      : 'No files yet';
  }

  loadRecentLogins(): void {
    this.dashboardService.getRecentLogins()
    .subscribe({
      next: (data) => {
        this.recentLogins = data;
      },
      error: (err) => {
        console.error('Error loading recent logins',
          err);
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