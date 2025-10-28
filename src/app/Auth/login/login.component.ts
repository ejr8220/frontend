import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import { TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
//import { CardModule } from '@syncfusion/ej2-angular-layouts';
import { ToastModule, ToastComponent, ToastPositionModel } from '@syncfusion/ej2-angular-notifications';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    TextBoxModule,
    ButtonModule,
    //CardModule,
    ToastModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  public form: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  public toast?: ToastComponent;
  public position: ToastPositionModel = { X: 'Right', Y: 'Top' };

  login(): void {
    if (this.form.invalid) {
      this.showToast('Ingrese usuario y contraseña');
      return;
    }
    let num = 0;

    console.log('Login successful');
    this.router.navigate(['/dashboard']);
    console.log('Navigated to /dashboard');
    /*const { username, password } = this.form.value;
    const url = `${environment.api.url}${environment.api.pathAuth}`;

    this.http.post<any>(url, { username, password }).subscribe({
      next: (res) => {
        const expires = new Date(res.expiresAt);
        document.cookie = `token=${res.token};expires=${expires.toUTCString()};path=/`;
        document.cookie = `expiresAt=${res.expiresAt};expires=${expires.toUTCString()};path=/`;
        sessionStorage.setItem('user', JSON.stringify(res.user));
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.showToast('Credenciales incorrectas');
        
      }
    });*/
  }

  recover(): void {
    this.showToast('Funcionalidad de recuperación aún no implementada');
  }

  showToast(message: string): void {
    this.toast?.show({ content: message, cssClass: 'e-toast-danger', timeOut: 3000 });
  }

  onToastCreated(toastObj: ToastComponent): void {
    this.toast = toastObj;
  }
}