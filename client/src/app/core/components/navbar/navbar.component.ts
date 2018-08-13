import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../auth/services/auth.service';
import { IntroService } from '../../../intro.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  show: boolean = false;

  constructor(public authService: AuthService, private router: Router, private introService: IntroService) { }

  toggleCollapse() {
    this.show = !this.show;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  close() {
    this.show = false;
  }

  startTour() {
    this.introService.startTour();
  }
}
