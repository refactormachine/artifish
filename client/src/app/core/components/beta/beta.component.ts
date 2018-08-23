import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { environment } from '../../../../environments/environment';
import { DataService } from '../../../shared/services/data.service';
import { BetaLoginComponent } from '../beta-login/beta-login.component';

@Component({
  selector: 'app-beta',
  templateUrl: '../home/home.component.html',
  styleUrls: ['../home/home.component.css']
})
export class BetaComponent implements OnInit, OnDestroy {
  fragment: string;

  constructor(
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: NgbModal) {
  }

  ngOnInit() {
    let backgroundClass = environment.rtl ? 'home-background-rtl' : 'home-background';
    document.body.classList.add(backgroundClass);
    this.route.fragment.subscribe(fragment => {
      this.fragment = fragment;
      if (!this.fragment) {
        window.scrollTo(0, 0);
      }
    });
  }

  ngAfterViewChecked(): void {
    try {
      if (this.fragment) {
        document.querySelector('#' + this.fragment).scrollIntoView();
      }
    } catch (e) { }
  }

  ngOnDestroy() {
    let backgroundClass = environment.rtl ? 'home-background-rtl' : 'home-background';
    document.body.classList.remove(backgroundClass);
  }

  start() {
    let callback = function () {
      if (!this.dataService.data) this.dataService.data = {}
      this.dataService.data.startWithTour = false;
      this.router.navigate(['start']);
    }.bind(this);
    if (!this.verifyBetaLoggedIn(callback)) return;
    callback();
  }

  startWithTour() {
    let callback = function () {
      this.dataService.data.startWithTour = true;
      this.router.navigate(['start']);
    }.bind(this);
    if (!this.verifyBetaLoggedIn(callback)) return;
    callback();
  }

  private verifyBetaLoggedIn(callback: Function) {
    if (localStorage.getItem("betaLogin") != "4646") {
      this.modalService.open(BetaLoginComponent).result.then(res => {
        if (res.success) {
          callback();
        }
      }).catch(res => { });
      return false;
    }

    return true;
  }
}
