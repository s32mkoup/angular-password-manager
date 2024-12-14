import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, tap, catchError } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { PasswordDetailComponent } from '../password-detail/password-detail.component';
import { HttpClientModule } from '@angular/common/http';
import { PasswordService } from '../../services/password.service';
import { PasswordItem } from '../../models/password-item';
import { PasswordFormComponent } from '../password-form/password-form.component';

@Component({
  selector: 'app-password-list',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ConfirmDialogComponent,
    PasswordFormComponent,
    PasswordDetailComponent
  ],
  templateUrl: './password-list.component.html',
  styleUrls: ['./password-list.component.css']
})
export class PasswordListComponent implements OnInit {
  passwords$!: Observable<PasswordItem[]>;
  loading = false;
  error: string | null = null;

  constructor(
    private passwordService: PasswordService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Load passwords when the component initializes
    this.loadPasswords();
  }

  private getPasswordsWithDebug(): Observable<PasswordItem[]> {
    this.loading = true;
    return this.passwordService.getAllPasswords().pipe(
      tap(passwords => {
        // Handle successful password retrieval
        this.loading = false;
        this.error = null;
      }),
      catchError(error => {
        // Handle error in password retrieval
        this.loading = false;
        this.error = error.message;
        return [];
      })
    );
  }

  loadPasswords(): void {
    // Load passwords and assign to observable
    this.passwords$ = this.getPasswordsWithDebug();
  }

  searchPasswords(event: KeyboardEvent): void {
    // Search passwords based on user input
    const query = (event.target as HTMLInputElement).value;
    this.passwords$ = this.passwordService.searchPasswords(query).pipe(
      tap(results => console.log('Search results:', results))
    );
  }

  viewPassword(password: PasswordItem): void {
    // Open dialog to view password details
    this.dialog.open(PasswordDetailComponent, {
      data: { password },
      width: '600px',
      minHeight: '300px',
      panelClass: 'password-detail-dialog'
    });
  }

  editPassword(password: PasswordItem): void {
    // Open dialog to edit password
    const dialogRef = this.dialog.open(PasswordFormComponent, {
      data: { password: password },
      width: '600px',
      maxWidth: '90vw',
      minHeight: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      // Reload passwords if edit was successful
      if (result) {
        this.loadPasswords();
      }
    });
  }

  deletePassword(password: PasswordItem): void {
    // Open confirmation dialog to delete password
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Password',
        message: `Are you sure you want to delete the password for ${password.app}?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Delete password if confirmed
      if (result) {
        this.passwordService.deletePassword(password.id!).subscribe({
          next: () => {
            this.loadPasswords();
          },
          error: (error) => {
            this.error = 'Failed to delete password';
          }
        });
      }
    });
  }

  openAddDialog(): void {
    // Open dialog to add a new password
    const dialogRef = this.dialog.open(PasswordFormComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      // Reload passwords if add was successful
      if (result) {
        this.loadPasswords();
      }
    });
  }
}