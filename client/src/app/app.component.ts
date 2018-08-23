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

    // if (!isDevMode()) {
    //   this.localeLoading = true;
    //   this.redirectToLocaleSite();
    // }
  }

  private newVersionInitialization() {
    if (localStorage.getItem('version') !== 'v1') {
      localStorage.clear();
    }
    localStorage.setItem('version', 'v1');
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
