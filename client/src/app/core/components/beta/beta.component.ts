import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../../../shared/services/data.service';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BetaLoginComponent } from '../beta-login/beta-login.component';

@Component({
  selector: 'app-beta',
  templateUrl: './beta.component.html',
  styleUrls: ['./beta.component.css']
})
export class BetaComponent implements OnInit, OnDestroy {
  betaLoggedIn: boolean = false;

  constructor(
    private dataService: DataService,
    private router: Router,
    private modalService: NgbModal) {
    this.betaLoggedIn = localStorage.getItem("betaLogin") == "4646";
  }

  ngOnInit() {
    document.body.classList.add('home-background');
  }

  ngOnDestroy() {
    document.body.classList.remove('home-background');
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
