import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomFormsModule } from 'ng2-validation';

import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../shared/shared.module';
import { LoginComponent } from './components/login/login.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { UserService } from './services/user.service';
import { VerifiedUserGuard } from './services/verified-user-guard.service';

@NgModule({
  imports: [
    SharedModule,
    AuthModule,
    CustomFormsModule,
    NgbModule.forRoot(),
    RouterModule.forChild([
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignUpComponent },
    ])
  ],
  declarations: [
    NavbarComponent,
    LoginComponent,
    SignUpComponent
  ],
  providers: [
    UserService,
    VerifiedUserGuard
  ],
  exports: [
    NavbarComponent,
  ]
})
export class CoreModule { }
