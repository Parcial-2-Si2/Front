import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../pages/auth/services/auth.service';
import { Docente } from '../../../pages/auth/interfaces/docente.interfaces';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})

export class HeaderComponent {
  usuarioActual: Docente | null = null;
  imageUrl: string = 'assets/img/profile-img.jpg'; // Default image URL  

  constructor(private authService: AuthService, private router: Router) {
    this.authService.user$.subscribe((docente) => {
      console.log('Usuario actual:', docente);
      this.usuarioActual = docente;
      if (docente && docente.url_imagen) {
        this.imageUrl = docente.url_imagen; // Update image URL if available
      }
    });
  }

  onToggleSidebar() {
    document.body.classList.toggle('toggle-sidebar');
  }
  

  logout() {
    this.authService.logout();
  }
}
