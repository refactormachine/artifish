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

@NgModule({
  imports: [
    SharedModule,
    AuthModule,
    CustomFormsModule,
    NgbModule.forRoot(),
    RouterModule.forChild([
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignUpComponent },
      { path: 'contact-us', component: ContactUsComponent },
    ])
  ],
  declarations: [
    NavbarComponent,
    LoginComponent,
    SignUpComponent,
    ContactUsComponent,
    SkipTourModalContentComponent
  ],
  providers: [
    UserService,
    VerifiedUserGuard,
    LocationService,
    ContactUsService
  ],
  exports: [
    NavbarComponent,
  ],
  entryComponents: [SkipTourModalContentComponent]
})
export class CoreModule { }
