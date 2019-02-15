import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { DataService } from "../../core/services/data.service";
import { HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: "root"
})
export class AdminService {
  constructor(private _dataService: DataService) {}

  public getExpirationsSettings(): Observable<any> {
    return this._dataService.get(`applicationsettings/startswith/expiration`);
  }

  public getPointsSettings(): Observable<any> {
    return this._dataService.get(`applicationsettings/startswith/points`);
  }

  public getSynonymsSettings(): Observable<any> {
    return this._dataService.get(`synonyms`);
  }

  saveSynonym(synonym: any): Observable<any> {
    if (synonym[0].synonymId && synonym[0].synonymId > 0) {
      return this._dataService.put(`synonyms`, synonym);
    } else {
      return this._dataService.post(`synonyms`, synonym[0]);
    }
  }
  deleteSynonym(id: string): Observable<any> {
    return this._dataService.delete(`synonyms`, id);
  }

  public getClientReview(options?: any): Observable<any> {
    let params: HttpParams = new HttpParams();
    if (options) {
      params = params
        .set("maxId", options.maxId ? options.maxId : 0)
        .set("count", options.count ? options.count : 100)
        .set("status", options.status !== undefined ? options.status : -1)
        .set("propertyId", options.propertyId ? options.propertyId : 0)
        .set("sortBy", options.sortBy ? options.sortBy : "")
        .set("pageIndex", options.pageIndex ? options.pageIndex : 0)
        .set("postType", "C")
        .set("includeItems", "true");
    }
    return this._dataService.get(`reviews/clientreviews`, params);
  }

  public deleteReview(id: string): Observable<any> {
    return this._dataService.delete(`reviews/`, id);
  }

  public getAdvertisementsSettings(): Observable<any> {
    return this._dataService.get(`ads/getall`);
  }

  public deleteAdvertisement(id: string): Observable<any> {
    return this._dataService.delete(`ads/`, id);
  }

  public saveAdvertisement(ads: any): Observable<any> {
    ads.advertisementId = parseInt(ads.advertisementId)
      ? parseInt(ads.advertisementId)
      : 0;
    if (ads.advertisementId && ads.advertisementId > 0) {
      return this._dataService.put(`ads/`, ads);
    } else {
      return this._dataService.post(`ads`, ads);
    }
  }

  public getGeneralSettings(): Observable<any> {
    return this._dataService.get(`applicationsettings`);
  }
}
