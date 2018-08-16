import { Directive, ElementRef, Input } from '@angular/core';
declare var $: any;

@Directive({
  selector: '[appBlackoutHighlight]'
})
export class BlackoutHighlightDirective {
  @Input('elementIdToHighlight') elementIdToHighlight: string;
  @Input('appBlackoutHighlight') isActive: any;

  constructor(el: ElementRef) {
    let overlay = document.getElementById('appBlackoutHightlightOverlay')
    if (!overlay) {
      overlay = document.createElement("DIV")
      overlay.id = 'appBlackoutHightlightOverlay';
      document.body.appendChild(overlay);
    }
    let self = this;
    el.nativeElement.addEventListener('click', function (e) {
      if (!self.isActive) return false;
      document.body.classList.add('withinIntro');
      let elementToHighlight = document.getElementById(self.elementIdToHighlight);
      let currentZIndex = elementToHighlight.style.zIndex;
      let currentPosition = elementToHighlight.style.position;
      elementToHighlight.style.zIndex = '9999999';
      elementToHighlight.style.position = 'relative';
      let scrollX = window.scrollX;
      let scrollY = window.scrollY;
      window.scrollTo(0, 0);
      $(overlay).fadeIn(300);
      $(overlay).fadeOut(300, () => {
        document.body.classList.remove('withinIntro');
        elementToHighlight.style.zIndex = currentZIndex;
        elementToHighlight.style.position = currentPosition;
        window.scrollTo(scrollX, scrollY);
      });

    })
  }
}
