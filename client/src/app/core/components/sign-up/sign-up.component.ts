import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { AlertService } from '../../../shared/services/alert.service';
import { TRANSLATE } from '../../../translation-marker';
import { UserService } from '../../services/user.service';
import { AppError } from '../../../shared/models/app-error';
import { ValidationError } from '../../../shared/models/validation-error';
import { DataService } from '../../../shared/services/data.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  model: any = {};
  loading = false;
  validationErrors:any = {};
  returnUrl: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private dataService: DataService,
    private alertService: AlertService) { }

  ngOnInit() {
    // reset login status
    if (this.authService.isLoggedIn())
      this.router.navigate(['/']);

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  signup() {
    this.loading = true;
    this.userService.create(this.model)
      .subscribe(
        data => {
          localStorage.setItem("token", data['auth_token']);
          this.router.navigateByUrl(this.returnUrl);
        },
      (error: AppError) => {
        this.loading = false;
        if (error instanceof ValidationError) {
          this.validationErrors = error.validations;
          this.alertService.error(TRANSLATE("sign_up.some_of_the_input_fields_are_invalid"));
        } else throw error;
      }
    );
  }
}
