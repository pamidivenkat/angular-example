import { CalendarFilterModel } from './../model/calendar-filter.model';
import { getCalendarSearchData, getCalendarState } from '../../shared/reducers';
import { isNullOrUndefined } from 'util';
import { CalendarEntityModel, DateRangeFilter, Department, Site } from '../model/calendar-models';
import { extractCalendarInformation } from '../common/calendar-extract-helper';
import { ActionTypes } from '../actions/calendar.actions';
import { ClaimsHelperService } from '../../shared/helpers/claims-helper';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Observable } from 'rxjs/Rx';
import { Action, Store } from '@ngrx/store';
import { Actions, Effect, toPayload } from '@ngrx/effects'
import { Injectable } from '@angular/core';
import * as fromRoot from '../../shared/reducers/index';
import * as calendarActions from '../actions/calendar.actions';
import { Http, URLSearchParams } from '@angular/http';
import { CatchErrorAction } from '../../shared/actions/error.actions';
import { AtlasApiError } from '../../shared/error-handling/atlas-api-error';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';

@Injectable()
export class CalendarEffects {
    // constructor 
    constructor(private _actions$: Actions,
        private _store: Store<fromRoot.State>,
        private _data: RestClientService,
        private _claimsHelper: ClaimsHelperService) {

    }
    // End of constructor

    /**
    * This effect used to load the employee drowdown data by sending required parameters to api
    * 
    */
    @Effect()
    loadEmployees$: Observable<Action> = this._actions$.ofType(ActionTypes.SEARCH_DEPARTMENT_EMPLOYEES)
        //.merge(toPayload)
        .switchMap((payload) => {
            if (!isNullOrUndefined(payload.payload)) {

                let params: URLSearchParams = new URLSearchParams();
                params.set('pageSize', '25');
                params.set('pageNumber', '1');
                params.set('sortField', 'FirstName,Surname');
                params.set('direction', 'asc');
                params.set('fields', 'Id,FirstName,Surname,IsLeaver,Job.DepartmentId as DepartmentId');
                // filters
                params.set('employeeForCalendarFilter', payload.payload.employeeId);
                params.set('employeesByDepartmentFilter', payload.payload.deptIds);
                params.set('employeesByNameOrEmailFilter', payload.payload.query);
                params.set('employeesByLocationFilter', payload.payload.siteIds)
                params.set('excludeLeaverEmployees', '1');
                return this._data.get('employee', { search: params })
            }
            return [];
        })
        .map((res) => {
            return new calendarActions.SearchEmployeesCompleteAction(res.json().Entities);
        }).catch((error) => {
            return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Employees', null)));
        });



    /**
* This effect used to load the employee drowdown data by sending required parameters to api
* 
*/
    @Effect()
    loadEvents$: Observable<Action> = this._actions$.ofType(ActionTypes.SEARCH_EVENTS)
        .map(toPayload)
        .switchMap((pl: CalendarFilterModel) => {
            let employeeId = this._claimsHelper.getEmpId(); //  using loggedin emp id this to get the pulic holiday list
            let data = this._getCalendarEntityModel(employeeId, pl);
            let params: URLSearchParams = new URLSearchParams();
            params.set('pageNumber', '1');
            params.set('pageSize', '999999');
            return this._data.post('Calendar', data, { search: params })
                .map((res) => new calendarActions.SearchEventsCompleteAction(extractCalendarInformation(res.json())))
                .catch((error) => {
                    return Observable.of(new CatchErrorAction(new AtlasApiError(error, MessageEvent.Load, 'Calendar-events', null)));
                })
        });

    private _getCalendarEntityModel(employeeId: string, res: CalendarFilterModel): CalendarEntityModel {
        let calendarModel: CalendarEntityModel;

        let publicHolidayFilters: any;
        publicHolidayFilters = {};
        publicHolidayFilters['filterByEmployee'] = employeeId;


        let eventFilters: any;
        eventFilters = {};
        eventFilters['MyAbsenceFetchOnlyHolidaysFilter'] = false;
        eventFilters["MyAbsenceExcludeLeaversFilter"] = res.ExcludeLeavers;


        if (!isNullOrUndefined(res) && (!isNullOrUndefined(res.Department) && res.Department.length > 0) || (!isNullOrUndefined(res.Site) && res.Site.length > 0) || (!isNullOrUndefined(res.Employee) && res.Employee.length > 0)) {
            calendarModel = new CalendarEntityModel();

            // date range filter
            publicHolidayFilters['DateRangeFilter'] = res.dateRange;
            eventFilters['filterByEndDate'] = res.dateRange.end;
            eventFilters['filterByStartDate'] = res.dateRange.start;
            // end of date range filter
            eventFilters['MyAbsenceIncludePendingHolidaysFilter'] = res.ShowPending;
            eventFilters['MyAbsenceByDepartmentFilter'] = res.Department.length > 0 ? res.Department.map(c => c.Id ? c.Id : c).join(',') : '';
            eventFilters['MyAbsenceBySitesFilter'] = res.Site.length > 0 ? res.Site.map(c => c.Value ? c.Value : c).join(',') : '';
            eventFilters['MyAbsencesByEmployeeIds'] = res.Employee.length > 0 ? res.Employee.map(c => c.Value ? c.Value : c).join(',') : '';
            if (!isNullOrUndefined(eventFilters['MyAbsencesByEmployeeIds']) && eventFilters['MyAbsencesByEmployeeIds'].length > 0) {
                eventFilters['MyAbsenceByDepartmentFilter'] = '';
                eventFilters['MyAbsenceBySitesFilter'] = '';
            }

            calendarModel.CalendarEntities.push({ CalendarEntityType: 2, Fields: 'Id,Name,HolidayDate,Year', Filters: publicHolidayFilters });
            calendarModel.CalendarEntities.push({ CalendarEntityType: 1, Fields: 'EmployeeId,EndDate,Id,IsHour,NoOfDays,NoOfUnits,StartDate,TypeId,Status,AbsencesType,Comment', Filters: eventFilters });
        }
        else {
            publicHolidayFilters['DateRangeFilter'] = null;
            eventFilters['filterByEndDate'] = null;
            eventFilters['filterByStartDate'] = null;

            calendarModel = new CalendarEntityModel();
            eventFilters['MyAbsenceByDepartmentFilter'] = null;
            eventFilters['MyAbsenceBySitesFilter'] = null;
            eventFilters['MyAbsencesByEmployeeIds'] = null;
            eventFilters['MyAbsenceIncludePendingHolidaysFilter'] = res.ShowPending;
            calendarModel.CalendarEntities.push({ CalendarEntityType: 2, Fields: 'Id,Name,HolidayDate,Year', Filters: publicHolidayFilters });
            calendarModel.CalendarEntities.push({ CalendarEntityType: 1, Fields: 'EmployeeId,EndDate,Id,IsHour,NoOfDays,NoOfUnits,StartDate,TypeId,Status,AbsencesType,Comment', Filters: eventFilters });
        }

        return calendarModel;
    }

}