import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { DataService } from "./data.service";

@Injectable()
export class SettingsService {
  constructor(private _dataService: DataService) {}

  getSettings(): Observable<any> {
    // let settings: Map<string, string> = new Map();
    // return this._dataService.get("applicationsettings").map(response => {
    //   response.map(setting => {
    //     settings.set(setting.name, setting.value);
    //   });
    //   return of(settings);
    // });
    return this._dataService.get("applicationsettings");
  }

    saveSettings(setting: any): Observable<any> {
        if (setting.id && setting.id > 0) {
            return this._dataService.post(`applicationsettings/${setting.id}`, setting);
        } else {
            return this._dataService.post(`applicationsettings/`, setting);
        }
    }
    bulkUpdateSettings(settingsList: any): Observable<any> {
        return this._dataService.put(`applicationsettings/bulkupdate`, settingsList);
    }

}
