import { Component } from '@angular/core';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { RouterOutlet } from '@angular/router';


@Component({
  selector: 'app-full',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, SidebarComponent],
  templateUrl: './full.component.html',
  styleUrl: './full.component.css'
})
export class FullComponent {

}
