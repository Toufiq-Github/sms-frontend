import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, LayoutDashboard,
  FolderOpen, FileText, User, LogOut, Search, X,
  Upload, Download, Trash2, FileType, FileSpreadsheet,
  FileCode, Database } from 'lucide-angular';
import { FileService } from '../../core/services/file.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-files',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit {

  readonly LayoutDashboard = LayoutDashboard;
  readonly FolderOpen = FolderOpen;
  readonly FileText = FileText;
  readonly User = User;
  readonly LogOut = LogOut;
  readonly Search = Search;
  readonly X = X;
  readonly Upload = Upload;
  readonly Download = Download;
  readonly Trash2 = Trash2;
  readonly FileType = FileType;
  readonly FileSpreadsheet = FileSpreadsheet;
  readonly FileCode = FileCode;
  readonly Database = Database;

  files: any[] = [];
  filteredFiles: any[] = [];
  selectedFile: File | null = null;
  isUploading = false;
  isLoading = true;
  successMessage = '';
  errorMessage = '';
  currentUser: any;

  searchText = '';
  selectedType = 'ALL';
  fileTypes = ['ALL', 'PDF', 'XLSX', 'XLS', 'TXT'];

  constructor(
    private fileService: FileService,
    private authService: AuthService,
    private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadFiles();
  }

  loadFiles(): void {
    this.fileService.getAllFiles().subscribe({
      next: (data) => {
        this.files = data;
        this.filteredFiles = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading files:', err);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.applyFilter();
  }

  onFilterChange(type: string): void {
    this.selectedType = type;
    this.applyFilter();
  }

  applyFilter(): void {
    let result = this.files;
    if (this.selectedType !== 'ALL') {
      result = result.filter(f =>
        f.fileType === this.selectedType);
    }
    if (this.searchText.trim() !== '') {
      result = result.filter(f =>
        f.fileName.toLowerCase().includes(
          this.searchText.toLowerCase()));
    }
    this.filteredFiles = result;
  }

  clearSearch(): void {
    this.searchText = '';
    this.selectedType = 'ALL';
    this.filteredFiles = this.files;
  }

  getFileIcon(fileType: string): any {
    if (fileType === 'PDF') return this.FileType;
    if (fileType === 'XLSX' || fileType === 'XLS')
      return this.FileSpreadsheet;
    return this.FileCode;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.errorMessage = '';
      this.successMessage = '';
    }
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select a file first!';
      return;
    }
    this.isUploading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.fileService.uploadFile(this.selectedFile)
      .subscribe({
        next: (response) => {
          this.isUploading = false;
          this.successMessage = 'File uploaded successfully!';
          this.selectedFile = null;
          const fileInput = document.getElementById(
            'fileInput') as HTMLInputElement;
          if (fileInput) fileInput.value = '';
          this.loadFiles();
        },
        error: (err) => {
          this.isUploading = false;
          if (err.status === 200) {
            this.successMessage = 'File uploaded successfully!';
            this.loadFiles();
          } else {
            this.errorMessage =
              'File upload failed! Check file type and size.';
          }
        }
      });
  }

  downloadFile(id: number, fileName: string): void {
    this.fileService.downloadFile(id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.errorMessage = 'Download failed!';
      }
    });
  }

  deleteFile(id: number): void {
    if (confirm('Are you sure you want to delete this file?')) {
      this.fileService.deleteFile(id).subscribe({
        next: () => {
          this.successMessage = 'File deleted successfully!';
          this.loadFiles();
        },
        error: (err) => {
          if (err.status === 200) {
            this.successMessage = 'File deleted successfully!';
            this.loadFiles();
          } else {
            this.errorMessage = 'Delete failed!';
          }
        }
      });
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024)
      return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}