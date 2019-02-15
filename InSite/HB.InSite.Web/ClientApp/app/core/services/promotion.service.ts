import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { DataService } from "./data.service";

@Injectable({
  providedIn: "root"
})
export class PromotionService {
  constructor(private _dataService: DataService) {}

  getPromotionById(id: number): Observable<any> {
    return this._dataService.get(`promotions/GetPromotion/${id}`);
  }

  getAnnouncementById(id: number): Observable<any> {
    return this._dataService.get(`announcements/getannouncement/${id}`);
  }
}
