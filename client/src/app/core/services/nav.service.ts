import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class NavService {
  public CART_NAV_ITEM: string = "_CART";
  public START_TOUR_NAV_ITEM: string = "_START_TOUR";

  private _navItemSource = new BehaviorSubject<string>("");
  private _collectionItemCountSource = new BehaviorSubject<number>(0);

  // Observable navItem stream
  navItem$ = this._navItemSource.asObservable();
  collectionItemCount$ = this._collectionItemCountSource.asObservable();

  // service command
  changeNav(navItem: string) {
    this._navItemSource.next(navItem);
  }

  changeCollectionItemCount(collectionItemCount: number) {
    this._collectionItemCountSource.next(collectionItemCount);
  }
}
