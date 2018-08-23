import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { AppError } from '../../shared/models/app-error';
import { environment } from '../../../environments/environment';

@Injectable()
export class JoinBetaService {
  private baseUrl: string = environment.apiHost + "/join_beta/"

  constructor(private http: HttpClient) { }

  create(email: string): Observable<any> {
    return this.http.post(this.baseUrl, {email: email})
      .catch(this.handleError);
  }

  private handleError(response: HttpErrorResponse) {
    return Observable.throw(new AppError(response.error));
  }
}
