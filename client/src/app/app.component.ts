import { Component, isDevMode } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';
import { LocationService } from './core/services/location.service';
import { Gtag } from 'angular-gtag';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  localeLoading: boolean = false;
  direction: string;

  constructor(private translate: TranslateService,
              private locationService: LocationService,
              gtag: Gtag) {
    translate.setDefaultLang(environment.defaultLanguage);
    this.direction = environment.rtl ? "rtl" : "ltr";
    this.newVersionInitialization();
    this.setClientUniqueId();

    // if (!isDevMode()) {
    //   this.localeLoading = true;
    //   this.redirectToLocaleSite();
    // }
  }

  private newVersionInitialization() {
    if (localStorage.getItem('version') !== 'v1') {
      let uuid = localStorage.getItem('uuid');
      localStorage.clear();
      localStorage.setItem('uuid', uuid);
    }
    localStorage.setItem('version', 'v1');
  }

  private setClientUniqueId() {
    if (localStorage.getItem('uuid') && localStorage.getItem('uuid').length == 36) return;

    let uuid = this.generateUUIDv4();
    localStorage.setItem('uuid', uuid);
  }

  private generateUUIDv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private redirectToLocaleSite() {
    this.locationService.getLocale().subscribe(
      locale => {
        this.localeLoading = false;
        let origin = window.location.origin;
        let pathname = window.location.pathname;
        let index = pathname.indexOf('/', 1)
        let url = origin + (index == -1 ? pathname : pathname.substring(0, index))
        let hebUrl = origin + "/artifish.il";
        if (locale == "he" && !url.toLowerCase().startsWith(hebUrl)) {
          window.location.href = origin + pathname.replace("/artifish", "/artifish.il");
        }
        if (locale == "en" && url.toLowerCase().startsWith(hebUrl)) {
          window.location.href = origin + pathname.replace("/artifish.il", "/artifish");
        }
      }, err => {
        this.localeLoading = false;
        this.translate.setDefaultLang(environment.defaultLanguage);
      });}
}
