import { Routes } from '@angular/router';
import { PasswordListComponent } from './features/password/components/password-list/password-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'passwords', pathMatch: 'full' },
  { path: 'passwords', component: PasswordListComponent },
  { path: '**', redirectTo: 'passwords' }  
];