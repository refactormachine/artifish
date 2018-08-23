import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { GtagModule } from 'angular-gtag';

import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { CollectionModule } from './collection/collection.module';
import { CoreModule } from './core/core.module';
import { AppErrorHandler } from './core/helpers/app-error-handler';
import { IntroService } from './intro.service';
import { PaymentModule } from './payment/payment.module';
import { SharedModule } from './shared/shared.module';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    GtagModule.forRoot({ trackingId: 'UA-122381354-2', trackPageviews: true }),
    RouterModule.forRoot([
      // otherwise redirect to home
      { path: '**', redirectTo: '' }
    ]),
    BrowserModule,
    SharedModule,
    CoreModule,
    AuthModule,
    CollectionModule,
    PaymentModule
  ],
  providers: [
    { provide: ErrorHandler, useClass: AppErrorHandler },
    IntroService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

