import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { AppError } from '../../shared/models/app-error';

@Injectable()
export class PortfolioItemService {
  private baseUrl: string = environment.apiHost + "/portfolio_items/"

  constructor(private http: HttpClient) { }

  search(
    filters: { queryTags: any[], tags: any[], color: string, material: any, size: { width: string, height: string }, minPrice: any, maxPrice: any },
    page: number,
    pageSize: number
  ): Observable<any> {
    let tagsParam = this.buildTagParams(filters.tags);
    let queryTagsParam = this.buildTagParams(filters.queryTags);
    let params: any = { tags: tagsParam, query: queryTagsParam, page: page, per_page: pageSize };
    if (filters.color) params.color = filters.color;
    if (filters.material) params.material = filters.material;
    if (filters.size.width) params.width = filters.size.width;
    if (filters.size.height) params.height = filters.size.height;
    if (filters.minPrice != null) params.min_price = filters.minPrice;
    if (filters.maxPrice != null) params.max_price = filters.maxPrice;
    return this.http.get(this.baseUrl, { params: params })
      .catch(this.handleError);
  }

  getRandomly(): Observable<any> {
    return this.http.get(this.baseUrl)
      .catch(this.handleError);
  }

  private handleError(response: HttpErrorResponse) {
    return Observable.throw(new AppError(response.error));
  }

  private buildTagParams(tags: any[]): string {
    let tagsQuery = '';
    for (let i = 0; i < tags.length; i++) {
      const tagObj = tags[i];
      tagsQuery += tagObj.name.replace(' ', '_');
      tagsQuery += '+';
    }
    tagsQuery = tagsQuery.slice(0, -1); //remove the last + character
    return tagsQuery;
  }
}
