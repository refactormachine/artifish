import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { DataService } from '../../../shared/services/data.service';

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
    if (!this.dataService.data) this.dataService.data = {}
    this.dataService.data.startWithTour = false;
    this.router.navigate(['start']);
  }

  startWithTour() {
    this.dataService.data.startWithTour = true;
    this.router.navigate(['start']);
  }
}
