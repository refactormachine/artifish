import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthComponent } from './components/auth/auth.component';
import { TokenInterceptor } from './helpers/token.interceptor';
import { AuthGuard } from './services/auth-guard.service';
import { AuthService } from './services/auth.service';
import { FacebookAuthProvider } from './services/facebook-auth-provider';
import { GoogleAuthProvider } from './services/google-auth-provider';
import { AdminAuthGuard } from './services/admin-auth-guard.service';
import { UUIDInterceptor } from './helpers/uuid.interceptor';

@NgModule({
  declarations: [
    AuthComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule.forChild([
      { path: "auth/:provider", component: AuthComponent }
    ])
  ],
  providers: [
    GoogleAuthProvider,
    FacebookAuthProvider,
    AuthService,
    AuthGuard,
    AdminAuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: UUIDInterceptor, multi: true }
  ]
})
export class AuthModule { }
