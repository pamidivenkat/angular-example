// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,

  // apiUrl: "http://localhost:5200/api/v1/",
  apiUrl: "https://hbinsiteapidev.azurewebsites.net/api/v1/",
  tenant: "fcd19f99-b7bc-4971-83cf-483db5666306",
  clientId: "baaaca8d-6d62-4e4a-b1f7-28ec50871d14",
  redirectUri: "http://localhost:4200/auth-callback",
  postLogoutRedirectUri: "http://localhost:4200",
  insightIndexName: "insights",
  propertyIndexName: "properties",
  search_api_key: "9E0CB57A4A9333EDCD9A19CB3EDFFBE4",
  SEARCH_URL: "https://hb.search.windows.net",
  API_VERSION: "2017-11-11"
};
