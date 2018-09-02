import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'feedback-modal',
  templateUrl: './feedback-modal.component.html',
  styleUrls: ['./feedback-modal.component.css']
})
export class FeedbackModalComponent implements OnInit {
  private _show: boolean = false;
  public popupAnimatedShow: boolean = false;
  public popupShow: boolean = false;
  @Input('direction') public direction: string = "ltr";
  @Output('close') closeEvent = new EventEmitter<any>();
  @Input('title') public title: string = "How likely are you to recommend this product to a friend or colleague?";
  @Input('leastLabelText') public leastLabelText: string = "Not likely";
  @Input('mostLabelText') public mostLabelText: string = "Very likely";
  @Input('buttons') public buttons: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  @Output('feedbackSubmit') feedbackSubmitEvent = new EventEmitter<string>();


  constructor() { }

  get show(): boolean {
    return this._show;
  }

  @Input('show')
  set show(show: boolean) {
    this._show = show;

    if (show) {
      this.popupShow = true;
      setTimeout(() => {
        this.popupAnimatedShow = true;
      }, 20);
    } else {
      this.popupAnimatedShow = false;
    }
  }


  ngOnInit() {
  }

  modalTransitionend() {
    this.popupShow = this.popupAnimatedShow;
  }

  closeModal() {
    this.popupShow = false;
    this.popupAnimatedShow = false;
    this.closeEvent.emit();
  }

  onFeedbackSubmit(buttonString: string) {
    this.feedbackSubmitEvent.emit(buttonString);
    this.popupShow = false;
    this.popupAnimatedShow = false;
  }
}
