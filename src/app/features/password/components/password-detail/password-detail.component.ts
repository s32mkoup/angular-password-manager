import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PasswordItem } from '../../models/password-item';
import { EncryptionService } from '../../services/encryption.service';
import { MatTooltipModule } from '@angular/material/tooltip';

interface DialogData {
  password: PasswordItem;
}

@Component({
  selector: 'app-password-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './password-detail.component.html',
  styleUrls: ['./password-detail.component.css']
})
export class PasswordDetailComponent {
  decryptedPassword: string = '';
  showPassword: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<PasswordDetailComponent>,
    private encryptionService: EncryptionService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.decryptedPassword = this.encryptionService.decryptPassword(
      data.password.encryptedPassword
    );
  }

  onClose(): void {
    this.dialogRef.close();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard');
    });
  }
}