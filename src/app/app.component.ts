import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HttpClientModule
  ],
  template: `
    <div style="padding: 20px">
      <h1>Password Manager</h1>
      <router-outlet></router-outlet>
    </div>
  `
})
export class AppComponent {
  title = 'password-manager';
}