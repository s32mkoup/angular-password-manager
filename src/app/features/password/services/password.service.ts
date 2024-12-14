import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, tap, of, map } from 'rxjs';
import { PasswordItem } from '../models/password-item';
import { EncryptionService } from './encryption.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PasswordService {
  private apiUrl = `${environment.apiUrl}/passwords`;

  constructor(
    private http: HttpClient,
    private encryptionService: EncryptionService
  ) {
    console.log('Password Service initialized with URL:', this.apiUrl);
  }

  getAllPasswords(): Observable<PasswordItem[]> {
    console.log('Fetching all passwords from:', this.apiUrl);
    return this.http.get<PasswordItem[]>(this.apiUrl).pipe(
      tap(response => {
        console.log('API Response:', response);
      }),
      catchError(error => {
        console.error('Error fetching passwords:', error);
        return of([]); // Return empty array on error
      })
    );
  }

  getPasswordById(id: number): Observable<PasswordItem> {
    console.log(`Fetching password with id: ${id}`);
    return this.http.get<PasswordItem>(`${this.apiUrl}/${id}`).pipe(
      tap(response => {
        console.log('Password retrieved:', response);
      }),
      catchError(error => {
        console.error(`Error fetching password with id ${id}:`, error);
        throw error;
      })
    );
  }

  createPassword(passwordData: Omit<PasswordItem, 'id'>): Observable<PasswordItem> {
    console.log('Creating new password:', passwordData);
    const timestamp = new Date();
    const newPassword = {
      ...passwordData,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    return this.http.post<PasswordItem>(this.apiUrl, newPassword).pipe(
      tap(response => {
        console.log('Password created:', response);
      }),
      catchError(error => {
        console.error('Error creating password:', error);
        throw error;
      })
    );
  }

  updatePassword(id: number, passwordData: Partial<PasswordItem>): Observable<PasswordItem> {
    console.log(`Updating password with id ${id}:`, passwordData);
    const updateData = {
      ...passwordData,
      updatedAt: new Date()
    };

    return this.http.put<PasswordItem>(`${this.apiUrl}/${id}`, updateData).pipe(
      tap(response => {
        console.log('Password updated:', response);
      }),
      catchError(error => {
        console.error(`Error updating password with id ${id}:`, error);
        throw error;
      })
    );
  }

  deletePassword(id: number): Observable<void> {
    console.log(`Deleting password with id: ${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        console.log(`Password with id ${id} deleted successfully`);
      }),
      catchError(error => {
        console.error(`Error deleting password with id ${id}:`, error);
        throw error;
      })
    );
  }

  searchPasswords(query: string): Observable<PasswordItem[]> {
    console.log('Searching passwords with query:', query);
    return this.getAllPasswords().pipe(
      map(passwords => {
        const filteredPasswords = passwords.filter(password => 
          password.app.toLowerCase().includes(query.toLowerCase()) ||
          password.category.toLowerCase().includes(query.toLowerCase()) ||
          password.userName.toLowerCase().includes(query.toLowerCase())
        );
        console.log('Search results:', filteredPasswords);
        return filteredPasswords;
      }),
      catchError(error => {
        console.error('Error searching passwords:', error);
        return of([]); 
      })
    );
  }
}