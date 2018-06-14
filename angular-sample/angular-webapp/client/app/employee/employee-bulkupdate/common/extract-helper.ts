import { StringHelper } from './../../../shared/helpers/string-helper';
import * as Immutable from 'immutable';
import { isNullOrUndefined } from "util";
import { Response } from '@angular/http';
import { PagingInfo } from "../../../atlas-elements/common/models/ae-paging-info";
import { AtlasApiResponse } from "../../../shared/models/atlas-api-response";

export function extractEmployees(res: Response): Immutable.List<any> {
    let employees = new Array();
    if (!isNullOrUndefined(res.json())) {
        employees = <Array<any>>res.json().Entities;
        employees.forEach(employee => {
            employee.CreateUser = employee.HasUser;
            employee.HasEmail = employee.HasEmail || StringHelper.isNullOrUndefinedOrEmpty(String(employee.email));
        });
    }
    return Immutable.List<any>(employees);
}

export function extractEmployeePagingInfo(res: Response): PagingInfo {
    let pagingInfo: PagingInfo;
    if (!isNullOrUndefined(res.json())) {
        pagingInfo = <PagingInfo>res.json().PagingInfo;

    }
    return pagingInfo;
}

export function extractSuccessCount(res: any): number {
    let successCount = 0;
    if (!isNullOrUndefined(res.json())) {
        let employees = <Array<any>>res.json();
        if (!isNullOrUndefined(employees)) {
            let successfulEmployees = employees.filter((employee) => (isNullOrUndefined(employee.Errors) || (employee.Errors.length === 0)));
            if (!isNullOrUndefined(successfulEmployees)) {
                successCount = successfulEmployees.length;
            }
        }
    };
    return successCount;
}