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

  constructor(
    public authService: AuthService,
    public router: Router,
    private introService: IntroService) { }

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
    window.scrollTo(0, 0);
    this.introService.startTour();
    window.scrollTo(0, 0);
  }
}
