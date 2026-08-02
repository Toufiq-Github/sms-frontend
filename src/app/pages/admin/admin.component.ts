import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, Users,
  FolderOpen, FileText, User, LogOut, Lock, Unlock,
  Star, Trash2, Database, Table2 } from 'lucide-angular';   // 👈 added Table2
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  readonly LayoutDashboard = LayoutDashboard;
  readonly Users = Users;
  readonly FolderOpen = FolderOpen;
  readonly FileText = FileText;
  readonly User = User;
  readonly LogOut = LogOut;
  readonly Lock = Lock;
  readonly Unlock = Unlock;
  readonly Star = Star;
  readonly Trash2 = Trash2;
  readonly Database = Database;
  readonly Table2 = Table2;   // 👈 added

  users: any[] = [];
  isLoading = true;
  successMessage = '';
  errorMessage = '';
  currentUser: any;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser?.role !== 'ADMIN') {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loadUsers();
  }

  loadUsers(): void {
    this.adminService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load users!';
      }
    });
  }

  deleteUser(id: number, name: string): void {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      this.adminService.deleteUser(id).subscribe({
        next: () => {
          this.successMessage = 'User deleted successfully!';
          this.loadUsers();
        },
        error: (err) => {
          if (err.status === 200) {
            this.successMessage = 'User deleted successfully!';
            this.loadUsers();
          } else {
            this.errorMessage = 'Failed to delete user!';
          }
        }
      });
    }
  }

  toggleStatus(id: number): void {
    this.adminService.toggleUserStatus(id).subscribe({
      next: () => {
        this.successMessage = 'User status updated!';
        this.loadUsers();
      },
      error: (err) => {
        if (err.status === 200) {
          this.successMessage = 'User status updated!';
          this.loadUsers();
        }
      }
    });
  }

  makeAdmin(id: number, name: string): void {
    if (confirm(`Promote ${name} to Admin?`)) {
      this.adminService.makeAdmin(id).subscribe({
        next: () => {
          this.successMessage = `${name} promoted to Admin!`;
          this.loadUsers();
        },
        error: (err) => {
          if (err.status === 200) {
            this.successMessage = `${name} promoted to Admin!`;
            this.loadUsers();
          }
        }
      });
    }
  }

  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}