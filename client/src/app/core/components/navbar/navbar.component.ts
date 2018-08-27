import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../auth/services/auth.service';
import { NavService } from '../../services/nav.service';

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
    public navService: NavService) { }

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
    this.navService.changeNav(this.navService.START_TOUR_NAV_ITEM);
  }
}
