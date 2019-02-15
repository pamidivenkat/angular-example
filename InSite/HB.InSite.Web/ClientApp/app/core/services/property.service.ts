import { select } from "@angular-redux/store";
import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";

import { DataService } from "./data.service";

@Injectable()
export class PropertyService {
  private _resultCount: number;

  @select(["settings", "values"])
  private _settings$: Observable<Array<any>>;

  constructor(private _dataService: DataService) {
    this._settings$.pipe(distinctUntilChanged()).subscribe(settings => {
      if (settings) {
        this._resultCount = settings.find(setting => setting.name === "Search:Results").value;
      } else {
        this._resultCount = 75;
      }
    });
  }

  public getPropertyById(id: number): Observable<any> {
    return this._dataService.get(`properties/propertyid/${id}`);
  }

  public getContentByPropertyId(id: number, types: number, options?: any): Observable<any> {
    let params: HttpParams = new HttpParams()
      .set("maxId", options && options.maxId ? options.maxId : 0)
      .set("count", options && options.count ? options.count : 30)
      .set("types", types ? types.toString() : "")
      .set("includeArchive", options && options.includeArchive ? options.includeArchive : false);
    return this._dataService.get(`properties/content/${id}`, params);
  }

  public getReviewsByPropertyId(id: number): Observable<any> {
    return this._dataService.get(`properties/reviews/${id}`);
  }

  public getPropertiesByName(searchText: string): Observable<any> {
    return this._dataService.get(`properties/search/${searchText}`);
  }

  public getPropertyChainsByName(searchText: string): Observable<any> {
    return this._dataService.get(`propertychains/search/${searchText}`);
  }

  public getLocationsByName(searchText: string): Observable<any> {
    return this._dataService.get(`locations/search/${searchText}`);
  }

  public getCVBContact(id: number): Observable<any> {
    return this._dataService.get(`properties/cvb/${id}/contact`);
  }

  public getPropertyReport(
    reportType: string,
    propertyId: number,
    currencyType: number,
    type?: string
  ): Observable<any> {
    let requestURL = `reports/${reportType}/${propertyId}`;
    requestURL += type ? `/${type}` : "";
    requestURL += `/${currencyType}`;

    return this._dataService.get(requestURL);
  }

  public getCurrencies(): Observable<any> {
    return this._dataService.get("Currencies");
  }

  public searchProperties(searchText: string, filters?: Array<string>): Observable<any> {
    return this._dataService.search(searchText + "~&$searchMode=all&$queryType=full", this._resultCount, filters, true);
  }

  public uploadImage(propertyId: number, file: FormData): Observable<any> {
    return this._dataService.imageUpload(`properties/${propertyId}`, file);
  }

  public removeImage(propertyId: number): Observable<any> {
    return this._dataService.put(`properties/${propertyId}`, null);
  }
}
