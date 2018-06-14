import { EmployeeImportHistory } from "../models/employee-import";
import { isNullOrUndefined } from "util";
import { Response } from '@angular/http';
import * as Immutable from 'immutable';
import { PagingInfo } from "../../../atlas-elements/common/models/ae-paging-info";
import { EmployeeImportResult } from "../models/employee-import-result";

export function extractImportHistory(response: Response): Immutable.List<EmployeeImportHistory> {
    let importHistoryList: EmployeeImportHistory[] = new Array();
    let body = response.json().Entities;
    if (!isNullOrUndefined(body)) {
        body.map(item => {
            let importhistoryItem = new EmployeeImportHistory();
            importhistoryItem.Id = item['Id'];
            importhistoryItem.FileName = item['FileName'];
            importhistoryItem.CreatedOn = item['CreatedOn'];
            importhistoryItem.FirstName = item['FirstName'];
            importhistoryItem.LastName = item['LastName'];
            importhistoryItem.IsBackgroundJob = item['IsBackgroundJob'];
            importhistoryItem.Status = item['Status'];
            importhistoryItem.FileStorageId = item['FileStorageId'];
            importHistoryList.push(importhistoryItem);
        });
    }
    return Immutable.List<EmployeeImportHistory>(importHistoryList);
}

export function extractPagingInfo(response: Response) {
    let body = response.json().PagingInfo as PagingInfo;
    return body;
}


export function extractImportResults(response: Response): Array<EmployeeImportResult> {
    let importResultList: EmployeeImportResult[] = new Array();
    let body = response.json().Entities;
    if (!isNullOrUndefined(body)) {
        body.map(item => {
            let importResult = new EmployeeImportResult();
            importResult.FirstName = item['FirstName'];
            importResult.EmailorUsername = item['EmailorUsername'];
            importResult.Errors = item['Errors'];
            importResultList.push(importResult);
        });
    }
    return importResultList;
}


export function extractTotalCount(response: Response): number {
    let importResultList: EmployeeImportResult[] = new Array();
    if (!isNullOrUndefined(response.json().Entities)) {
        let entities = <Array<EmployeeImportResult>>response.json().Entities;
        return entities.length;
    }
    return 0;
}

export function extractImportEmployees(res: Response): Immutable.List<any> {
    let importedEmployees = new Array();
    if (!isNullOrUndefined(res.json().Entities)) {
        importedEmployees = <Array<any>>res.json().Entities;        
        importedEmployees.forEach(emp => {
            if (!isNullOrUndefined(emp.UserProfiles) && emp.UserProfiles.length > 0) {
                emp.UserProfileId = emp.UserProfiles[0].Id;
            }
            else {
                emp.UserProfileId = '';
            }

            if (!isNullOrUndefined(emp.EmergencyContacts) && emp.EmergencyContacts.length === 0) {
                emp.EmergencyContacts.push({});
            }
        });

    }
    return Immutable.List<any>(importedEmployees);
}


export function extractImportedEmployees(res: Response): Immutable.List<any> {
    let importedEmployees = new Array();
    if (!isNullOrUndefined(res.json())) {
        importedEmployees = <Array<any>>res.json();
        importedEmployees = importedEmployees.filter((emp) => (!isNullOrUndefined(emp.Errors) && (emp.Errors.length > 0)));
        importedEmployees.forEach(emp => {
            if (!isNullOrUndefined(emp.UserProfiles) && emp.UserProfiles.length > 0) {
                emp.UserProfileId = emp.UserProfiles[0].Id;
            }
            else {
                emp.UserProfileId = '';
            }

            if (!isNullOrUndefined(emp.EmergencyContacts) && emp.EmergencyContacts.length === 0) {
                emp.EmergencyContacts.push({});
            }
        });

    }
    return Immutable.List<any>(importedEmployees);
}