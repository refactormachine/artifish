import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AppError } from '../../shared/models/app-error';
import { environment } from '../../../environments/environment';

@Injectable()
export class PurchaseOptionService {
  private baseUrl: string = environment.apiHost + "/purchase_options/"

  constructor(protected http: HttpClient) { }

  getMaxPrice(): Observable<any> {
    return this.http.get(this.baseUrl + "max_price")
      .catch(this.handleError);
  }

  private handleError(response: HttpErrorResponse) {
    return Observable.throw(new AppError(response.error));
  }
}
