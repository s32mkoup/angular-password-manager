import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  encryptPassword(password: string): string {
    return btoa(password);  // Base64 encryption
  }

  decryptPassword(encryptedPassword: string): string {
    return atob(encryptedPassword);  // Base64 decryption
  }

  validateEncryption(encryptedPassword: string): boolean {
    try {
      this.decryptPassword(encryptedPassword);
      return true;
    } catch {
      return false;
    }
  }
}