import { select } from "@angular-redux/store";
import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { distinctUntilChanged } from "rxjs/operators";
import { Observable } from "rxjs/Rx";

import { Post } from "../models/post";
import { DataService } from "./data.service";

@Injectable()
export class PostService {
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

  private _getPosts(url: string, params: HttpParams, id?: number): Observable<any> {
    url = url + (id ? "/" + id : "");
    return this._dataService.get(url, params);
  }

  getLatestPosts(options?: any): Observable<any> {
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
        .set("includeItems", options && options.includeItems ? options.includeItems : true)
        .set("types", options && options.types ? options.types : 0);
    }

    return this._getPosts("posts", params);
  }

  getRequestedReviews(options: any): Observable<any> {
    let params: HttpParams;
    params = new HttpParams()
      .set("maxId", options && options.maxId ? options.maxId : 0)
      .set("count", options && options.count ? options.count : 30);

    return this._getPosts("reviewrequests", params);
  }

  getPostById(id: number, includeItems: boolean): Observable<any> {
    const params = new HttpParams().set("includeItems", String(includeItems)).set("includeArchive", String(true));
    return this._getPosts("posts", params, id);
  }

  createPost(post: Post): Observable<any> {
    return this._dataService.post("posts", post);
  }

  updatePost(post: Post): Observable<any> {
    return this._dataService.put("posts/" + post.id, post);
  }

  deletePost(id: string): Observable<any> {
    return this._dataService.delete("posts", id);
  }

  getLatestAnswers(userId: string, options?: any) {
    let params: HttpParams;
    if (options) {
      params = new HttpParams().set("maxId", options.maxId);
    }
    return this._dataService.get(`answers/byuserid/${userId}`, params);
  }

  getPostsByUser(userId: string, options: any) {
    let params: HttpParams;

    params = new HttpParams()
      .set("maxId", options && options.maxId ? options.maxId : 0)
      .set("count", options && options.count ? options.count : 30);

    if (options.types) {
      params = new HttpParams()
        .set("maxId", options && options.maxId ? options.maxId : 0)
        .set("count", options && options.count ? options.count : 30)
        .set("types", options && options.types ? options.types : 0);
    }

    return this._dataService.get(`posts/byuserid/${userId}`, params);
  }

  public getExpiringCount(userId: string): Observable<any> {
    return this._dataService.get(`posts/byuserid/${userId}/ExpirationCount`);
  }

  public getExpiringData(userId: string): Observable<any> {
    return this._dataService.get(`posts/byuserid/${userId}?aboutToExpire=true`);
  }

  public getAdvertisement(): Observable<any> {
    return this._dataService.get("ads");
  }

  public searchPostsWithAzure(searchText: string, filters?: Array<string>): Observable<any> {
    return this._dataService.search(searchText, this._resultCount, filters);
  }

  public searchPosts(searchText: string, isLocationSearch: boolean, filters?: Array<string>) {
    let url = `search/${searchText}` + (filters.length > 0 ? `?filter=${filters.join(" and ")}` : "");
    if (isLocationSearch) {
      url = `search/location/${searchText}` + (filters.length > 0 ? `?filter=${filters.join(" and ")}` : "");
    }
    return this._dataService.get(url);
  }

  public reAskQuestion(id: number): Observable<any> {
    return this._dataService.put(`posts/reaskquestion/${id}`);
  }
}
