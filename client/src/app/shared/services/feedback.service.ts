import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { AppError } from '../models/app-error';
import { NotFoundError } from '../models/not-found-error';

@Injectable()
export class FeedbackService {
  private baseUrl: string = environment.apiHost + "/feedbacks/"

  constructor(private http: HttpClient) { }

  getLast(): Observable<any> {
    return this.http.get(this.baseUrl + 'last')
      .catch(this.handleError);
  }

  create(feedback: { feedbackSubjectName: string, score: string | number }): Observable<any> {
    return this.http.post(this.baseUrl, feedback)
      .catch(this.handleError);
  }

  private handleError(response: HttpErrorResponse) {
    if (response.status == 404) {
      return Observable.throw(new NotFoundError(response.error));
    }

    return Observable.throw(new AppError(response.error));
  }
}
