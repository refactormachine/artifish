import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../../../shared/services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(
    private dataService: DataService,
    private router: Router) { }

  ngOnInit() {
    document.body.classList.add('home-background');
  }

  ngOnDestroy() {
    document.body.classList.remove('home-background');
  }

  start() {
    this.dataService.data.startWithTour = false;
    this.router.navigate(['start']);
  }

  startWithTour() {
    this.dataService.data.startWithTour = true;
    this.router.navigate(['start']);
  }
}
