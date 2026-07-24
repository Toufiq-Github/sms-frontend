import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideAngularModule, LayoutDashboard, FolderOpen,
  FileText, User, LogOut, Upload, Eye, Database,
  FileSpreadsheet, ChevronLeft, ChevronRight,
  Search, X, CheckCircle, AlertCircle, Trash2,
  Users, ShieldCheck
} from 'lucide-angular';
import { DataUploadService } from '../../core/services/data-upload.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-data-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './data-upload.component.html',
  styleUrls: ['./data-upload.component.scss']
})
export class DataUploadComponent implements OnInit {

  // Icons
  readonly LayoutDashboard = LayoutDashboard;
  readonly FolderOpen = FolderOpen;
  readonly FileText = FileText;
  readonly User = User;
  readonly LogOut = LogOut;
  readonly Upload = Upload;
  readonly Eye = Eye;
  readonly Database = Database;
  readonly FileSpreadsheet = FileSpreadsheet;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Search = Search;
  readonly X = X;
  readonly CheckCircle = CheckCircle;
  readonly AlertCircle = AlertCircle;
  readonly Trash2 = Trash2;
  readonly Users = Users;
  readonly ShieldCheck = ShieldCheck;

  Math = Math;

  currentUser: any;
  isAdmin = false;

  // ===== LEFT PANEL — Upload Form =====
  selectedFiles: File[] = [];
  selectedCategory = 'General Data';
  categories = [
    'Student Records',
    'Employee Data',
    'Financial Data',
    'General Data'
  ];

  // Date fields
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;
  selectedDay: number = new Date().getDate();
  eodDate: string = this.getTodayDate();
  selectedFileType = 'ALL';
  fileTypeOptions = ['ALL', 'XLSX', 'XLS', 'CSV', 'PDF'];

  years: number[] = [];
  months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];
  days: number[] = [];

  isUploading = false;
  uploadSuccessMessage = '';
  uploadErrorMessage = '';
  uploadResults: any[] = [];

  // Preview
  previewData: any = null;
  showPreview = false;

  // ===== RIGHT PANEL — File Status Table =====
  // Filter controls (for right panel view button)
  // Explicitly convert to numbers to avoid string issues
  filterYear: number = Number(new Date().getFullYear());
  filterMonth: number = Number(new Date().getMonth() + 1);

  // All files + filtered files
  allFiles: any[] = [];
  displayedFiles: any[] = [];
  isLoadingFiles = true;

  // Search in right panel
  searchText = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;

  // Status messages for right panel
  viewMessage = '';

  constructor(
    private dataUploadService: DataUploadService,
    private authService: AuthService,
    private router: Router
  ) {}

  // ============================================================
  // ngOnInit — cleared messages at start
  // ============================================================
  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.currentUser?.role === 'ADMIN';
    this.uploadSuccessMessage = '';
    this.uploadErrorMessage = '';
    this.buildYears();
    this.buildDays();
    this.loadAllFiles();
  }

  // ===== INIT HELPERS =====
  buildYears(): void {
    const current = new Date().getFullYear();
    for (let y = current; y >= current - 5; y--) {
      this.years.push(y);
    }
  }

  buildDays(): void {
    const daysInMonth = new Date(
      this.selectedYear,
      this.selectedMonth,
      0
    ).getDate();
    this.days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      this.days.push(d);
    }
  }

  onMonthChange(): void {
    this.buildDays();
    if (this.selectedDay > this.days.length) {
      this.selectedDay = 1;
    }
    this.updateEodDate();
  }

  onYearChange(): void {
    this.buildDays();
    this.updateEodDate();
  }

  onDayChange(): void {
    this.updateEodDate();
  }

  updateEodDate(): void {
    const m = this.selectedMonth.toString()
      .padStart(2, '0');
    const d = this.selectedDay.toString()
      .padStart(2, '0');
    this.eodDate =
      `${this.selectedYear}-${m}-${d}`;
  }

  getTodayDate(): string {
    const now = new Date();
    const m = (now.getMonth() + 1).toString()
      .padStart(2, '0');
    const d = now.getDate().toString()
      .padStart(2, '0');
    return `${now.getFullYear()}-${m}-${d}`;
  }

  getMonthLabel(value: number): string {
    return this.months.find(m =>
      m.value === value)?.label || '';
  }

  // ===== FILE SELECTION =====
  onFilesSelected(event: any): void {
    const files: FileList = event.target.files;
    this.selectedFiles = Array.from(files);
    this.uploadSuccessMessage = '';
    this.uploadErrorMessage = '';
    this.showPreview = false;
    this.uploadResults = [];
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  formatFileSize(size: number): string {
    if (!size) return '-';
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024)
      return (size / 1024).toFixed(1) + ' KB';
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // ===== UPLOAD =====
  uploadFiles(): void {
    if (this.selectedFiles.length === 0) {
      this.uploadErrorMessage =
        'Please select at least one file!';
      return;
    }

    this.isUploading = true;
    this.uploadSuccessMessage = '';
    this.uploadErrorMessage = '';
    this.uploadResults = [];
    this.showPreview = false;

    const eod = this.eodDate;
    const cat = this.selectedCategory;

    if (this.selectedFiles.length === 1) {
      this.dataUploadService.uploadFile(
        this.selectedFiles[0], cat, eod
      ).subscribe({
        next: (result) => {
          this.isUploading = false;
          this.uploadResults = [result];
          this.previewData = result;
          this.showPreview = true;
          this.uploadSuccessMessage = result.message;
          this.selectedFiles = [];
          this.resetFileInput();
          this.loadAllFiles();
        },
        error: () => {
          this.isUploading = false;
          this.uploadErrorMessage =
            'Upload failed. Check file format.';
        }
      });
    } else {
      this.dataUploadService.uploadMultiple(
        this.selectedFiles, cat, eod
      ).subscribe({
        next: (results: any[]) => {
          this.isUploading = false;
          this.uploadResults = results;
          const first =
            results.find(r => r.totalRows > 0);
          if (first) {
            this.previewData = first;
            this.showPreview = true;
          }
          const ok =
            results.filter(r => r.totalRows > 0)
              .length;
          this.uploadSuccessMessage =
            `${ok} of ${results.length} files processed!`;
          this.selectedFiles = [];
          this.resetFileInput();
          this.loadAllFiles();
        },
        error: () => {
          this.isUploading = false;
          this.uploadErrorMessage = 'Upload failed.';
        }
      });
    }
  }

  resetUploadForm(): void {
    this.selectedFiles = [];
    this.selectedCategory = 'General Data';
    this.selectedYear = new Date().getFullYear();
    this.selectedMonth = new Date().getMonth() + 1;
    this.selectedDay = new Date().getDate();
    this.eodDate = this.getTodayDate();
    this.selectedFileType = 'ALL';
    this.uploadSuccessMessage = '';
    this.uploadErrorMessage = '';
    this.showPreview = false;
    this.uploadResults = [];
    this.resetFileInput();
  }

  resetFileInput(): void {
    const input = document.getElementById(
      'dataFileInput') as HTMLInputElement;
    if (input) input.value = '';
  }

  // ===== RIGHT PANEL — LOAD & FILTER =====
  loadAllFiles(): void {
    this.isLoadingFiles = true;
    this.dataUploadService.getAllDataFiles()
      .subscribe({
        next: (data) => {
          this.allFiles = data;
          this.displayedFiles = data;
          this.isLoadingFiles = false;
        },
        error: () => {
          this.isLoadingFiles = false;
        }
      });
  }

  // UPDATED: viewFilteredFiles with numeric conversion and error handling
  viewFilteredFiles(): void {
    // Force numeric conversion — select bindings
    // can sometimes carry string values
    const year = Number(this.filterYear);
    const month = Number(this.filterMonth);

    if (!year || !month) {
      this.viewMessage =
        'Please select both year and month.';
      return;
    }

    this.isLoadingFiles = true;
    this.viewMessage = '';

    this.dataUploadService.getFilteredFiles(
      year,
      month,
      undefined,
      this.selectedFileType === 'ALL'
        ? undefined
        : this.selectedFileType
    ).subscribe({
      next: (data) => {
        this.displayedFiles = data;
        this.currentPage = 1;
        this.isLoadingFiles = false;
        if (data.length === 0) {
          this.viewMessage =
            `No files found for ` +
            `${this.getMonthLabel(month)} ${year}.`;
        }
      },
      error: () => {
        this.isLoadingFiles = false;
        this.displayedFiles = [];
        this.viewMessage =
          'Failed to load files for this period.';
      }
    });
  }

  // Search inside displayed files
  onSearch(): void {
    if (!this.searchText.trim()) {
      this.displayedFiles = this.allFiles;
    } else {
      const term = this.searchText.toLowerCase();
      this.displayedFiles = this.allFiles.filter(f =>
        f.fileName.toLowerCase().includes(term) ||
        f.dataCategory.toLowerCase().includes(term) ||
        f.fileType.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
  }

  clearSearch(): void {
    this.searchText = '';
    this.displayedFiles = this.allFiles;
    this.currentPage = 1;
  }

  // ============================================================
  // DELETE — no ownership check needed (backend guarantees it)
  // ============================================================
  deleteDataFile(
    fileName: string,
    uploadedBy: string): void {

    if (confirm(
      `Delete "${fileName}"?\n\n` +
      `This permanently removes all extracted ` +
      `data from the database.`
    )) {
      this.dataUploadService
        .deleteFileData(fileName)
        .subscribe({
          next: () => {
            this.uploadSuccessMessage =
              `"${fileName}" deleted successfully!`;
            this.uploadErrorMessage = '';
            this.loadAllFiles();
            if (this.previewData?.sourceFileName
                === fileName) {
              this.showPreview = false;
              this.previewData = null;
            }
          },
          error: (err) => {
            if (err.status === 200) {
              this.uploadSuccessMessage =
                `"${fileName}" deleted!`;
              this.loadAllFiles();
            } else {
              this.uploadErrorMessage =
                'Delete failed. Please try again.';
            }
          }
        });
    }
  }

  // All displayed files belong to the current user
  canDeleteFile(uploadedBy: string): boolean {
    return true;
  }

  // ===== VIEW DATA =====
  viewData(fileName: string): void {
    const url =
      `/data-view?file=` +
      `${encodeURIComponent(fileName)}`;
    window.open(url, '_blank',
      'width=1200,height=700,' +
      'scrollbars=yes,resizable=yes');
  }

  // ===== PAGINATION =====
  get totalPages(): number {
    return Math.ceil(
      this.displayedFiles.length / this.pageSize);
  }

  get paginatedFiles(): any[] {
    const start =
      (this.currentPage - 1) * this.pageSize;
    return this.displayedFiles.slice(
      start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // ===== HELPERS =====
  isNumber(value: any): boolean {
    return typeof value === 'number';
  }

  getFileTypeClass(type: string): string {
    if (type === 'PDF') return 'badge-pdf';
    if (type === 'XLSX' || type === 'XLS')
      return 'badge-excel';
    if (type === 'CSV') return 'badge-csv';
    return 'badge-default';
  }

  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}