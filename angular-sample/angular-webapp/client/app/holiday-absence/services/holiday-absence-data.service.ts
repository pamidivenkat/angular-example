import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { EmployeeSettings } from '../../shared/models/company.models';
import { AbsenceStatusType } from '../common/absence-status-type.enum';
import { isNullOrUndefined } from 'util';
import { MyAbsence, MyAbsenceType, MyDelegateInfo } from '../models/holiday-absence.model';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import {
    extractFiscalYearSummary,
    extractValidationResult,
    extractWorkingDays,
    noOfUnitsFraction,
} from '../common/extract-helpers';
import { DateTimeHelper } from '../../shared/helpers/datetime-helper';

import * as Immutable from 'immutable';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class HolidayAbsenceDataService {

    getWorkingDays(startDate: Date, endDate: Date, employeeId: string) {
        if (!isNullOrUndefined(endDate)) {
            let params: URLSearchParams = new URLSearchParams();
            params.set('employeeId', employeeId);
            params.set('startDate', startDate.toDateString());
            params.set('endDate', endDate.toDateString());
            return this._data.get('MyAbsence/GetApplicableWorkingDaysDateRange', { search: params })
                .map((res) => extractWorkingDays(res));
        } else {
            return Observable.of([]);
        }
    }

    validateMyAbsence(requestsToValidate: any, employeeId: string, myAbsenceType: MyAbsenceType) {
        let params: URLSearchParams = new URLSearchParams();
        params.set('isCollection', 'true');
        params.set('holidayType', myAbsenceType.toString());
        let body = { ObjectsToValidate: requestsToValidate, EmployeeId: employeeId };
        return this._data.post('MyAbsence/ValidateDateRangeCollection', body, { search: params })
            .map((res) => extractValidationResult(res));
    }

    getHolidaySummary(startDate: Date, endDate: Date, employeeId: string) {
        let params: URLSearchParams = new URLSearchParams();
        params.set('temp', 'true');
        params.set('TypeId', MyAbsenceType.Holiday.toString());
        params.set('employeeId', employeeId);
        params.set('absenceStartYear', DateTimeHelper.getDatePart(startDate).toDateString());
        params.set('absenceEndYear', DateTimeHelper.getDatePart(endDate).toDateString());
        return this._data.get(`MyAbsence/GetMyHolidaysWorkingDays`, { search: params })
            .map((response) => {
                let stDate = DateTimeHelper.getDatePart(startDate);
                let enDate = DateTimeHelper.getDatePart(endDate);
                return extractFiscalYearSummary(response, stDate, enDate);
            });
    }

    getHolidayTypes(): Immutable.List<AeSelectItem<string>> {
        let aeSelectItems: AeSelectItem<string>[] = [];
        aeSelectItems.push(new AeSelectItem('Holiday', '1'));
        aeSelectItems.push(new AeSelectItem('Absence', '2'));
        return Immutable.List(aeSelectItems);
    }
    _setDataAndHours(currentHoliday: any, holidaySettings: EmployeeSettings) {
        if (currentHoliday.IsHour) {
            const fromDate = new Date(currentHoliday.StartDate);
            currentHoliday.FromHour = new Date(fromDate);
            currentHoliday.FromHour.setHours(currentHoliday['FromHourrecorded']);
            if (currentHoliday.FromMinutes) {
                currentHoliday.FromHour.setMinutes(currentHoliday.FromMinutes);
            }
            currentHoliday.StartDate = currentHoliday.FromHour;

            const toDate = new Date(currentHoliday.EndDate);
            currentHoliday.ToHour = new Date(toDate);
            currentHoliday.ToHour.setHours(currentHoliday['ToHourrecorded']);
            if (currentHoliday.ToMinutes) {
                currentHoliday.ToHour.setMinutes(currentHoliday.ToMinutes);
            }
            currentHoliday.EndDate = currentHoliday.ToHour;
        } else {
            if (currentHoliday.StartDate) {
                currentHoliday.StartDate = new Date(currentHoliday.StartDate);
                currentHoliday.StartDate.setHours = (holidaySettings.StartTimeHours.split(':')[0]);
                currentHoliday.StartDate.setMinutes = (holidaySettings.StartTimeHours.split(':')[1]);
            }
            if (currentHoliday.EndDate) {
                currentHoliday.EndDate = new Date(currentHoliday.EndDate);
                currentHoliday.EndDate.setHours = (holidaySettings.EndTimeHours.split(':')[0]);
                currentHoliday.EndDate.setMinutes = (holidaySettings.EndTimeHours.split(':')[1]);
            }
        }
        return currentHoliday;
    }

    _setStartDateHourMinutes(startDate: any, startTimeHours: string) {
        let startDateTimeHours = new Date(startDate);
        if (!isNullOrUndefined(startDateTimeHours)) {
            let fromDateHoursRecorded = startDateTimeHours.getHours();
            let fromMinutes = Number(startTimeHours.split(':')[1]);
            startDateTimeHours.setHours(fromDateHoursRecorded);
            startDateTimeHours.setMinutes(fromMinutes);
        }
        return startDateTimeHours;
    }

    _setEndDateHourMinutes(endDate: any, endTimeHours: string) {
        let endDateTimeHours = new Date(endDate);
        if (!isNullOrUndefined(endDateTimeHours)) {
            let toDateHoursRecorded = endDateTimeHours.getHours();
            let ToMinutes = Number(endTimeHours.split(':')[1]);
            endDateTimeHours.setHours(toDateHoursRecorded);
            endDateTimeHours.setMinutes(ToMinutes);
        }
        return endDateTimeHours;
    }

    _setStartDate(startDate: any, startTimeHours: string) {
        if (!isNullOrUndefined(startDate)) {
            let startDateTime = new Date(startDate);
            let hours = Number(startTimeHours.split(':')[0]);
            let minutes = Number(startTimeHours.split(':')[1]);
            startDateTime.setHours(hours);
            startDateTime.setMinutes(minutes);
            return startDateTime;
        }
        return startDate;
    }

    _setEndDate(endDate: any, endTimeHours: string) {
        if (!isNullOrUndefined(endDate)) {
            let endDateTime = new Date(endDate);
            let hours = Number(endTimeHours.split(':')[0]);
            let minutes = Number(endTimeHours.split(':')[1]);
            endDateTime.setHours(hours);
            endDateTime.setMinutes(minutes);
            return endDateTime;
        }
        return endDate;
    }

    getLegendColor(status: number): string {
        let _legendColor: string = '';
        switch (status) {
            case AbsenceStatusType.Requested:
            case AbsenceStatusType.Resubmitted:
            case AbsenceStatusType.Escalated:
                _legendColor = 'indicator--green';
                break;
            case AbsenceStatusType.Approved:
                _legendColor = 'indicator--yellow';
                break;
            case AbsenceStatusType.Cancelled:
                _legendColor = 'indicator--red';
                break;
            case AbsenceStatusType.Declined:
                _legendColor = 'indicator--purple';
                break;
            case AbsenceStatusType.Requestforcancellation:
                _legendColor = 'indicator--teal';
                break;
            case AbsenceStatusType.Requestforchange:
                _legendColor = 'indicator--grey';
                break;
            default:
                break;
        }
        return _legendColor;
    };

    getSubmittedUserName(myAbsence: MyAbsence, myDelegation: MyDelegateInfo[]): string {
        if (isNullOrUndefined(myAbsence)) {
            return '';
        };
        if (myAbsence.EscalatedToUser != null) {
            return myAbsence.EscalatedToUser.FullName;
        } else if (myAbsence.SubmittedToUser != null) {
            // check if leave is approved
            if (myAbsence.DeclinedByUser != null) {
                return myAbsence.DeclinedByUser.FullName;
            } else if (myAbsence.ApprovedByUser != null) {
                return myAbsence.ApprovedByUser.FullName;
            } else if (myAbsence.IsShowDelegatedUsersGroup) {
                return !isNullOrUndefined(myDelegation) && myDelegation.find(x => x.SubmittedToUserId === myAbsence.SubmittedToUserId) ?
                    myDelegation.find(x => x.SubmittedToUserId === myAbsence.SubmittedToUserId).DelegateGroupName : '';
            }
            // check if leave is declined
            return myAbsence.SubmittedToUser.FullName;
        }
        return '';
    }

    getAbsenceType(myAbsence: MyAbsence) {
        if (isNullOrUndefined(myAbsence)) {
            return '';
        };
        if (!isNullOrUndefined(myAbsence.AbsencesType)) {
            return myAbsence.AbsencesType.TypeName;
        } else if (!isNullOrUndefined(myAbsence.AbsencesSubType)) {
            return myAbsence.AbsencesSubType.Name;
        } else {
            return '';
        }
    }

    showMyAbsenceDetailsInfo(myAbsence: MyAbsence) {
        return myAbsence && myAbsence.IsHour && myAbsence.MyAbsenceDetails && myAbsence.MyAbsenceDetails.length > 0;
    }
    noOfUnitsInFraction(myAbsence: MyAbsence) {
        return noOfUnitsFraction(myAbsence);
    }
    constructor(private _data: RestClientService) {

    }
}
