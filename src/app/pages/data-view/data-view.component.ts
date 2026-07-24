import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  LucideAngularModule, Search, X,
  ChevronLeft, ChevronRight, Database, FileSpreadsheet
} from 'lucide-angular';
import { DataUploadService } from '../../core/services/data-upload.service';

@Component({
  selector: 'app-data-view',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './data-view.component.html',
  styleUrls: ['./data-view.component.scss']
})
export class DataViewComponent implements OnInit {

  readonly Search = Search;
  readonly X = X;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Database = Database;
  readonly FileSpreadsheet = FileSpreadsheet;

  fileName = '';
  data: any = null;
  isLoading = true;
  errorMessage = '';

  // Search
  searchText = '';
  filteredRows: any[] = [];

  // Pagination
  currentPage = 1;
  pageSize = 16;

  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private dataUploadService: DataUploadService
  ) {}

  ngOnInit(): void {
    this.fileName = this.route.snapshot.queryParamMap
      .get('file') || '';
    if (this.fileName) {
      this.loadData();
    } else {
      this.errorMessage = 'No file specified.';
      this.isLoading = false;
    }
  }

  loadData(): void {
    this.dataUploadService.getFileData(this.fileName)
    .subscribe({
      next: (result) => {
        this.data = result;
        this.filteredRows = result.rows || [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load data.';
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    if (!this.searchText.trim()) {
      this.filteredRows = this.data?.rows || [];
    } else {
      const term = this.searchText.toLowerCase();
      this.filteredRows = (this.data?.rows || [])
        .filter((row: any) =>
          Object.values(row).some(v =>
            String(v).toLowerCase().includes(term)
          )
        );
    }
    this.currentPage = 1;
  }

  clearSearch(): void {
    this.searchText = '';
    this.filteredRows = this.data?.rows || [];
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRows.length / this.pageSize);
  }

  get paginatedRows(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRows.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1);
      for (let i = Math.max(2, current - 1);
           i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push(-1);
      pages.push(total);
    }
    return pages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  isNumber(value: any): boolean {
    return typeof value === 'number';
  }

  closeWindow(): void {
    window.close();
  }
}