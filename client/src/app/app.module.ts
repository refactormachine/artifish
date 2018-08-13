import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { AppErrorHandler } from './core/helpers/app-error-handler';
import { SharedModule } from './shared/shared.module';
import { CollectionModule } from './collection/collection.module';
import { PaymentModule } from './payment/payment.module';
import { IntroService } from './intro.service';


@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
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

