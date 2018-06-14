// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  nonauth: false,
  appUrl: "http://localhost:8000",
  stsURL: "https://localhost:44300",
  apiUrl: "https://localhost:44301/api/",
  v1AppUrl: "https://localhost:44309",
  reportingURL: "https://localhost:44313",
  wizardURl : "https://localhost:44310",
  offlineAppURL: "https://localhost:44311",
  secureCookies: false
};