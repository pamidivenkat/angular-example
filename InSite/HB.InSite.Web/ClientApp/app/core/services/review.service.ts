import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";

import { Review, AssociateReview } from "../models/review";
import { DataService } from "./data.service";
import { ReviewRequest } from "../models/review-request";

@Injectable()
export class ReviewService {
  constructor(private _dataService: DataService) {}

  private _getReviews(url: string, params: HttpParams, id?: number): Observable<any> {
    url = url + (id ? "/" + id : "");
    return this._dataService.get(url, params);
  }

  getLatestReviews(options?: any): Observable<any> {
    let params: HttpParams;
    if (options && options.answered == false) {
      params = new HttpParams()
        .set("maxId", options && options.maxId ? options.maxId : 0)
        .set("count", options && options.count ? options.count : 30)
        .set("includeItems", options && options.includeItems ? options.includeItems : true)
        .set("answered", "false")
        .set("types", "2");
    } else {
      params = new HttpParams()
        .set("maxId", options && options.maxId ? options.maxId : 0)
        .set("count", options && options.count ? options.count : 30)
        .set("includeItems", options && options.includeItems ? options.includeItems : true);
    }
    return this._getReviews("reviews", params);
  }

  getRequestedReviews(options?: any): Observable<any> {
    let params: HttpParams = new HttpParams();
    if (options) {
      params.set("maxId", options.maxId);
      params.set("count", options.count);
    }

    return this._getReviews("reviewrequests", params);
  }

  getReviewById(id: number, includeItems?: boolean): Observable<any> {
    let params = new HttpParams();
    if (includeItems) {
      params = new HttpParams().set("includeItems", String(includeItems));
    }
    return this._dataService.get(`reviews/${id}`, params);
  }

  createReview(review: Review): Observable<any> {
    let url = review.postType === "C" ? "reviews/ClientReview" : "reviews/AssociateReview";
    return this._dataService.post(url, review);
  }
  createAssociateReview(associateReview: AssociateReview): Observable<any> {
    return this._dataService.post("reviews/AssociateReview", associateReview);
  }
  createClientReview(clientReview: Review): Observable<any> {
    return this._dataService.post("reviews/ClientReview", clientReview);
  }

  updateReview(review: Review | AssociateReview): Observable<any> {
    return this._dataService.put("reviews/" + review.reviewId, review);
  }

  deleteReview(id: string): Observable<any> {
    return this._dataService.delete("reviews", id);
  }

  getLatestAnswers(userId: string, options?: any) {
    let params: HttpParams;
    if (options) {
      params = new HttpParams().set("maxId", options.maxId);
    }
    return this._dataService.get(`answers/byuserid/${userId}`, params);
  }

  getReviewsForSearch(type: string, id: number) {
    return this.getLatestReviews();
  }

  getReviewsByUser(userId: string, options?: any) {
    let params: HttpParams;
    if (options) {
      params = new HttpParams()
        .set("count", options.count ? options.count : 30)
        .set("maxId", options.maxId ? options.maxId : 0)
        .set("includeItems", options.includeItems ? options.includeItems : true);
    }
    return this._dataService.get(`reviews/byuserid/${userId}`, params);
  }

  public createReviewRequest(request: ReviewRequest): Observable<any> {
    return this._dataService.post(`reviewrequests`, request);
  }

  public checkForExistingReview(propertyId: number): Observable<any> {
    return this._dataService.get(`reviewrequests/checkforexisting/${propertyId}`);
  }

  public getExpiringCount(userId: string): Observable<any> {
    return this._dataService.get(`reviews/byuserid/${userId}/ExpirationCount`);
  }

  public getExpiringData(userId: string): Observable<any> {
    return this._dataService.get(`reviews/byuserid/${userId}?aboutToExpire=true`);
  }

  public reRequest(id: number): Observable<any> {
    return this._dataService.put(`reviewrequests/rerequest/${id}`);
  }

  public archiveReview(id: number): Observable<any> {
    return this._dataService.put(`reviews/archive/${id}`);
  }
}
