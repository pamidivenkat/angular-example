import { isNullOrUndefined } from 'util';
import { RiskAssessment } from './../models/risk-assessment';
import { RestClientService } from './../../shared/data/rest-client.service';
import { Observable } from 'rxjs/Rx';
import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import { AtlasParams } from "../../shared/models/atlas-api-response";
import { URLSearchParams } from '@angular/http';

@Injectable()
export class RiskAssessmentSearchService {
    constructor(private _data: RestClientService) { }


    getRiskAssessments(query: string, filters?: Map<string, string>): Observable<RiskAssessment[]> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('searchBoxFilter', query);
        params.set('pageNumber', '0');
        params.set('pageSize', '0');
        params.set('sortField', 'Name');
        params.set('direction', 'asc');
        if (!isNullOrUndefined(filters)) {
            filters.forEach((value: string, key: string) => {
                params.set(key, value);
            });
        }
        params.set('fields', 'Id,Name,ReferenceNumber,Site.Name as SiteName');
        return this._data.get('RiskAssessment', { search: params })        
            .map((res) => {
                let RAs = <RiskAssessment[]>res.json().Entities;
                return RAs;
            });
    }
}