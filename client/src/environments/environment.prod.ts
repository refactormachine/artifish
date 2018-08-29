export const environment = {
  production: true,
  apiHost: "https://artifish-api.tk/",
  googleAuth: {
    clientId: "569091726571-bvso1l18162d0oukl39utgbbd7j1kjjm.apps.googleusercontent.com",
    authorizationUri: "https://accounts.google.com/o/oauth2/v2/auth",
    redirectUri: "https://artifish.github.io/artifish/auth/google",
    scopes: ['email', 'profile']
  },
  facebookAuth: {
    clientId: "2157048681220034",
    authorizationUri: "https://www.facebook.com/v3.1/dialog/oauth",
    redirectUri: "https://artifish.github.io/artifish/auth/facebook",
    scopes: ['email', 'public_profile']
  }
};
