import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-beta-login',
  templateUrl: './beta-login.component.html',
  styleUrls: ['./beta-login.component.css']
})
export class BetaLoginComponent implements OnInit {
  returnUrl: string;
  passcode: string = "";
  badLogin: boolean = false;
  direction: string;

  constructor(
    public activeModal: NgbActiveModal) {
      this.direction = environment.rtl ? "rtl" : "ltr";
    }

  ngOnInit() {
  }

  login() {
    if (this.passcode == "4646") {
      localStorage.setItem("betaLogin", this.passcode);
      this.activeModal.close({success: true});
    } else {
      this.badLogin = true;
    }
  }
}
