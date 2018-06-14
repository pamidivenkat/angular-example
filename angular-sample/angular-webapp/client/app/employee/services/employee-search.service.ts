import { Employee } from './../../calendar/model/calendar-models';
import { Store } from '@ngrx/store';
import { Injectable, OnInit } from '@angular/core'
import { Observable, ReplaySubject } from 'rxjs/Rx';
import { EmployeeFullEntity } from '../models/employee-full.model';
import { RestClientService } from '../../shared/data/rest-client.service';
import { URLSearchParams } from '@angular/http';
import { extractEmployeeSearchData } from "../common/extract-helpers";
import { EmployeeSearchData } from "../models/employee-group-association.model";

@Injectable()
export class EmployeeSearchService implements OnInit {
    private _employeeSearchRes: EmployeeSearchData[];
    private _employees: Employee[];


    constructor(private _data: RestClientService) {

    }

    ngOnInit() {

    }
    public getEmployeesData(query: string, siteId?: string): Observable<EmployeeSearchData[]> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('employeeByNameOrEmailFilter', query);
        params.set('pageNumber', '0');
        params.set('pageSize', '0');
        params.set('sortField', 'FirstName');
        params.set('direction', 'asc');
        params.set('employeesByLeaverFilter', '0');
        params.set('fields', 'Id,FirstName,MiddleName,Surname,Job.Site');
        if (siteId != "") {
            params.set('employeesByLocationFilter', siteId);
        }
        return this._data.get('Employee', { search: params })
            .map((res) => {
                this._employeeSearchRes = extractEmployeeSearchData(res.json().Entities.filter(res => res.Site != null));
                return this._employeeSearchRes;
            });
    }

    getEmployeesKeyValuePair(query: string, filters?: Map<string, string>): Observable<Employee[]> {
        let params: URLSearchParams = new URLSearchParams();
        params.set('employeeByNameOrEmailFilter', query);
        params.set('pageNumber', '0');
        params.set('pageSize', '0');
        params.set('sortField', 'FirstName');
        params.set('direction', 'asc');
        params.set('employeesByLeaverFilter', '0');
        if (filters) {
            filters.forEach((value: string, key: string) => {
                params.set(key, value);
            });
        }
        params.set('fields', 'Id,FirstName,MiddleName,Surname');
        return this._data.get('Employee', { search: params })
            .map((res) => {
                this._employees = <Employee[]>res.json().Entities;
                return this._employees;
            });
    }
}