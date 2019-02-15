import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";

import { Category } from "../models/category";
import { DataService } from "./data.service";
import { HttpParams } from "@angular/common/http";

@Injectable()
export class CategoryService {
  constructor(private _dataService: DataService) {}

  private _getCategory(id?: number): Observable<any> {
    let url = "categories";
    let params;
    if (id) {
      url += "/" + id;
    } else {
      params = new HttpParams().set("all", "true");
    }
    return this._dataService.get(url, params ? params : {});
  }

  public updateCategory(category: any): Observable<any> {
    if (category.id && category.id > 0) {
      return this._dataService.put(`categories/${category.id}`, category);
    } else {
      category.id = 0;
      return this._dataService.post(`categories`, category);
    }
  }

  public deleteCategory(categoryId: any): Observable<any> {
    return this._dataService.delete(`categories`, categoryId);
  }

  public getAllCategories(): Observable<any> {
    return this._getCategory();
  }

  public getCategoryById(id: number): Observable<Category> {
    return this._getCategory(id);
  }
}
