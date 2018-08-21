import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../../../shared/services/data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BetaLoginComponent } from '../beta-login/beta-login.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  fragment: string;

  constructor(
    private dataService: DataService,
    private router: Router,
    private route: ActivatedRoute) {
      localStorage.setItem("betaLogin", "4646");
    }

  ngOnInit() {
    document.body.classList.add('home-background');
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
    document.body.classList.remove('home-background');
  }

  start() {
    if (!this.dataService.data) this.dataService.data = {}
    this.dataService.data.startWithTour = false;
    this.router.navigate(['start']);
  }

  startWithTour() {
    this.dataService.data.startWithTour = true;
    this.router.navigate(['start']);
  }
}
