import { extractIncidentPreviewData } from '../incident/common/extract-helpers';
import { Http, URLSearchParams } from '@angular/http';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
@Injectable()
export class IncidentLogService {

    constructor(private _data: RestClientService
        , private _http: Http
    ) {
    }

    getIncidentDetails(incidentId: string) {
        let params = new URLSearchParams();
        params.set('id',incidentId);
        params.set('custom','true');        
        return this._data.get(`incident/GetIncidentDetails`, { search: params })
            .map((res) => extractIncidentPreviewData(res))
            .switchMap((model) => {
                return Observable.of(model);
            });
    }


}