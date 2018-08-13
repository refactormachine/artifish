import { Injectable } from '@angular/core';
import { IntroJs } from 'intro.js';

@Injectable()
export class IntroService {
  
  private _introInstance: IntroJs;
  private callbacks: Callbacks;
  public step: number;
  public withinIntro = false;
  
  isWithinIntro() {
    return this.withinIntro;
  }
  
  constructor() {

  }
  startTour () {
    const intro: IntroJs = introJs();

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
