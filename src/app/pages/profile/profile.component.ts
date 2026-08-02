import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, LayoutDashboard, Users,
  FolderOpen, FileText, User, LogOut, Calendar, Clock,
  IdCard, Edit, Database, KeyRound, Table2 } from 'lucide-angular';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  // Icons
  readonly LayoutDashboard = LayoutDashboard;
  readonly Users = Users;
  readonly FolderOpen = FolderOpen;
  readonly FileText = FileText;
  readonly User = User;
  readonly LogOut = LogOut;
  readonly Calendar = Calendar;
  readonly Clock = Clock;
  readonly IdCard = IdCard;
  readonly Edit = Edit;
  readonly KeyRound = KeyRound;
  readonly Database = Database;
  readonly Table2 = Table2; // 👈 Added Table Inspector icon

  profile: any = {};
  isLoading = true;
  isAdmin = false;

  // Update name form
  fullName = '';
  isUpdatingName = false;
  nameSuccessMsg = '';
  nameErrorMsg = '';

  // Change password form
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  isChangingPassword = false;
  passwordSuccessMsg = '';
  passwordErrorMsg = '';

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.role === 'ADMIN';
    this.loadProfile();
  }

  loadProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.fullName = data.fullName;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }

  updateName(): void {
    if (!this.fullName.trim()) {
      this.nameErrorMsg = 'Full name cannot be empty!';
      return;
    }

    this.isUpdatingName = true;
    this.nameSuccessMsg = '';
    this.nameErrorMsg = '';

    this.profileService.updateProfile({
      fullName: this.fullName
    }).subscribe({
      next: (response) => {
        this.isUpdatingName = false;
        this.nameSuccessMsg =
            'Name updated successfully!';

        // Update localStorage user info
        const currentUser =
            this.authService.getCurrentUser();
        currentUser.fullName = this.fullName;
        localStorage.setItem('user',
            JSON.stringify(currentUser));

        this.loadProfile();
      },
      error: (err) => {
        this.isUpdatingName = false;
        if (err.status === 200) {
          this.nameSuccessMsg =
              'Name updated successfully!';
          this.loadProfile();
        } else {
          this.nameErrorMsg = 'Failed to update name!';
        }
      }
    });
  }

  changePassword(): void {
    this.passwordSuccessMsg = '';
    this.passwordErrorMsg = '';

    if (!this.currentPassword ||
        !this.newPassword ||
        !this.confirmPassword) {
      this.passwordErrorMsg = 'All fields are required!';
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordErrorMsg =
          'New password must be at least 6 characters!';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordErrorMsg = 'Passwords do not match!';
      return;
    }

    this.isChangingPassword = true;

    this.profileService.changePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: (response: any) => {
        this.isChangingPassword = false;
        if (response.includes('incorrect')) {
          this.passwordErrorMsg = response;
        } else {
          this.passwordSuccessMsg =
              'Password changed successfully!';
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
        }
      },
      error: (err) => {
        this.isChangingPassword = false;
        if (err.status === 200) {
          this.passwordSuccessMsg =
              'Password changed successfully!';
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmPassword = '';
        } else {
          this.passwordErrorMsg =
              'Failed to change password!';
        }
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