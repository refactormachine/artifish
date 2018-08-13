import { Injectable } from '@angular/core';
import { IntroJs } from 'intro.js';
import { TranslateService } from '../../node_modules/@ngx-translate/core';
import { TRANSLATE } from './translation-marker';
import { environment } from '../environments/environment';

@Injectable()
export class IntroService {
  private _introInstance: IntroJs;
  private callbacks: Callbacks;
  public step: number;
  private withinIntro = false;

  isWithinIntro() {
    return this.withinIntro;
  }

  constructor(private translateService: TranslateService) {}

  startTour () {
    this.translateService.get([TRANSLATE('intro.next'), TRANSLATE('intro.back'), TRANSLATE('intro.skip'), TRANSLATE('intro.done')]).subscribe(
      res => {
        const intro: IntroJs = introJs().setOptions({
          nextLabel: res['intro.next'],
          prevLabel: res['intro.back'],
          skipLabel: res['intro.skip'],
          doneLabel: res['intro.done'],
          tooltipClass: environment.rtl ? 'rtl' : ''
        });

        intro.onexit(this.onEnd);
        intro.oncomplete(this.onEnd);
        intro.onchange(ele => {
          this.step = parseInt(ele.dataset.step, 10);
        });

        this._introInstance = intro;

        this._introInstance.start();
        document.body.classList.add('withinIntro');
        this.withinIntro = true;
      }
    );
  }
  // this hack allows other views to add the callbacks needed for the tour to work
  addActionsFromApp(callbacks: Callbacks) {
    this.callbacks = callbacks;
  }
  onEnd = () => {
    document.body.classList.remove('withinIntro');
    this.withinIntro = false;
  }
}

interface Callbacks {
  activateFakeCollection: Function;
  deactivateFakeCollection: Function;
}
