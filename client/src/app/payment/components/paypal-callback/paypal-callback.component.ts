import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AlertService } from '../../../shared/services/alert.service';
import { TRANSLATE } from '../../../translation-marker';
import { PaymentService } from '../../services/payment.service';
import { PaymentProcessorError } from '../../models/payment-errors';
import { AppError } from '../../../shared/models/app-error';
import { DataService } from '../../../shared/services/data.service';

@Component({
  selector: 'paypal-callback',
  template: `<h1 class="d-inline-block">{{'paypal_callback.processing' | translate}}...</h1><i class="fa fa-spinner fa-spin fa-3x"></i>`
})
export class PaypalCallbackComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private dataService: DataService,
    private alertService: AlertService) { }

  ngOnInit() {
    this.extractParamsAndNavigateToPaymentConfirmation();
  }

  extractParamsAndNavigateToPaymentConfirmation() {
    let returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    let orderId = this.route.snapshot.queryParamMap.get('order');
    let amount = this.route.snapshot.queryParamMap.get('amount');
    let currencyCode = this.route.snapshot.queryParamMap.get('currency_code');
    let token = this.route.snapshot.queryParamMap.get('token');
    let payerId = this.route.snapshot.queryParamMap.get('PayerID');
    if (!returnUrl || !amount || !currencyCode || !token || !payerId) {
      this.alertService.error(TRANSLATE("paypal_callback.error_has_occured_in_paypal_payment"), true);
      this.router.navigate([returnUrl || '/']);
      return;
    }

    this.makePayPalPayment(orderId, token, payerId).subscribe(
      payment => {
        if (!this.dataService.data) this.dataService.data = {};
        this.dataService.data['payment'] = payment;
        this.router.navigate(['/purchase/success']);
      },
      (error: AppError) => {
        this.router.navigateByUrl(returnUrl);
        if (error instanceof PaymentProcessorError) {
          this.alertService.error(TRANSLATE("pay_flow_confirmation.your_transaction_could_not_be_processed"), true);
        } else if (error.message == "payment_was_already_processed") {
          this.router.navigate(['/']);
        } else throw error;
      }
    )
  }

  private makePayPalPayment(orderId, token, payerId) {
    return this.paymentService.createPaypalPayment(orderId, token, payerId);
  }
}
