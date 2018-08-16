import { Injectable, Output, EventEmitter } from '@angular/core';
import { IntroJs } from 'intro.js';
import { TranslateService } from '../../node_modules/@ngx-translate/core';
import { TRANSLATE } from './translation-marker';
import { environment } from '../environments/environment';

@Injectable()
export class IntroService {
  @Output('clickOnDisabledArea') clickOnDisabledAreaEvent = new EventEmitter<number>();
  public step: number;

  private _introInstance: IntroJs;
  private callbacks: Callbacks;
  private withinIntro = false;


  isWithinIntro() {
    return this.withinIntro;
  }

  constructor(private translateService: TranslateService) {}

  startTour (options = {}) {
    let self = this;
    this.translateService.get([TRANSLATE('intro.next'), TRANSLATE('intro.back'), TRANSLATE('intro.skip'), TRANSLATE('intro.done')]).subscribe(
      res => {
        const intro: IntroJs = introJs().setOptions({
          nextLabel: res['intro.next'],
          prevLabel: res['intro.back'],
          skipLabel: res['intro.skip'],
          doneLabel: res['intro.done'],
          tooltipClass: environment.rtl ? 'rtl' : '',
          scrollToElement: options['scrollToElement'] || false
        });

        intro.onexit(this.onEnd.bind(this));
        intro.oncomplete(this.onEnd.bind(this));
        intro.onchange(ele => {
          this.step = parseInt(ele.dataset.step, 10);
        });
        intro.onafterchange(ele => {
          (document.querySelector('.introjs-disableInteraction') as HTMLElement).onclick = this.onDisabledInteractionClick.bind(self);
        })

        this._introInstance = intro;

        this._introInstance.start();
        document.body.classList.add('withinIntro');
        this.withinIntro = true;
      }
    );
  }
  // this hack allows other views to add the callbacks needed for the tour to work
  addOnChangeCallback(onChange) {
    this._introInstance.onchange(onChange);
  }
  addOnEndCallback(onEnd: Function) {
    this._introInstance.oncomplete(onEnd);
  }
  addOnExitCallback(onExit: Function) {
    this._introInstance.onexit(onExit);
  }
  private onEnd() {
    document.body.classList.remove('withinIntro');
    this.withinIntro = false;
  }
  private onDisabledInteractionClick(e) {
    this.clickOnDisabledAreaEvent.emit(this.step);
    return true;
  }
}

interface Callbacks {
  onExit?: Function;
  onComplete?: Function;
  onChange?: Function;
}
