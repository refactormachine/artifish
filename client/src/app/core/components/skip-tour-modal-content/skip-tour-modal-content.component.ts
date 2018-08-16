import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '../../../../../node_modules/@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-skip-tour-modal-content',
  template: `
    <div [attr.dir]="direction" [ngClass]="direction">
      <div class="modal-body">
        <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
          <span aria-hidden="true">&times;</span>
        </button>
        <h4 class="modal-title" id="modal-basic-title">{{'core.eager_to_start?' | translate}}</h4>
        <p>{{'core.you_can_skip_the_tour_message' | translate}}</p>
      </div>
    </div>
  `
})
export class SkipTourModalContentComponent {
  direction: string;

  constructor(public activeModal: NgbActiveModal) {
    this.direction = environment.rtl ? "rtl" : "ltr";
  }
}
