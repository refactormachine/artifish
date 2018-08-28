import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../shared/services/data.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-payment',
  templateUrl: './payment-confirmation.component.html',
  styleUrls: ['./payment-confirmation.component.css']
})
export class PaymentConfirmationComponent implements OnInit {
  payment: any = {};
  order: any = {};

  constructor(
    private dataService: DataService,
    private router: Router) { }

  ngOnInit() {
    this.payment = this.dataService.data.payment;
    delete this.dataService.data.payment;
    if (this.payment) this.order = this.payment.order;
    if (!this.payment || !this.order) {
      this.router.navigate(['/']);
    }
  }
}
