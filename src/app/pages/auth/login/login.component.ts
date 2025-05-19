import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AlertsService } from '../../../../shared/services/alerts.service';
import { ValidatorsService } from '../../../../shared/services/validators.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [RouterModule, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  public loginForm!: FormGroup;
  public loading: boolean = false;
  public returnUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private alertServive: AlertsService, 
    private validatorsService: ValidatorsService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          this.validatorsService.emailValid,
        ],
      ],
      password: [
        '',
        [
          Validators.required,
        ],
      ],
    });
    
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
  }

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    
    const gmail: string = this.loginForm.value.email.trim();
    const contrasena: string = this.loginForm.value.password.trim();
    
    this.authService.login({gmail, contrasena}).subscribe({
      next: (response) => {
        console.log('Login response:', response);
        this.loading = false;
        this.router.navigate([this.returnUrl]); 
        this.alertServive.toast('Usuario autenticado con éxito', 'success');
      },
      error: (error) => {
        this.loading = false; 
        console.error('Error en el login:', error);
        this.alertServive.toast('Credenciales inválidas. Intente nuevamente.', 'error');
      },
    });
  }

  register(){
    return this.router.navigate(['/authentication/register']);
  }
  
  isInvalidField(field: string): boolean | null {
    return this.validatorsService.isInvalidField(this.loginForm, field);
  }
  
  getMessageError(field: string): string | null {
    return this.validatorsService.getErrorMessage(this.loginForm, field);
  }
}
