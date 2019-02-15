import { environment } from "../environments/environment";

export const apiUrl = environment.apiUrl;
export const MULTI_SELECT_SETTINGS = {
  singleSelection: false,
  text: "Select Countries",
  selectAllText: "Select All",
  unSelectAllText: "UnSelect All",
  enableSearchFilter: true
};
export const publishedDate = "{current_date_time}";
export const POST_COLORS = {
  INSIGHT: "#D9A460",
  QUESTION: "#005487",
  REVIEW: "#5C4925",
  PROMOTION: "#869565",
  INSPECTION: "#7EA8AD",
  UNANSWERED: "#005487",
  VENUE: "#005487",
  CVB: "#005487",
  REQUEST: "#7ebeb6"
};

export const activeDirectory = {
  tenant: environment.tenant,
  clientId: environment.clientId,
  redirectUri: environment.redirectUri,
  postLogoutRedirectUri: environment.postLogoutRedirectUri
};

export const API_KEY = environment.search_api_key;
export const SEARCH_URL = environment.SEARCH_URL;
export const API_VERSION = environment.API_VERSION;
export const INSIGHT_INDEX_NAME = environment.insightIndexName;
export const PROPERTY_INDEX_NAME = environment.propertyIndexName;
