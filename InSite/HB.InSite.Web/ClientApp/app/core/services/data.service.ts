import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { Observable } from "rxjs/Rx";

import * as constants from "../../app.constants";
import { AuthenticationService } from "./authentication.service";
import { SnackbarService } from "./snackbar.service";

@Injectable()
export class DataService {
  private _apiUrl: string;

  constructor(
    private _httpClient: HttpClient,
    private _snackbarService: SnackbarService,
    private _authService: AuthenticationService
  ) {
    this._apiUrl = constants.apiUrl;
  }

  private _getHeaders() {
    const token = `Bearer ${localStorage.getItem("adal.idtoken")}`;

    return new HttpHeaders()
      .set("Content-Type", "application/json")
      .set("Access-Control-Allow-Origin", "*")
      .set("Authorization", token);
  }

  public get(url: string, params?: HttpParams): Observable<any> {
    const headers = this._getHeaders();
    return this._httpClient
      .get(this._apiUrl + url, { params: params, headers: headers })
      .pipe(map(response => response))
      .catch(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          //Logout user when user toke expires.
          this._authService.logout();
        }
        return of(error);
      });
  }

  public search(
    searchString: string,
    resultCount: number,
    searchFilters: Array<string>,
    searchVenues: boolean = false
  ): Observable<any> {
    const headers = new HttpHeaders().set("api-key", constants.API_KEY).set("Access-Control-Allow-Origin", "*");

    //let searchIndex = searchVenues ? "properties" : "insights";
    let searchIndex = searchVenues ? constants.PROPERTY_INDEX_NAME : constants.INSIGHT_INDEX_NAME;

    let searchURL = `${constants.SEARCH_URL}/indexes/${searchIndex}/docs?api-version=${
      constants.API_VERSION
    }&$top=${resultCount}&$skip=0&$count=true&search=${searchString}`;

    if (searchFilters && searchFilters.length > 0) {
      searchURL += `&$filter=${searchFilters.join(" and ")}`;
    }

    return this._httpClient.get(searchURL, { headers: headers });
  }

  public post(url: string, body: any): Observable<any> {
    const headers = this._getHeaders();
    return this._httpClient
      .post(this._apiUrl + url, body, { headers: headers })
      .pipe(map(response => response))
      .catch(error => {
        return of(error);
      });
  }

  public put(url: string, body?: any): Observable<any> {
    const headers = this._getHeaders();
    return this._httpClient.put(this._apiUrl + url, body, { headers: headers }).pipe(
      map(response => response),
      catchError(error => this.handleError(error))
    );
  }

  public delete(url: string, id: string): Observable<any> {
    const headers = this._getHeaders();
    return this._httpClient.delete(`${this._apiUrl}${url}/${id}`, { headers: headers }).pipe(
      map(response => response),
      catchError(error => this.handleError(error))
    );
  }

  public imageUpload(url: string, formData: FormData): Observable<any> {
    let headers = new HttpHeaders()
      .set("cache-control", "no-cache")
      .set("Authorization", `Bearer ${localStorage.getItem("adal.idtoken")}`);

    return this._httpClient.put(this._apiUrl + url, formData, {
      headers: headers,
      responseType: "text"
    });
  }

  private handleError(error: any) {
    this._snackbarService.error(error.error ? error.error : error.status);
    if (error instanceof HttpErrorResponse && error.status === 401) {
      //Logout user when user toke expires.
      this._authService.logout();
    }
    return Observable.throw(error.status);
  }
}
