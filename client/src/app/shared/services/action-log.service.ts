import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { AppError } from '../models/app-error';

@Injectable()
export class ActionLogService {
  private baseUrl: string = environment.apiHost + "/action_logs"

  constructor(private http: HttpClient) { }

  create(actionLog): Observable<any> {
    return this.http.post(this.baseUrl, actionLog)
      .catch(this.handleError);
  }

  private handleError(response: HttpErrorResponse) {
    return Observable.throw(new AppError(response.error));
  }
}
