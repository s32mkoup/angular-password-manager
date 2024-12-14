import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { PasswordService } from '../../services/password.service';
import { EncryptionService } from '../../services/encryption.service';
import { PasswordItem } from '../../models/password-item';

interface DialogData {
  password?: PasswordItem;
}

@Component({
  selector: 'app-password-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './password-form.component.html',
  styleUrls: ['./password-form.component.css']
})
export class PasswordFormComponent implements OnInit {
  passwordForm!: FormGroup;
  hidePassword = true;
  isEditMode = false;
  originalPassword: string = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PasswordFormComponent>,
    private passwordService: PasswordService,
    private encryptionService: EncryptionService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.createForm();
    this.isEditMode = !!data?.password;
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.password && this.passwordForm) {
      try {
        this.originalPassword = this.data.password.encryptedPassword;
        const decryptedPassword = this.encryptionService.decryptPassword(
          this.data.password.encryptedPassword
        );
        
        this.passwordForm.patchValue({
          category: this.data.password.category,
          app: this.data.password.app,
          userName: this.data.password.userName,
          password: decryptedPassword
        });
        console.log('Form populated with decrypted password');
      } catch (error) {
        console.error('Error decrypting password:', error);
      }
    }
  }

  private createForm(): void {
    this.passwordForm = this.fb.group({
      category: ['', [Validators.required, Validators.minLength(2)]],
      app: ['', [Validators.required, Validators.minLength(2)]],
      userName: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(6)
      ]]
    });
  }

  onSubmit(): void {
    if (this.passwordForm?.valid) {
      const formValue = this.passwordForm.value;
      try {
        const encryptedPassword = this.isEditMode && formValue.password === this.encryptionService.decryptPassword(this.originalPassword)
          ? this.originalPassword
          : this.encryptionService.encryptPassword(formValue.password);
        
        const passwordData: Omit<PasswordItem, 'id'> = {
          category: formValue.category.trim(),
          app: formValue.app.trim(),
          userName: formValue.userName.trim(),
          encryptedPassword
        };

        if (this.isEditMode && this.data.password?.id) {
          this.updatePassword(this.data.password.id, passwordData);
        } else {
          this.createPassword(passwordData);
        }
      } catch (error) {
        console.error('Error processing password:', error);
      }
    } else {
      this.markFormFieldsAsTouched();
    }
  }

  private updatePassword(id: number, passwordData: Omit<PasswordItem, 'id'>): void {
    this.passwordService.updatePassword(id, passwordData).subscribe({
      next: (result) => {
        console.log('Password updated successfully');
        this.dialogRef.close(result);
      },
      error: (error) => {
        console.error('Error updating password:', error);
      }
    });
  }

  private createPassword(passwordData: Omit<PasswordItem, 'id'>): void {
    this.passwordService.createPassword(passwordData).subscribe({
      next: (result) => {
        console.log('Password created successfully');
        this.dialogRef.close(result);
      },
      error: (error) => {
        console.error('Error creating password:', error);
      }
    });
  }

  private markFormFieldsAsTouched(): void {
    Object.keys(this.passwordForm.controls).forEach(key => {
      const control = this.passwordForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.passwordForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.passwordForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email';
    }
    if (control?.hasError('minlength')) {
      return `Minimum length is ${control.errors?.['minlength'].requiredLength} characters`;
    }
    return '';
  }
}