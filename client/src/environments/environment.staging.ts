import { environment as prodEnvironment } from './environment.prod';

export const environment = Object.assign(
  prodEnvironment, {
    apiHost: "https://artifish-staging.herokuapp.com/",
    siteVirtualDirectory: "/artifish",
    defaultLanguage: "en",
    rtl: false
  }
);
