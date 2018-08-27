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
import { LocationService } from './services/location.service';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { ContactUsService } from './services/contact-us.service';
import { SkipTourModalContentComponent } from './components/skip-tour-modal-content/skip-tour-modal-content.component';
import { HomeComponent } from './components/home/home.component';
import { BetaLoginComponent } from './components/beta-login/beta-login.component';
import { BetaLoginGuard } from './services/beta-login-guard.service';
import { BetaComponent } from './components/beta/beta.component';
import { JoinBetaService } from './services/join-beta.service';
import { NavService } from './services/nav.service';

@NgModule({
  imports: [
    SharedModule,
    AuthModule,
    CustomFormsModule,
    NgbModule.forRoot(),
    RouterModule.forChild([
      { path: '', component: HomeComponent },
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignUpComponent },
      { path: 'contact-us', component: ContactUsComponent },
      { path: 'beta', component: BetaComponent },
    ])
  ],
  declarations: [
    NavbarComponent,
    LoginComponent,
    SignUpComponent,
    ContactUsComponent,
    SkipTourModalContentComponent,
    HomeComponent,
    BetaLoginComponent,
    BetaComponent
  ],
  providers: [
    UserService,
    VerifiedUserGuard,
    LocationService,
    ContactUsService,
    JoinBetaService,
    BetaLoginGuard,
    NavService
  ],
  exports: [
    NavbarComponent,
  ],
  entryComponents: [
    SkipTourModalContentComponent,
    BetaLoginComponent
  ]
})
export class CoreModule { }
