import { HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { DataService } from "./data.service";

const API = "inspections";

@Injectable({
  providedIn: "root"
})
export class InspectionService {
  constructor(private _dataService: DataService) {}

  getInspectionsByUser(userId: string, options?: any): Observable<any> {
    let params: HttpParams;
    if (options) {
      params = new HttpParams()
        .set("maxId", options.maxId ? options.maxId : 0)
        .set("includeItems", "true");
      if (options.types) {
        params = new HttpParams()
          .set("maxId", options.maxId ? options.maxId : 0)
          .set("includeItems", "true")
          .set("types", options.types);
      }
    }

    return this._dataService.get(`${API}/byuserid/${userId}`, params);
  }

  getInspectionDetails(id: number): Observable<any> {
    return this._dataService.get(`${API}/${id}?includeItems=true`);
  }
}
