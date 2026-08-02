import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideAngularModule, LayoutDashboard, Users,
  FolderOpen, FileText, User, LogOut, Database,
  Search, Table2, CheckCircle, AlertCircle
} from 'lucide-angular';
import { DataUploadService } from '../../core/services/data-upload.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-table-inspector',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './table-inspector.component.html',
  styleUrls: ['./table-inspector.component.scss']
})
export class TableInspectorComponent {

  readonly LayoutDashboard = LayoutDashboard;
  readonly Users = Users;
  readonly FolderOpen = FolderOpen;
  readonly FileText = FileText;
  readonly User = User;
  readonly LogOut = LogOut;
  readonly Database = Database;
  readonly Search = Search;
  readonly Table2 = Table2;
  readonly CheckCircle = CheckCircle;
  readonly AlertCircle = AlertCircle;

  currentUser: any;
  isAdmin = false;

  tableName = '';
  isLookingUp = false;
  isLoadingData = false;

  lookupResult: any = null;
  tableData: any = null;

  errorMessage = '';

  constructor(
    private dataUploadService: DataUploadService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.currentUser?.role === 'ADMIN';

    if (!this.isAdmin) {
      this.router.navigate(['/dashboard']);
    }
  }

  lookupTable(): void {
    if (!this.tableName.trim()) {
      this.errorMessage = 'Please enter a table name.';
      return;
    }

    this.isLookingUp = true;
    this.errorMessage = '';
    this.lookupResult = null;
    this.tableData = null;

    this.dataUploadService.lookupTable(
      this.tableName.trim()
    ).subscribe({
      next: (result) => {
        this.isLookingUp = false;
        this.lookupResult = result;
      },
      error: () => {
        this.isLookingUp = false;
        this.errorMessage =
          'Failed to look up table. Please try again.';
      }
    });
  }

  viewTableData(): void {
    if (!this.lookupResult?.found) return;

    this.isLoadingData = true;
    this.tableData = null;

    this.dataUploadService.getTableData(
      this.lookupResult.tableName
    ).subscribe({
      next: (result) => {
        this.isLoadingData = false;
        this.tableData = result;
      },
      error: () => {
        this.isLoadingData = false;
        this.errorMessage = 'Failed to load table data.';
      }
    });
  }

  resetSearch(): void {
    this.tableName = '';
    this.lookupResult = null;
    this.tableData = null;
    this.errorMessage = '';
  }

  isNumber(value: any): boolean {
    return typeof value === 'number';
  }

  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}