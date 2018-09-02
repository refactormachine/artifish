import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AlertComponent } from './components/alert/alert.component';
import { AlertService } from './services/alert.service';
import { DataService } from './services/data.service';
import { ImageModalComponent } from './components/image-modal/image-modal.component';
import { CanvasModalComponent } from './components/canvas-modal/canvas-modal.component';
import { BlackoutHighlightDirective } from './directives/blackout-highlight.directive';
import { ActionLogService } from './services/action-log.service';
import { FeedbackModalComponent } from './components/feedback-modal/feedback-modal.component';
import { FeedbackService } from './services/feedback.service';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    AlertService,
    DataService,
    ActionLogService,
    FeedbackService
  ],
  declarations: [
    AlertComponent,
    ImageModalComponent,
    CanvasModalComponent,
    BlackoutHighlightDirective,
    FeedbackModalComponent
  ],
  exports: [
    AlertComponent,
    ImageModalComponent,
    CanvasModalComponent,
    CommonModule,
    HttpClientModule,
    FormsModule,
    TranslateModule,
    BlackoutHighlightDirective,
    FeedbackModalComponent
  ]
})
export class SharedModule { }

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/');
}
