import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Injectable()
export class BetaLoginGuard implements CanActivate {
  constructor(
    private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (localStorage.getItem("betaLogin") == "4646") return true;

    this.router.navigate(['/beta']);
    return false;
  }
}
