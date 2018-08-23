import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../environments/environment';
import { JoinBetaService } from '../../services/join-beta.service';

@Component({
  selector: 'app-beta-login',
  templateUrl: './beta-login.component.html',
  styleUrls: ['./beta-login.component.css']
})
export class BetaLoginComponent implements OnInit {
  returnUrl: string;
  passcode: string = "";
  badLogin: boolean = false;
  emailSent: boolean = false;
  requestingPassword: boolean = false;
  requestingPasswordLoading: boolean = false;
  userEmail: string;
  direction: string;

  constructor(
    public activeModal: NgbActiveModal,
    private joinBetaService: JoinBetaService) {
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

  requestBetaPassword() {
    this.requestingPasswordLoading = true;
    this.joinBetaService.create(this.userEmail).subscribe(res => {
      this.requestingPasswordLoading = false;
      this.emailSent = true;
      this.activeModal.dismiss();
    });
  }

  showRequestForPassword(requestingPassword: boolean) {
    this.requestingPassword = requestingPassword;
  }
}
