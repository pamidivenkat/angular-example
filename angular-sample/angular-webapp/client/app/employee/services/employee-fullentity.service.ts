import { isNullOrUndefined } from 'util';
import {
    mergeEmployeeBenefitsDetails,
    mergeEmployeeContacts,
    mergeEmployeeJobDetails,
    mergeEmployeeOptionsDetails,
    mergeEmployeePersonal
} from '../common/extract-helpers';
import { Employee, EmployeeContacts } from '../models/employee.model';
import { EmployeeFullEntity } from '../models/employee-full.model';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Observable, ReplaySubject } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { EmployeeJobDetails } from '../../employee/job/models/job-details.model';
import { AdminOptions } from '../../employee/administration/models/user-admin-details.model';


@Injectable()
export class EmployeeFullEntityService {
    private _employeeFullEntity: EmployeeFullEntity;
    getData(employeeId: string, forceRefresh?: boolean): Observable<EmployeeFullEntity> {
        return this._data.get(`employee/getbyid/${employeeId}`, { search: null })
            .map((res) => {
                this._employeeFullEntity = <EmployeeFullEntity>res.json();
                return this._employeeFullEntity;
            });

    }

    mergeData(employee: Employee):Observable<EmployeeFullEntity> {
        return this.getData(employee.Id, true).map(m => mergeEmployeePersonal(m, employee));
    }

    mergeContactData(employeeContacts: EmployeeContacts, empId: string):Observable<EmployeeFullEntity> {
        return this.getData(empId, true).map(m => mergeEmployeeContacts(m, employeeContacts));
    }

    mergeWithJobDetails(employeeJobDetails: EmployeeJobDetails, empId: string):Observable<EmployeeFullEntity> {
        return this.getData(empId, true).map(m => mergeEmployeeJobDetails(m, employeeJobDetails));
    }
    mergeWithAdminOptionsDetails(adminOptions : AdminOptions, employeeId : string):Observable<EmployeeFullEntity> {
        return this.getData(employeeId, true).map(m => mergeEmployeeOptionsDetails(m, adminOptions));
    }

    mergeWithEmployeeBenefitsDetails(PensionScheme : string, employeeId : string):Observable<EmployeeFullEntity> {
        return this.getData(employeeId, true).map(m => mergeEmployeeBenefitsDetails(m, PensionScheme));
    }

    updateData(employeeFullData) {
        let updatedEmployee = Object.assign({}, employeeFullData);
        this._employeeFullEntity = JSON.parse(JSON.stringify(updatedEmployee));
    }

    constructor(private _data: RestClientService) { }
}
