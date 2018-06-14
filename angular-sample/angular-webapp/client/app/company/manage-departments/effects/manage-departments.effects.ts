import {
    AddCPPClientDetailsCompleteAction
} from '../../../construction-phase-plans/manage-construction-plan/actions/manage-cpp.actions';
import { Injectable } from '@angular/core';
import { RestClientService } from '../../../shared/data/rest-client.service';
import { Actions, Effect, toPayload } from '@ngrx/effects';
import { Store, Action } from '@ngrx/store';
import { Http } from '@angular/http';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { MessengerService } from '../../../shared/services/messenger.service';
import { RouteParams } from '../../../shared/services/route-params';
import * as fromRoot from '../../../shared/reducers/index';
import { Observable } from 'rxjs/Rx';
import * as manageDepartmentActions from '../actions/manage-departments.actions';
import * as errorActions from '../../../shared/actions/error.actions';
import { AtlasApiError } from '../../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../../atlas-elements/common/models/message-event.enum';
import {
    extractDepartmentsFromResponse
    , extractEmployees
    , groupEmployeesByDepartment,
    extractDepartmentModel,
    mapDepartmentEntity,
    extractDepartmentEntity,
    mapEmployeeBasicInfo
} from '../common/extract-helper';
import {
    LoadCompanyDepartmentsCompleteAction
    , LoadCompanyEmployeesCompleteAction
    , LoadCompanyDepartmentEmployeesAction
} from '../actions/manage-departments.actions';
import { URLSearchParams } from '@angular/http';
import { ObjectHelper } from '../../../shared/helpers/object-helper';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { DepartmentModel, DepartmentEntity } from '../models/department.model';
import { isNullOrUndefined } from 'util';
import { DepartmentType } from '../models/department-type.enum';
import { EmployeeMetadata } from '../models/employee-metadata.model';

@Injectable()
export class ManageDepartmentEffects {
    private _departmentEntities: Array<DepartmentEntity> = [];

    @Effect()
    loadCompnayDepartments$: Observable<Action> = this._actions$.ofType(manageDepartmentActions.ActionTypes.LOAD_COMPANY_DEPARTMENTS)
        .map(toPayload)
        .switchMap((payload: string) => {
            return this._data.get(`department/${payload}`)
                .map((res) => {
                    let mappedData = extractDepartmentsFromResponse(res);
                    this._departmentEntities = mappedData.entities;
                    return new LoadCompanyDepartmentsCompleteAction(mappedData.departments);
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(
                        new AtlasApiError(error
                            , MessageEvent.Load
                            , 'departments'
                            , null)));
                });
        });

    @Effect()
    loadCompnayEmployees$: Observable<Action> = this._actions$.ofType(manageDepartmentActions.ActionTypes.LOAD_COMPANY_EMPLOYEES)
        .switchMap(() => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('employeesByLeaverFilter', '0');
            params.set('shortList', 'true');
            return this._data.get('employee', { search: params })
                .mergeMap((res) => {
                    let allEmployees = extractEmployees(res);
                    return [
                        new LoadCompanyEmployeesCompleteAction(allEmployees),
                        new LoadCompanyDepartmentEmployeesAction(groupEmployeesByDepartment(allEmployees))
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(
                        new AtlasApiError(error
                            , MessageEvent.Load
                            , 'employees'
                            , ''
                        )));
                });
        });

    @Effect()
    addDepartmentOrTeam$: Observable<Action> =
    this._actions$.ofType(manageDepartmentActions.ActionTypes.ADD_COMPANY_DEPARTMENT)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _manageDeptState: state.manageDepartmentState
            };
        })
        .switchMap((input) => {
            let deptEntity = new DepartmentEntity();
            deptEntity.OrderIndex = 0;
            deptEntity = mapDepartmentEntity(input._payload, deptEntity);

            let vm = ObjectHelper.operationInProgressSnackbarMessage(`Creating ${deptEntity.Type.toLowerCase()}...`);
            this._messenger.publish('snackbar', vm);
            return this._data.put(`Department`, deptEntity)
                .switchMap((res) => {
                    let actionsToDispatch = [];
                    let department = extractDepartmentModel(res.json());
                    let depts = input._manageDeptState.CompanyDepartments;
                    if (isNullOrUndefined(depts)) {
                        depts = [];
                    }
                    depts = depts.concat(department);

                    let deptMap = input._manageDeptState.CompanyDepartmentEmployees;
                    if (isNullOrUndefined(deptMap)) {
                        deptMap = new Map<string, Array<EmployeeMetadata>>();
                    }
                    deptMap.set(department.Id, []);

                    let newDeptMap = new Map<string, Array<EmployeeMetadata>>(deptMap);

                    let departmentEntity = extractDepartmentEntity(res);
                    this._departmentEntities = this._departmentEntities.concat(departmentEntity);

                    actionsToDispatch.push(new manageDepartmentActions.AddCompanyDepartmentCompleteAction(department));
                    actionsToDispatch.push(new manageDepartmentActions.LoadCompanyDepartmentsCompleteAction(depts));
                    actionsToDispatch.push(new manageDepartmentActions.LoadCompanyDepartmentEmployeesAction(newDeptMap));

                    if (!StringHelper.isNullOrUndefinedOrEmpty(input._payload.ManagerId)) {
                        let updateParms: URLSearchParams = new URLSearchParams();
                        updateParms.set('employeeId', input._payload.ManagerId);
                        updateParms.set('deptId', res.json().Id);
                        return this._data.post('Job/UpdateEmpDeptMapping',
                            {
                                employeeId: input._payload.ManagerId,
                                deptId: res.json().Id
                            },
                            {
                                search: updateParms
                            }).mergeMap((updateRes) => {
                                vm = ObjectHelper.operationCompleteSnackbarMessage(`${deptEntity.Type} has been created.`);
                                this._messenger.publish('snackbar', vm);
                                return actionsToDispatch;
                            });
                    } else {
                        vm = ObjectHelper.operationCompleteSnackbarMessage(`${deptEntity.Type} has been created.`);
                        this._messenger.publish('snackbar', vm);
                        return actionsToDispatch;
                    }
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(
                        new AtlasApiError(error
                            , MessageEvent.Create
                            , 'department / team'
                            , null, input._payload.Id)));
                });
        });

    @Effect()
    updateDepartmentOrTeam$: Observable<Action> =
    this._actions$.ofType(manageDepartmentActions.ActionTypes.UPDATE_COMPANY_DEPARTMENT)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _manageDepartmentState: state.manageDepartmentState
            };
        })
        .switchMap((input) => {
            let depts = input._manageDepartmentState.CompanyDepartments;
            if (isNullOrUndefined(depts)) {
                depts = [];
            }
            let index = depts.findIndex((dept) => dept.Id.toLowerCase() === input._payload.Id.toLowerCase());

            let deptEntity = Object.assign({}, this._departmentEntities
                .filter((d) => d.Id.toLowerCase() === input._payload.Id.toLowerCase())[0]);
            deptEntity = mapDepartmentEntity(input._payload, deptEntity);
            let vm = ObjectHelper.operationInProgressSnackbarMessage(`Updating ${DepartmentType[input._payload.Type].toLowerCase()}...`);
            this._messenger.publish('snackbar', vm);
            return this._data.post(`Department`, deptEntity)
                .switchMap((res) => {
                    let isHeiraricalChange: boolean = false;
                    let department = Object.assign({}, extractDepartmentModel(res.json()));
                    let actionsToDispatch = [];
                    let deptToRemove = null;
                    if (index !== -1) {
                        deptToRemove = Object.assign({}, depts[index]);
                        if (depts[index].ParentId !== department.ParentId) {
                            isHeiraricalChange = true;
                            depts[index].ParentId = department.ParentId;
                            if (!StringHelper.isNullOrUndefinedOrEmpty(department.ParentId)) {
                                depts[index].ParentDepartmentName = depts.filter(d => !StringHelper.isNullOrUndefinedOrEmpty(d.ParentId) &&
                                    d.ParentId.toLowerCase() === department.ParentId.toLowerCase())[0].Name;
                            }
                        } else {
                            isHeiraricalChange = false;
                            depts[index].Name = department.Name;
                            depts[index].ManagerId = department.ManagerId;
                        }
                    }

                    let departmentEntity = extractDepartmentEntity(res);
                    this._departmentEntities = this._departmentEntities
                        .filter((d) => d.Id.toLowerCase() !== department.Id.toLowerCase());
                    this._departmentEntities = this._departmentEntities.concat(departmentEntity);

                    let deptModelToUpdate = Object.assign({}, department);
                    actionsToDispatch.push(new manageDepartmentActions.LoadCompanyDepartmentsCompleteAction(depts));
                    actionsToDispatch.push(new manageDepartmentActions
                        .UpdateCompanyDepartmentCompleteAction(deptModelToUpdate));

                    if (isHeiraricalChange) {
                        actionsToDispatch.push(new manageDepartmentActions
                            .RemoveCompanyDepartmentCompleteAction(deptToRemove));
                        let deptModelToAdd = Object.assign({}, department);
                        actionsToDispatch.push(new manageDepartmentActions.AddCompanyDepartmentCompleteAction(deptModelToAdd));
                    }

                    if (isNullOrUndefined(departmentEntity.ManagerId)) {
                        departmentEntity.ManagerId = '';
                    }

                    if (isNullOrUndefined(input._payload.ManagerId)) {
                        input._payload.ManagerId = '';
                    }

                    if (!isHeiraricalChange && (departmentEntity.ManagerId.toLowerCase() !=
                        (<string>input._payload.ManagerId).toLowerCase())) {
                        let updateParms: URLSearchParams = new URLSearchParams();
                        updateParms.set('employeeId', input._payload.ManagerId);
                        updateParms.set('deptId', res.json().Id);
                        return this._data.post('Job/UpdateEmpDeptMapping',
                            {
                                employeeId: input._payload.ManagerId,
                                deptId: res.json().Id
                            },
                            {
                                search: updateParms
                            }).mergeMap((updateRes) => {
                                vm = ObjectHelper.operationCompleteSnackbarMessage(`${deptEntity.Type} has been updated.`);
                                this._messenger.publish('snackbar', vm);
                                return actionsToDispatch;
                            });
                    } else {
                        vm = ObjectHelper.operationCompleteSnackbarMessage(`${deptEntity.Type} has been updated.`);
                        this._messenger.publish('snackbar', vm);
                        return actionsToDispatch;
                    }
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(
                        new AtlasApiError(error
                            , MessageEvent.Update
                            , 'department / team.'
                            , null, input._payload.Id)));
                });
        });

    @Effect()
    removeDepartmentOrTeam$: Observable<Action> = this._actions$.ofType(manageDepartmentActions.ActionTypes.REMOVE_COMPANY_DEPARTMENT)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _manageDepartmentState: state.manageDepartmentState
            };
        })
        .switchMap((input) => {
            let deptOrTeamId = input._payload.Id;
            let deptType: string = DepartmentType[input._payload.Type].toLowerCase();
            let isValidRemoveOperation: boolean = true;
            let childDepts = input._manageDepartmentState.CompanyDepartments.filter((dept) => {
                return !isNullOrUndefined(dept.ParentId) && dept.ParentId.toLowerCase() === deptOrTeamId;
            });

            let childEmployees = input._manageDepartmentState.CompanyDepartmentEmployees.get(deptOrTeamId);

            if (((!isNullOrUndefined(childDepts) &&
                childDepts.length > 0)) ||
                ((!isNullOrUndefined(childEmployees) &&
                    childEmployees.length > 0))) {
                isValidRemoveOperation = false;
            }

            if (!isValidRemoveOperation) {
                let msg = '';
                if (deptType === 'team') {
                    msg = 'You cannot remove a team, which has employee(s) within it.';
                } else if (deptType === 'department') {
                    msg = 'You cannot remove a department, which has sub-department(s) or team(s) or employee(s) within it.';
                }

                let errorVm = ObjectHelper.operationFailedSnackbarMessage(msg);
                this._messenger.publish('snackbar', errorVm);
                return [];
            }

            let vm = ObjectHelper.operationInProgressSnackbarMessage(`Removing ${deptType}...`);
            this._messenger.publish('snackbar', vm);

            let params: URLSearchParams = new URLSearchParams();
            params.set('id', deptOrTeamId);
            return this._data.delete(`Department`, { search: params })
                .mergeMap((res) => {
                    let actionsToDispatch = [];
                    let depts = input._manageDepartmentState.CompanyDepartments;
                    if (isNullOrUndefined(depts)) {
                        depts = [];
                    }
                    let deptModel = depts.filter(d => d.Id.toLowerCase() === deptOrTeamId.toLowerCase())[0];
                    depts = depts.filter(d => d.Id.toLowerCase() !== deptOrTeamId.toLowerCase());

                    let deptMap = input._manageDepartmentState.CompanyDepartmentEmployees;
                    if (isNullOrUndefined(deptMap)) {
                        deptMap = new Map<string, Array<EmployeeMetadata>>();
                    }
                    deptMap.delete(deptOrTeamId);
                    let newDeptMap = new Map<string, Array<EmployeeMetadata>>(deptMap);

                    this._departmentEntities = this._departmentEntities
                        .filter((d) => d.Id.toLowerCase() !== deptOrTeamId.toLowerCase());

                    actionsToDispatch.push(new manageDepartmentActions
                        .RemoveCompanyDepartmentCompleteAction(deptModel));
                    actionsToDispatch.push(new manageDepartmentActions.LoadCompanyDepartmentsCompleteAction(depts));
                    actionsToDispatch.push(new manageDepartmentActions.LoadCompanyDepartmentEmployeesAction(newDeptMap));
                    vm = ObjectHelper.operationCompleteSnackbarMessage(`${DepartmentType[input._payload.Type]} has been removed.`);
                    this._messenger.publish('snackbar', vm);
                    return actionsToDispatch;
                })
                .catch((error) => {
                    return Observable.of(
                        new errorActions
                            .CatchErrorAction(
                            new AtlasApiError(error
                                , MessageEvent.Remove
                                , 'department / team'
                                , null, input._payload.Id)
                            ));
                });
        });

    @Effect()
    assignEmployeeToDepartmentOrTeam$: Observable<Action> =
    this._actions$.ofType(manageDepartmentActions.ActionTypes.ASSIGN_EMPLOYEE_TO_DEPARTMENT)
        .map(toPayload)
        .withLatestFrom(this._store, (payload, state) => {
            return {
                _payload: payload
                , _manageDepartmentState: state.manageDepartmentState
            };
        })
        .switchMap((input) => {
            let deptEntity = Object.assign({}, this._departmentEntities
                .filter((d) => d.Id.toLowerCase() === input._payload.DepartmentId.toLowerCase())[0]);
            let deptModel = extractDepartmentModel(deptEntity);

            let employees = input._manageDepartmentState.CompanyEmployees;
            if (isNullOrUndefined(employees)) {
                employees = [];
            }
            let deptEmpBelongsTo = employees.filter(c => !StringHelper.isNullOrUndefinedOrEmpty(c.Id) &&
                c.Id.toLowerCase() === input._payload.EmployeeId.toLowerCase())[0].DepartmentId;
            if (StringHelper.isNullOrUndefinedOrEmpty(deptEmpBelongsTo)) {
                deptEmpBelongsTo = 'none';
            }
            let vm = ObjectHelper.operationInProgressSnackbarMessage(
                `Assigning employee to ${DepartmentType[deptModel.Type].toLowerCase()}...`);
            this._messenger.publish('snackbar', vm);

            let updateParms: URLSearchParams = new URLSearchParams();
            updateParms.set('employeeId', input._payload.EmployeeId);
            updateParms.set('deptId', input._payload.DepartmentId);
            return this._data.post('Job/UpdateEmpDeptMapping',
                {
                    employeeId: input._payload.EmployeeId,
                    deptId: input._payload.DepartmentId
                },
                {
                    search: updateParms
                }).mergeMap((res) => {
                    let actionsToDispatch = [];
                    let index = employees.findIndex((emp) => emp.Id.toLowerCase() === input._payload.EmployeeId.toLowerCase());
                    if (index !== -1) {
                        employees[index].DepartmentId = input._payload.DepartmentId;
                    }

                    let deptEmployees = input._manageDepartmentState.CompanyDepartmentEmployees;
                    let unassignedEmps = deptEmployees.get(deptEmpBelongsTo) || [];
                    let updatedUnassignedEmps = unassignedEmps.filter(c => c.Id.toLowerCase() !== input._payload.EmployeeId.toLowerCase());
                    deptEmployees.set(deptEmpBelongsTo, updatedUnassignedEmps);

                    let selectedDeptEmps = deptEmployees.get(input._payload.DepartmentId.toLowerCase()) || [];
                    let updatedSelectedDeptEmps = selectedDeptEmps.concat(employees[index]);
                    deptEmployees.set(input._payload.DepartmentId.toLowerCase(), updatedSelectedDeptEmps);

                    let newdeptemployees = new Map<string, Array<EmployeeMetadata>>(deptEmployees);

                    let depts = input._manageDepartmentState.CompanyDepartments;
                    if (isNullOrUndefined(depts)) {
                        depts = [];
                    }
                    let empDeptModel = depts.filter(c => c.Id.toLowerCase() ===
                        deptEmpBelongsTo.toLowerCase())[0];

                    vm = ObjectHelper.operationCompleteSnackbarMessage(
                        `Employee has been assigned to ${DepartmentType[deptModel.Type].toLowerCase()}.`);
                    this._messenger.publish('snackbar', vm);
                    actionsToDispatch.push(new manageDepartmentActions.LoadCompanyEmployeesCompleteAction(employees));
                    actionsToDispatch.push(new manageDepartmentActions
                        .LoadCompanyDepartmentEmployeesAction(newdeptemployees));
                    actionsToDispatch.push(new manageDepartmentActions
                        .AssignEmployeeToDepartmentCompleteAction(deptModel));
                    if (!isNullOrUndefined(empDeptModel)) {
                        actionsToDispatch.push(new manageDepartmentActions
                            .AssignEmployeeToDepartmentCompleteAction(empDeptModel));
                    }
                    return actionsToDispatch;
                }).catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(
                        new AtlasApiError(error
                            , MessageEvent.Update
                            , 'employee association with department / team'
                            , null
                            , input._payload.Id)));
                });
        });

    @Effect()
    loadDepartmentOrTeam$: Observable<Action> = this._actions$.ofType(manageDepartmentActions.ActionTypes.LOAD_COMPANY_DEPARTMENT)
        .map(toPayload)
        .switchMap((deptOrTeamId) => {
            return this._data.get(`Department/${deptOrTeamId}`)
                .map((res) => {
                    return new manageDepartmentActions.LoadCompanyDepartmentCompleteAction(res.json());
                })
                .catch((error) => {
                    return Observable.of(
                        new errorActions
                            .CatchErrorAction(
                            new AtlasApiError(error
                                , MessageEvent.Load
                                , 'department / team'
                                , null
                                , deptOrTeamId)
                            ));
                });
        });

    @Effect()
    loadEmployeeBasicInfo$: Observable<Action> =
    this._actions$.ofType(manageDepartmentActions.ActionTypes.LOAD_SELECTED_EMPLOYEE_BASIC_INFO)
        .map(toPayload)
        .switchMap((employeeId) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('fields', `EmergencyContacts,Id,FirstName,MiddleName,Surname,Title,KnownAs,Gender,PreviousName,DOB,EthnicGroup==null?"":EthnicGroup.EthnicGroupValue.Name as EthnicGroupValueName,EthnicGroup==null?"":EthnicGroup.Name as EthnicGroupName, EthnicGroup == null? Guid.Empty:EthnicGroup.EthnicGroupValueId as EthnicGroupValueId,EthnicGroup==null?-1:EthnicGroup.EthnicGroupValueType as EthnicGroupValueType,Nationality,EmployeePayrollDetails.TaxCode,EmployeePayrollDetails.NINumber,Email,HasEmail,UserId, CompanyId,PersonalEmail,Address.MobilePhone,Address.AddressLine1,Address.AddressLine2,Address.AddressLine3,Address.Town,Address.CountyId,Address.County.Name as CountyName,Address.CountryId,Address.Country.Name as CountryName,Address.Postcode,Address.HomePhone,Address.FullAddress`);
            return this._data.get(`employee/getbyid/${employeeId}`, { search: params })
                .map((res) => {
                    return new manageDepartmentActions.LoadSelectedEmployeeBasicInfoCompleteAction(mapEmployeeBasicInfo(res));
                })
                .catch((error) => {
                    return Observable.of(
                        new errorActions
                            .CatchErrorAction(
                            new AtlasApiError(error
                                , MessageEvent.Load
                                , 'employee'
                                , null
                                , employeeId)
                            ));
                });
        });

    @Effect()
    loadEmpSiteMapping$: Observable<Action> = this._actions$.ofType(manageDepartmentActions.ActionTypes.UPDATE_EMP_SITE_MAPPING)
        .map((action: manageDepartmentActions.UpdateEmpSiteMappingAction) => action.payload)
        .switchMap((pl) => {
            let params: URLSearchParams = new URLSearchParams();
            params.set('isEmployeeSiteUpdate', 'true');
            let vm = ObjectHelper.createUpdateInProgressSnackbarMessage('employee association with site',
                pl.EmployeeList[0].Job.SiteName, pl.EmployeeList[0].Job.Id);
            this._messenger.publish('snackbar', vm);
            return this._data.post(`job/UpdateEmpSiteAndDeptMapping`, pl, { search: params })
                .mergeMap((res) => {
                    let vm = ObjectHelper.createUpdateCompleteSnackbarMessage('employee association with site',
                        pl.EmployeeList[0].Job.SiteName, pl.EmployeeList[0].Job.Id);
                    this._messenger.publish('snackbar', vm);
                    return [
                        new manageDepartmentActions.UpdateEmpSiteMappingActionComplete(res.json()),
                        new manageDepartmentActions.UpdateEmployeeSitesAction(pl),
                    ];
                })
                .catch((error) => {
                    return Observable.of(new errorActions.CatchErrorAction(new AtlasApiError(error, MessageEvent.Update,
                        'employee association with site', pl.EmployeeList[0].Job.SiteName, pl.EmployeeList[0].Job.Id)));
                });
        });

    constructor(private _data: RestClientService
        , private _actions$: Actions
        , private _store: Store<fromRoot.State>
        , private _http: Http
        , private _claimsHelper: ClaimsHelperService
        , private _messenger: MessengerService
        , private _routeParams: RouteParams
    ) {
    }
}
