import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { DropDownItem } from '../../employee/models/dropdown-item';
import {
    HolidayUnitType
    , WorkingDay
    , MyAbsenceDetailVM
    , FiscalYearSummary
    , MyAbsenceHistory
    , HalfDayType
    , MyAbsence
    , MyAbsenceVM
    , MyAbsenceDetail
    , MyAbsenceType
    , WorkingDayValidationModel
    , WorkingDayDetailModel
    , MyDelegateInfo,
    EmployeeConfig
} from '../models/holiday-absence.model';

import { EnumHelper } from '../../shared/helpers/enum-helper';
import { isNullOrUndefined, isNumber } from 'util';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { Response } from '@angular/http';
import * as Immutable from 'immutable';
import { AbsenceSubType, AbsenceType, EmployeeSettings, FiscalYear } from '../../shared/models/company.models';
import { StringHelper } from '../../shared/helpers/string-helper';
import { type } from '../../shared/util';
import { AbsenceStatus, AbsenceStatusCode } from '../../shared/models/lookup.models';

import { HolidaySummaryStatus } from './holiday-summary-status.enum';
import { HolidayUnitTypeEnum } from './holiday-unit-type';
import { ChartData } from '../../atlas-elements/common/ae-chart-data';
import { emptyGuid } from '../../shared/app.constants';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { DateTimeHelper } from '../../shared/helpers/datetime-helper';
import { BaseMessageVM } from '../../shared/models/base-message-vm';
import { CommonHelpers } from '../../shared/helpers/common-helpers';

type DateSelectionValidation = {
    IsValid: boolean
    , Message: string
    , Year: FiscalYear
};
type ValidationResultVM = { HasError: boolean, Message: string; StartDate: string; EndDate: string };

export function extractEmployeeSettings(response: Response): EmployeeSettings {
    let employeeSettings: EmployeeSettings = new EmployeeSettings();
    let body = response.json();
    if (!isNullOrUndefined(body)) {
        let firstItem = Array.from(body)[0];
        employeeSettings = ObjectHelper.extract(firstItem, employeeSettings);
    }
    return employeeSettings;
}

export function extractAbsenceTypes(response: Response): Array<AbsenceType> {
    let absenceTypes: AbsenceType[] = [];
    let body = response.json();
    if (body) {
        body.forEach(at => {
            //Id,TypeName,Color,PictureId,IsExample,AbsenceCode.Id as CodeId,AbsenceCode.Name as CodeName, AbsenceCode.Code as AbsenceCode, AbsenceSubType
            var atc = new AbsenceType();
            Object.assign(atc, at);
            atc.CodeId = at.AbsenceCode.Id
            atc.CodeName = at.AbsenceCode.Name;
            atc.AbsenceCode = at.AbsenceCode.Code;
            atc.NameAndCode = at.AbsenceCode.NameAndCode;
            absenceTypes.push(atc);
        });
    }
    // sort the list by typename
    absenceTypes = absenceTypes.sort(function (a, b) {
        if (a.TypeName < b.TypeName) return -1;
        if (a.TypeName > b.TypeName) return 1;
        return 0;
    });
    return absenceTypes;
}

export function mapAbsenceCodeToAeSelectItems(dataSource: any[]): Immutable.List<AeSelectItem<string>> {
    let absenceCodes = dataSource.sort(function (a, b) {
        if (a.Name < b.Name) return -1;
        if (a.Name > b.Name) return 1;
        return 0;
    });
    let aeSelectList = Immutable.List(dataSource.map((item) => {
        let ee = new AeSelectItem<string>(item.NameAndCode, item.Id, false);
        return ee;
    }));

    return aeSelectList;
}

export function mapAbsenceSubTypeToAeSelectItems(dataSource: any[]): Immutable.List<AeSelectItem<string>> {
    let items: Immutable.List<AeSelectItem<string>> = Immutable.List<AeSelectItem<string>>([]);
    if (dataSource != null) {
        dataSource = CommonHelpers.sortArray(dataSource, 'Name', SortDirection.Ascending);
        items = Immutable.List(dataSource.map((item) => {
            let ee = new AeSelectItem<string>(item.Name, item.Id, false);
            return ee;
        }));
    }
    return items;
}

// export function mapAbsenceSubTypeToAeSelectItems(response: response): AeSelectItem<string>[] {
//     let aeSelectList1 = Array.from(response.json().Entities) as DropDownItem[];
//     return aeSelectList1.map((keyValuePair) => {
//         let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id, false);
//         aeSelectItem.Childrens = null;
//         return aeSelectItem;
//     });

//}

export function extractFiscalYears(response: Response): Array<FiscalYear> {
    let fiscalYears: Array<FiscalYear> = [];
    let body = response.json();
    if (!isNullOrUndefined(body)) {
        fiscalYears = Array.from(body).map((year) => {
            let fiscalYear: FiscalYear = new FiscalYear();
            fiscalYear = ObjectHelper.extract(year, fiscalYear);
            return fiscalYear;
        });
    }
    return fiscalYears;
}

export function mapToAeSelectItems(fiscalYearSource: Array<FiscalYear>): Immutable.List<AeSelectItem<string>> {
    let fiscalYears: Array<AeSelectItem<string>> = [];
    if (!isNullOrUndefined(fiscalYearSource)) {
        fiscalYears = fiscalYearSource.map((year) => {
            let item: AeSelectItem<string> = new AeSelectItem<string>();
            item.Text = year.DisplayName;
            item.Value = year.StartDate + 'dt' + year.EndDate;;
            return item;
        });
    }
    return Immutable.List(fiscalYears);
}

export function extractAbsenceTypeDetails(response: Response): AbsenceType {
    let absenceTypeDetails: AbsenceType;
    let body = response.json();
    absenceTypeDetails = <AbsenceType>body;
    return absenceTypeDetails;
}

export function mapAbsenceTypesToAeSelectItems(absenceTypeSource: Array<AbsenceType>): Immutable.List<AeSelectItem<string>> {
    let absenceTypes: Array<AeSelectItem<string>> = [];
    if (!isNullOrUndefined(absenceTypeSource)) {
        absenceTypes = absenceTypeSource.map((absenceType) => {
            let item: AeSelectItem<string> = new AeSelectItem<string>();
            item.Text = absenceType.TypeName;
            item.Value = absenceType.Id;
            return item;
        }).sort((a, b) => a.Text.localeCompare(b.Text));
    }
    return Immutable.List(absenceTypes);
}

export function getAbsenceSubtypes(absenceTypes: Array<AbsenceType>, selectedAbsenceTypeId: string): Array<AbsenceSubType> {
    let subTypeList = absenceTypes
        .filter((absenceType) => absenceType.Id === selectedAbsenceTypeId)
        .map((absenceType) => absenceType.AbsenceSubType);
    return ObjectHelper.flatten<AbsenceSubType>(subTypeList);
}

export function mapAbsenceSubtypesToAeSelectItems(absenceSubtypeSource: Array<AbsenceSubType>): Immutable.List<AeSelectItem<string>> {
    let absenceSubtypes: Array<AeSelectItem<string>> = [];
    if (!isNullOrUndefined(absenceSubtypeSource)) {
        absenceSubtypes = absenceSubtypeSource.map((absenceType) => {
            let item: AeSelectItem<string> = new AeSelectItem<string>();
            item.Text = absenceType.Name;
            item.Value = absenceType.Id;
            return item;
        }).sort((a, b) => a.Text.localeCompare(b.Text));
    }
    return Immutable.List(absenceSubtypes);
}

export function extractHolidayUnitTypes(): Immutable.List<AeSelectItem<number>> {
    let unitTypes: Array<AeSelectItem<number>> = EnumHelper.getAeSelectItems(HolidayUnitType);
    return Immutable.List(unitTypes);
}

export function mapWorkingDaysToAbsenceDetails(workingDays: Array<WorkingDay>
    , myabsenceDetails: Array<MyAbsenceDetail>): Array<MyAbsenceDetailVM> {
    return workingDays.map((workingDay) => {
        let detailItem = new MyAbsenceDetailVM();
        detailItem.Date = workingDay.SelectedtDate;
        detailItem.StartTimeHours = workingDay.FromHour;
        detailItem.EndTimeHours = workingDay.ToHour;
        detailItem.IsAllApplied = workingDay.IsAllApplied;

        let filteredDetails: Array<MyAbsenceDetail>;
        if (!isNullOrUndefined(myabsenceDetails) && myabsenceDetails.length > 0) {
            filteredDetails = myabsenceDetails
                .filter(c => DateTimeHelper.getDatePart(c.FromHour).valueOf() ===
                    DateTimeHelper.getDatePart(workingDay.SelectedtDate).valueOf());
        }
        if (!isNullOrUndefined(filteredDetails) && filteredDetails.length > 0) {
            detailItem.Id = filteredDetails[0].Id;
            detailItem.RemainingHours = workingDay.RemainingHours + filteredDetails[0].NoOfUnits;
            detailItem.FromHour = DateTimeHelper.getTimePartWithoutTransform(filteredDetails[0].FromHour); //  DateTimeHelper.transformDate(filteredDetails[0].FromHour.toString());
            detailItem.ToHour = DateTimeHelper.getTimePartWithoutTransform(filteredDetails[0].ToHour);// DateTimeHelper.transformDate(filteredDetails[0].ToHour.toString());
            detailItem.Hours = filteredDetails[0].NoOfUnits;
            detailItem.LunchDuration = filteredDetails[0].LunchDuration;
        } else {
            detailItem.FromHour = workingDay.FromHour;
            detailItem.ToHour = workingDay.ToHour;
            detailItem.RemainingHours = workingDay.RemainingHours;
            detailItem.Hours = workingDay.Hours;
            detailItem.LunchDuration = 0;
        }

        detailItem.Hours = Math.round(detailItem.Hours * 100) / 100;
        let maxHoursPerDay = DateTimeHelper.getDurationInHours(detailItem.StartTimeHours, detailItem.EndTimeHours);
        detailItem.HasError = (isNullOrUndefined(filteredDetails) && detailItem.IsAllApplied) ||
            (!detailItem.IsAllApplied && workingDay.Hours > (detailItem.RemainingHours));
        if (detailItem.HasError) {
            detailItem.Message = 'Leave already applied for some or full portion of the day.';
        } else if (detailItem.Hours <= 0) {
            detailItem.HasError = true;
            detailItem.Message = 'No. of units should be greater than 0 hours.';
        } else {
            detailItem.HasError = false;
            detailItem.Message = '';
        }

        return detailItem;
    }).sort(function (a, b) {
        let c: any = new Date(a.Date);
        let d: any = new Date(b.Date);
        return c - d;
    });
}

export function extractWorkingDays(response: Response) {
    let workingDays: Array<WorkingDay> = [];
    let body = response.json();
    if (!isNullOrUndefined(body)) {
        let items = Array.from(body);
        items.forEach((item) => {
            let workingDay: WorkingDay = new WorkingDay();
            workingDay = ObjectHelper.extract(item, workingDay);

            let maxHoursPerDay = DateTimeHelper.getDurationInHours(workingDay.FromHour, workingDay.ToHour);
            if (!workingDay.IsAllApplied && workingDay.RemainingHours === 0) {
                workingDay.RemainingHours = maxHoursPerDay;
            }

            // if (maxHoursPerDay > workingDay.RemainingHours) {
            //     workingDay.Hours = 0;
            // } else {
            //     workingDay.Hours = maxHoursPerDay;
            // }
            workingDay.Hours = maxHoursPerDay;
            workingDays.push(workingDay);
        });
    }
    return workingDays;
}

export function validateSelectedDates(startDate: Date
    , endDate: Date
    , fiscalYears: Array<FiscalYear>
    , isHolidayMode: boolean): DateSelectionValidation {

    startDate = DateTimeHelper.getDatePart(startDate);
    endDate = DateTimeHelper.getDatePart(endDate);

    // , summaryList: Array<FiscalYearSummary>
    if (!isNullOrUndefined(endDate) && startDate > endDate) {
        return {
            IsValid: false,
            Message: 'End date must be greater than or equal to start date',
            Year: null
        };
    }

    if (!isHolidayMode) {
        return {
            IsValid: true,
            Message: '',
            Year: null
        };
    }

    let selectedFYear: FiscalYear;
    if (!isNullOrUndefined(fiscalYears)) {
        let filtertedYears = fiscalYears.filter((fiscalYear) => {
            let fyStartDate = DateTimeHelper.getDatePart(fiscalYear.StartDate);
            let fyEndDate = DateTimeHelper.getDatePart(fiscalYear.EndDate);

            if ((startDate >= fyStartDate && startDate <= fyEndDate) &&
                (endDate >= fyStartDate && endDate <= fyEndDate)) {
                return fiscalYear;
            }
        });

        if (!isNullOrUndefined(filtertedYears) && filtertedYears.length === 1) {
            selectedFYear = filtertedYears[0];
        }
    }

    if (isNullOrUndefined(selectedFYear)) {
        let crossFiscalYears = fiscalYears.filter((fiscalYear) => {
            let fyStartDate = DateTimeHelper.getDatePart(fiscalYear.StartDate);
            let fyEndDate = DateTimeHelper.getDatePart(fiscalYear.EndDate);

            if ((startDate >= fyStartDate && startDate <= fyEndDate) ||
                (endDate >= fyStartDate && endDate <= fyEndDate)) {
                return fiscalYear;
            }
        });

        if (!isNullOrUndefined(crossFiscalYears) && crossFiscalYears.length > 0) {
            return {
                IsValid: false,
                Message: 'Holidays cannot span across different fiscal years.',
                Year: null
            };
        } else {
            return {
                IsValid: false,
                Message: 'Invalid date selection.',
                Year: null
            };
        }
    } else {
        return {
            IsValid: true,
            Message: '',
            Year: selectedFYear
        };
    }
}

export function extractSummary(year: FiscalYear, summaryList: Array<FiscalYearSummary>) {
    let summary: FiscalYearSummary;
    if (!isNullOrUndefined(year) && !isNullOrUndefined(summaryList)) {
        let fyStartDate = DateTimeHelper.getDatePart(year.StartDate);
        let fyEndDate = DateTimeHelper.getDatePart(year.EndDate);

        let filteredSummaryList = summaryList.filter((summaryItem) => {
            let summaryStartDate = DateTimeHelper.getDatePartfromString(summaryItem.StartDate);
            let summaryEndDate = DateTimeHelper.getDatePartfromString(summaryItem.EndDate);

            return ((fyStartDate.valueOf() === summaryStartDate.valueOf())
                && (fyEndDate.valueOf() === summaryEndDate.valueOf()));
        });

        if (!isNullOrUndefined(filteredSummaryList) && filteredSummaryList.length > 0) {
            summary = filteredSummaryList[0];
        }
    }
    return summary;
}

export function extractFiscalYearSummary(response: Response, startDate: Date, endDate: Date): FiscalYearSummary {
    let fiscalYearSummary = new FiscalYearSummary();
    fiscalYearSummary = extractFiscalYearSummaryData(response);
    fiscalYearSummary.StartDate = startDate.toDateString();
    fiscalYearSummary.EndDate = endDate.toDateString();
    return fiscalYearSummary;
}

export function getFYSummary(startDate: Date, endDate: Date, summaryList: Array<FiscalYearSummary>): FiscalYearSummary {
    let fiscalYearSummary: FiscalYearSummary;
    let filteredSummaryList = summaryList.filter((summary) => {
        let summaryStartDate = DateTimeHelper.getDatePartfromString(summary.StartDate);
        let summaryEndDate = DateTimeHelper.getDatePartfromString(summary.EndDate);

        return ((startDate.valueOf() === summaryStartDate.valueOf())
            && (endDate.valueOf() === summaryEndDate.valueOf()));
    });

    if (!isNullOrUndefined(filteredSummaryList) && filteredSummaryList.length > 0) {
        return filteredSummaryList[0];
    }
    return fiscalYearSummary;
}

export function getAbsenceStatusIdByName(name: string, absenceStatuses: AbsenceStatus[]) {
    let statusList = absenceStatuses.filter((status) => status.Name === name).map((status) => status.Id);
    if (!isNullOrUndefined(statusList) && statusList.length > 0) {
        return statusList[0];
    }
    return '';
}

export function noOfUnitsInFraction(myAbsenceHistory: MyAbsenceHistory) {
    if (!isNullOrUndefined(myAbsenceHistory.NoOfUnits)) {
        if (!myAbsenceHistory.IsHour) {
            return getFormattedString(myAbsenceHistory.NoOfUnits) +
                ((myAbsenceHistory.NoOfUnits > 1 || myAbsenceHistory.NoOfUnits === 0) ? ' days ' : ' day ') +
                (HalfDayType[myAbsenceHistory.HalfDayType] || '');
        } else {
            return getFormattedString(myAbsenceHistory.NoOfUnits) +
                ((myAbsenceHistory.NoOfUnits > 1 || myAbsenceHistory.NoOfUnits === 0) ? ' hours' : 'hour');
        }
    }
    return '';
};

export function extractAbsenceHistory(res: Response) {
    let absenceHistoryList: Array<MyAbsenceHistory> = [];
    let body = res.json();
    if (!isNullOrUndefined(body)) {
        absenceHistoryList = Array.from(body).map((item: any) => {
            let absenceHistory = new MyAbsenceHistory();
            absenceHistory.StartDate = item['StartDate'];
            absenceHistory.EndDate = item['EndDate'];
            absenceHistory.RequestedDate = DateTimeHelper.getDateTimeStringFromISO(item['CreatedOn'], item.IsHour);
            absenceHistory.RequestedBy = !isNullOrUndefined(item.Author) ? item.Author.FullName : '';
            absenceHistory.Status = !isNullOrUndefined(item.Status) ? item.Status.Name : '';
            absenceHistory.NoOfUnits = item.NoOfUnits;
            absenceHistory.RequestedUnits = item.NoOfUnits;
            absenceHistory.IsHour = item.IsHour;
            absenceHistory.Isongoing = item.Isongoing;
            absenceHistory.HalfDayType = item.HalfDayType;
            absenceHistory.Comments = (
                absenceHistory.Status === 'Approved' ||
                absenceHistory.Status === 'Declined') ? item.Comment : item.Reason;

            absenceHistory.RequestedUnits = noOfUnitsInFraction(absenceHistory);
            return absenceHistory;
        })
            .sort(function (a, b) {
                let left = a.RequestedDate.split('/').reverse().join('');
                let right = b.RequestedDate.split('/').reverse().join('');
                return left < right ? 1 : left > right ? -1 : 0;
            });
    }
    return Immutable.List(absenceHistoryList);
}

export function extractHolidaysInformation(response: Response): MyAbsence[] {
    let myHolidaysList: MyAbsence[] = new Array();
    const body = response.json();
    const myHolidaysEntities = body.Entities;
    myHolidaysEntities.map((value, i) => {
        let item = new MyAbsence();
        myHolidaysList.push(item);
    });
    return myHolidaysList;
}

export function extractFiscalYearSummaryData(response: Response): FiscalYearSummary {
    let _fiscalYearSummary = response.json() as FiscalYearSummary;
    const entitlementUnitsToDisplay = _fiscalYearSummary.HolidayUnitType == HolidayUnitTypeEnum.Days ? _fiscalYearSummary.HolidayEntitlement : _fiscalYearSummary.HolidayEntitlementInHours;
    const unitsTakenToDisplay = _fiscalYearSummary.HolidayUnitType == HolidayUnitTypeEnum.Days ? _fiscalYearSummary.DaysTaken : _fiscalYearSummary.DaysTakenInHours;
    const applicableHolidayUnit = _fiscalYearSummary.HolidayUnitType == HolidayUnitTypeEnum.Days ? "days" : "hours";
    const carryForwardedUnitsToDisplay = _fiscalYearSummary.HolidayUnitType == HolidayUnitTypeEnum.Days ? _fiscalYearSummary.CarryForwardedToThisYearDays : _fiscalYearSummary.CarryForwardedToThisYearHours;
    const expiredCarryForwardedUnitsToDisplay = _fiscalYearSummary.HolidayUnitType == HolidayUnitTypeEnum.Days ? (_fiscalYearSummary.ExpCarryForwardedToThisYearDays ? _fiscalYearSummary.ExpCarryForwardedToThisYearDays : 0) : (_fiscalYearSummary.ExpCarryForwardedToThisYearHours ? _fiscalYearSummary.ExpCarryForwardedToThisYearHours : 0);
    const hasCarryForwardedUnitsExpired = _fiscalYearSummary.HasCarryForwardedUnitsExpired;
    const isRequestedForCurrentFYYear = _fiscalYearSummary.IsRequestedForRunningFYYear;
    const remaingUnitsToDisplay = _fiscalYearSummary.HolidayUnitType == HolidayUnitTypeEnum.Days ? _fiscalYearSummary.TotalAvailableHolidaysDaysToShow : _fiscalYearSummary.TotalAvailableHolidaysInHours;
    const holidaySummaryStatus = _fiscalYearSummary.Status;
    const remainingHoliDays = _fiscalYearSummary.TotalAvailableHolidaysDaysToShow;
    _fiscalYearSummary.EntitlementUnitsToDisplay = entitlementUnitsToDisplay;
    _fiscalYearSummary.UnitsTakenToDisplay = unitsTakenToDisplay;
    _fiscalYearSummary.ApplicableHolidayUnit = applicableHolidayUnit;
    _fiscalYearSummary.CarryForwardedUnitsToDisplay = carryForwardedUnitsToDisplay;
    _fiscalYearSummary.ExpiredCarryForwardedUnitsToDisplay = expiredCarryForwardedUnitsToDisplay;
    _fiscalYearSummary.HasCarryForwardedUnitsExpired = hasCarryForwardedUnitsExpired;
    _fiscalYearSummary.IsRequestedForCurrentFYYear = isRequestedForCurrentFYYear;
    _fiscalYearSummary.RemainingUnitsToDisplay = remaingUnitsToDisplay;
    _fiscalYearSummary.RemainingHoliDays = remainingHoliDays;
    return _fiscalYearSummary;
}

export function extractDonutChartData(myHolidaysWorkingDays: FiscalYearSummary, employeeSettings: EmployeeSettings): ChartData[] {
    if (isNullOrUndefined(myHolidaysWorkingDays)) return [];
    let chartData: ChartData[] = [];
    let allowCarryForwardHolidays = employeeSettings ? employeeSettings.AllowCarryForwardHolidays : false;
    let unitsTakenToDisplay = myHolidaysWorkingDays.HolidayUnitType == HolidayUnitTypeEnum.Days ? myHolidaysWorkingDays.DaysTaken : myHolidaysWorkingDays.DaysTakenInHours;
    let unitsTakenTooltipText = "Taken";
    chartData.push(new ChartData(unitsTakenToDisplay, '#009494', unitsTakenTooltipText, 'chart-indicator--teal'));
    if (allowCarryForwardHolidays && (myHolidaysWorkingDays.Status == HolidaySummaryStatus.Historical || myHolidaysWorkingDays.Status == HolidaySummaryStatus.HistoricalDataNotFound)) {
        const carryForwardedUnitsToThisYear = myHolidaysWorkingDays.HolidayUnitType == HolidayUnitTypeEnum.Days ? myHolidaysWorkingDays.CarryForwardedToThisYearDays : myHolidaysWorkingDays.CarryForwardedToThisYearHours;
        const carryForwardedUnitsTooltipText = "Carry forwarded to this year";
        const expCarryForwardedUnitsToThisYear = myHolidaysWorkingDays.HolidayUnitType == HolidayUnitTypeEnum.Days ? myHolidaysWorkingDays.ExpCarryForwardedToThisYearDays : myHolidaysWorkingDays.ExpCarryForwardedToThisYearHours;
        const expCarryForwardedUnitsTooltipText = "Exp carry forwarded to this year";
        const carryForwardedUnitsToNextYear = myHolidaysWorkingDays.HolidayUnitType == HolidayUnitTypeEnum.Days ? myHolidaysWorkingDays.CarryForwardedToNextYearDays : myHolidaysWorkingDays.CarryForwardedToNextYearHours;
        const carryForwardedUnitsToNextYearTooltipText = "Carry forwarded to next year";
        chartData.push(new ChartData(expCarryForwardedUnitsToThisYear, '#df0000', expCarryForwardedUnitsTooltipText, 'chart-indicator--red'));
        chartData.push(new ChartData(carryForwardedUnitsToThisYear, '#fec352', carryForwardedUnitsTooltipText, 'chart-indicator--yellow'));
        chartData.push(new ChartData(carryForwardedUnitsToNextYear, '#8b8b8b', carryForwardedUnitsToNextYearTooltipText, 'chart-indicator--grey'));
    }
    else {
        const pendingUnitsToDisplay = myHolidaysWorkingDays.HolidayUnitType == HolidayUnitTypeEnum.Days ? myHolidaysWorkingDays.PendingHoliday : myHolidaysWorkingDays.PendingHolidaysInHours;
        const pendingTooltipText = "Pending";
        const approvedFutureUnitsToDisplay = myHolidaysWorkingDays.HolidayUnitType == HolidayUnitTypeEnum.Days ? myHolidaysWorkingDays.ApprovedFutureHoliday : myHolidaysWorkingDays.ApprovedFutureHolidayInHours;
        const approvedFutureTooltip = "Approved for future";
        const remaingUnitsToDisplay = myHolidaysWorkingDays.HolidayUnitType == HolidayUnitTypeEnum.Days ? myHolidaysWorkingDays.TotalAvailableHolidaysDaysToShow : myHolidaysWorkingDays.TotalAvailableHolidaysInHours;
        const remaingUnitsTooltip = "Remaining";
        const overBookedUnitsToDisplay = myHolidaysWorkingDays.HolidayUnitType == HolidayUnitTypeEnum.Days ? myHolidaysWorkingDays.OverBookedHoliday : myHolidaysWorkingDays.OverBookedHolidayInHours;
        const overBookedUnitsTooltip = "Over booked";
        chartData.push(new ChartData(pendingUnitsToDisplay, '#8b8b8b', pendingTooltipText, 'chart-indicator--grey'));
        chartData.push(new ChartData(approvedFutureUnitsToDisplay, '#9d85be', approvedFutureTooltip, 'chart-indicator--purple'));
        chartData.push(new ChartData(overBookedUnitsToDisplay, '#df0000', overBookedUnitsTooltip, 'chart-indicator--red'));
        chartData.push(new ChartData(remaingUnitsToDisplay, '#fec352', remaingUnitsTooltip, 'chart-indicator--yellow'));
    }

    return chartData;
}

export function extractMyAbsencesList(response: Response): Immutable.List<MyAbsence> {
    let myAbsences = response.json().Entities as MyAbsence[];
    myAbsences = processMyAbsencesList(myAbsences);
    return Immutable.List<MyAbsence>(myAbsences);
}

export function getFormattedString(fraction: number): string {
    if (!isNullOrUndefined(fraction)) {
        let strFraction = fraction.toFixed(2);
        if (strFraction.indexOf('.00') !== -1) {
            let splitData = strFraction.split(".");
            return splitData[0];
        } else {
            return strFraction;
        }
    }
    return '';
}

export function noOfUnitsFraction(myAbsence: MyAbsence): string {
    let fraction: string = '00:00';
    if (isNullOrUndefined(myAbsence)) {
        return fraction;
    };
    if (!myAbsence.IsHour) {
        if (myAbsence.NoOfUnits != null) {
            let halfDay = '';
            if (myAbsence.HalfDayType === 1) {
                halfDay = 'AM';
            } else if (myAbsence.HalfDayType === 2) {
                halfDay = 'PM';
            }

            if (myAbsence.NoOfUnits && myAbsence.NoOfUnits > 1) {
                return getFormattedString(myAbsence.NoOfUnits) + ' days ' + halfDay;
            } else {
                return getFormattedString(myAbsence.NoOfUnits) + ' day ' + halfDay;
            }

        }
    } else {
        if (myAbsence.NoOfUnits && myAbsence.NoOfUnits > 1) {
            return getFormattedString(myAbsence.NoOfUnits) + ' hours';
        } else {
            return getFormattedString(myAbsence.NoOfUnits) + ' hour';
        }

    }
    return fraction;
};

export function processMyAbsencesList(absences: MyAbsence[]): MyAbsence[] {
    if (absences) {
        absences.forEach(obj => {
            obj.NoOfUnitsInFraction = noOfUnitsFraction(obj);
            obj.NeedToShowAbsencesInPopOver = obj && obj.IsHour && obj.MyAbsenceDetails && obj.MyAbsenceDetails.length > 0;
            obj.EmployeeName = obj.Employee.FirstName + ' ' + (isNullOrUndefined(obj.Employee.MiddleName) ? '' : obj.Employee.MiddleName) + ' ' + obj.Employee.Surname;
            obj.DepartmentName = obj.Employee.Job && obj.Employee.Job.Department ? obj.Employee.Job.Department.Name : '';
            obj.ApprovedByName = obj.ApprovedByUser ? obj.ApprovedByUser.FullName : '';
            obj.DepartmentId = obj.Employee.Job && obj.Employee.Job.Department ? obj.Employee.Job.Department.Id : '';
            obj.RequestTypeTitle = obj.TypeId == MyAbsenceType.Holiday ? 'Holiday' : (obj.AbsencesType.TypeName + (obj.AbsencesSubType ? ' - ' + obj.AbsencesSubType.Name : ''));
        });
    }
    return absences;
}

export function extractDelegateInfo(response: Response) {
    let delegateInfo = response.json().OtherInfo as MyDelegateInfo[];
    return delegateInfo;
}

export function extractMyAbsencefromVM(myAbsenceVM: MyAbsenceVM) {
    let myAbsenceEntity = new MyAbsence();
    myAbsenceEntity.HolidayUnitType = myAbsenceVM.UnitType;
    myAbsenceEntity.IsHour = (myAbsenceVM.UnitType == HolidayUnitType.Hours);
    myAbsenceEntity.HalfDayType = myAbsenceVM.HalfDayType;
    myAbsenceEntity.TypeId = myAbsenceVM.Type;
    myAbsenceEntity.Reason = myAbsenceVM.Reason;
    myAbsenceEntity.MyAbsenceDetails = null;
    myAbsenceEntity.Id = myAbsenceVM.Id;

    if (myAbsenceVM.Type == MyAbsenceType.Absence) {
        myAbsenceEntity.AbsenTypeId = myAbsenceVM.AbsenceTypeId;
        myAbsenceEntity.SubtypeId = myAbsenceVM.AbsenceSubtypeId;
        myAbsenceEntity.Isongoing = myAbsenceVM.Isongoing;
    }

    if (myAbsenceVM.Type == MyAbsenceType.Holiday) {
        myAbsenceEntity.AbsenTypeId = null;
        myAbsenceEntity.SubtypeId = null;
        myAbsenceEntity.Isongoing = false;
    }

    myAbsenceEntity.NoOfUnits = myAbsenceVM.Isongoing ? 0 : myAbsenceVM.NoOfUnits;
    myAbsenceEntity.NoOfDays = myAbsenceVM.Isongoing ? 0 : myAbsenceVM.Duration;

    if (myAbsenceVM.UnitType == HolidayUnitType.Hours) {
        if (!isNullOrUndefined(myAbsenceVM.MyAbsenceDetails) &&
            myAbsenceVM.MyAbsenceDetails.length > 0) {
            myAbsenceEntity.MyAbsenceDetails = [];
            myAbsenceEntity.MyAbsenceDetails = myAbsenceVM.MyAbsenceDetails.map((item) => {
                let myAbsenceDetail = new MyAbsenceDetail();
                myAbsenceDetail.Id = emptyGuid;
                myAbsenceDetail.CompanyId = myAbsenceEntity.CompanyId;
                myAbsenceDetail.NoOfUnits = item.Hours;
                myAbsenceDetail.LunchDuration = !isNullOrUndefined(item.LunchDuration) ? item.LunchDuration : 0;
                myAbsenceDetail.ToHour = DateTimeHelper.getDateFromFormattedHours(item.Date, item.ToHour);
                myAbsenceDetail.FromHour = DateTimeHelper.getDateFromFormattedHours(item.Date, item.FromHour);
                return myAbsenceDetail;
            });

            myAbsenceEntity.StartDate = myAbsenceEntity.MyAbsenceDetails[0].FromHour.toDateString();
            myAbsenceEntity.FromDate = myAbsenceEntity.MyAbsenceDetails[0].FromHour;//DateTimeHelper.getDateTimeFromISO(myAbsenceEntity.MyAbsenceDetails[0].FromHour, true);
            if (!myAbsenceEntity.Isongoing) {
                myAbsenceEntity.EndDate = myAbsenceEntity.MyAbsenceDetails[myAbsenceEntity.MyAbsenceDetails.length - 1].ToHour.toDateString();
                myAbsenceEntity.ToDate = myAbsenceEntity.MyAbsenceDetails[myAbsenceEntity.MyAbsenceDetails.length - 1].ToHour;//DateTimeHelper.getDateTimeFromISO(myAbsenceEntity.MyAbsenceDetails[myAbsenceEntity.MyAbsenceDetails.length - 1].ToHour, true);
            } else {
                myAbsenceEntity.EndDate = null;
                myAbsenceEntity.ToDate = null;
            }
        }
    } else {
        myAbsenceEntity.FromDate = myAbsenceVM.StartDate;
        myAbsenceEntity.ToDate = !isNullOrUndefined(myAbsenceVM.EndDate) ? myAbsenceVM.EndDate : null;

        myAbsenceEntity.StartDate = myAbsenceVM.StartDate.toDateString();
        myAbsenceEntity.EndDate = !isNullOrUndefined(myAbsenceVM.EndDate) ? myAbsenceVM.EndDate.toDateString() : null;
    }
    return myAbsenceEntity;
}

export function extractMyAbsenceVM(myAbsence: MyAbsence, workingDays: Array<WorkingDay>) {
    let myAbsenceVM = new MyAbsenceVM();
    myAbsenceVM.AbsenceTypeId = myAbsence.AbsenTypeId;
    myAbsenceVM.AbsenceSubtypeId = myAbsence.SubtypeId || '';
    myAbsenceVM.Duration = myAbsence.NoOfDays;
    myAbsenceVM.NoOfUnits = myAbsence.NoOfUnits;
    myAbsenceVM.StartDate = DateTimeHelper.getDatePartfromString(myAbsence.StartDate);
    myAbsenceVM.EndDate = DateTimeHelper.getDatePartfromString(myAbsence.EndDate);
    myAbsenceVM.UnitType = myAbsence.HolidayUnitType;
    myAbsenceVM.Reason = myAbsence.Reason;
    myAbsenceVM.Comment = myAbsence.Comment;
    myAbsenceVM.Id = myAbsence.Id;
    myAbsenceVM.Type = myAbsence.TypeId;
    myAbsenceVM.Isongoing = myAbsence.Isongoing;
    myAbsenceVM.HalfDayType = myAbsence.HalfDayType;
    if (!isNullOrUndefined(myAbsence.MyAbsenceDetails) &&
        myAbsence.HolidayUnitType == HolidayUnitType.Hours) {
        let totalHours: number = 0;
        myAbsenceVM.MyAbsenceDetails = myAbsence.MyAbsenceDetails
            .filter(c => isNullOrUndefined(c['IsDeleted']) ||
                (!isNullOrUndefined(c['IsDeleted']) && c['IsDeleted'] == false))
            .map((c) => {

                let workingDay: WorkingDay;
                if (!isNullOrUndefined(workingDays) && workingDays.length > 0) {
                    let filteredDays = workingDays
                        .filter((day) => DateTimeHelper.getDatePart(day.SelectedtDate).valueOf() ===
                            DateTimeHelper.getDatePart(c.FromHour).valueOf());
                    if (!isNullOrUndefined(filteredDays) && filteredDays.length > 0) {
                        workingDay = filteredDays[0];
                    }
                }

                let detail = new MyAbsenceDetailVM();
                detail.Id = c.Id;
                detail.Date = DateTimeHelper.getDatePart(c.FromHour);
                detail.EndTimeHours = workingDay ? workingDay.ToHour : '08:00';
                detail.StartTimeHours = workingDay ? workingDay.FromHour : '17:00'
                detail.IsAllApplied = workingDay ? workingDay.IsAllApplied : false;
                detail.RemainingHours = workingDay ? (workingDay.RemainingHours + c.NoOfUnits) : c.NoOfUnits;
                detail.Hours = c.NoOfUnits;
                detail.FromHour = DateTimeHelper.getTimePartWithoutTransform(c.FromHour); //DateTimeHelper.transformDate(c.FromHour.toString());
                detail.ToHour = DateTimeHelper.getTimePartWithoutTransform(c.ToHour);;//   DateTimeHelper.transformDate(c.ToHour.toString());
                detail.CanExcludeLunchDuration = (c.LunchDuration > 0) ? true : null;
                detail.LunchDuration = c.LunchDuration;
                totalHours = totalHours + c.NoOfUnits;

                let maxHoursPerDay = DateTimeHelper.getDurationInHours(detail.StartTimeHours, detail.EndTimeHours);

                detail.HasError = (isNullOrUndefined(workingDay) && detail.IsAllApplied) ||
                    (!detail.IsAllApplied && detail.Hours > (detail.RemainingHours));
                if (detail.HasError) {
                    detail.Message = 'Leave already applied for some or full portion of the day.';
                } else if (detail.Hours <= 0) {
                    detail.HasError = true;
                    detail.Message = 'No. of units should be greater than zero.';
                } else {
                    detail.HasError = false;
                    detail.Message = '';
                }

                return detail;
            }).sort(function (a, b) {
                let c: any = new Date(a.Date);
                let d: any = new Date(b.Date);
                return c - d;
            });
        myAbsenceVM.NoOfUnits = Math.round((totalHours * 100)) / 100;
    }
    return myAbsenceVM;
}

export function mergeMyAbsenceEntity(myAbsenceVM: MyAbsenceVM) {
    let myAbsence = new MyAbsence();
    myAbsence.HolidayUnitType = myAbsenceVM.UnitType;
    myAbsence.HalfDayType = myAbsenceVM.HalfDayType;
    myAbsence.TypeId = myAbsenceVM.Type;
    myAbsence.Reason = myAbsenceVM.Reason;
    myAbsence.Comment = myAbsenceVM.Comment;
    myAbsence.Id = myAbsenceVM.Id;
    myAbsence.MyAbsenceDetails = null;
    myAbsence.Status = null;
    myAbsence.IsHour = myAbsenceVM.UnitType == HolidayUnitType.Hours;

    if (myAbsenceVM.Type == MyAbsenceType.Absence) {
        myAbsence.AbsenTypeId = myAbsenceVM.AbsenceTypeId;
        myAbsence.SubtypeId = myAbsenceVM.AbsenceSubtypeId;
        myAbsence.Isongoing = myAbsenceVM.Isongoing;
    }

    if (myAbsenceVM.Type == MyAbsenceType.Holiday) {
        myAbsence.AbsenTypeId = null;
        myAbsence.SubtypeId = null;
        myAbsence.Isongoing = false;
    }

    myAbsence.NoOfUnits = myAbsenceVM.Isongoing ? 0 : myAbsenceVM.NoOfUnits;
    myAbsence.NoOfDays = myAbsenceVM.Isongoing ? 0 : myAbsenceVM.Duration;

    if (myAbsenceVM.UnitType == HolidayUnitType.Hours) {
        if (!isNullOrUndefined(myAbsenceVM.MyAbsenceDetails) &&
            myAbsenceVM.MyAbsenceDetails.length > 0) {
            myAbsence.MyAbsenceDetails = [];
            myAbsence.MyAbsenceDetails = myAbsenceVM.MyAbsenceDetails.map((item) => {
                let myAbsenceDetail = new MyAbsenceDetail();
                myAbsenceDetail.Id = item.Id;
                myAbsenceDetail.CompanyId = myAbsence.CompanyId;
                myAbsenceDetail.NoOfUnits = item.Hours;
                myAbsenceDetail.LunchDuration = !isNullOrUndefined(item.LunchDuration) ? item.LunchDuration : 0;
                myAbsenceDetail.ToHour = DateTimeHelper.getDateFromFormattedHours(item.Date, item.ToHour);
                myAbsenceDetail.FromHour = DateTimeHelper.getDateFromFormattedHours(item.Date, item.FromHour);
                return myAbsenceDetail;
            });
            myAbsence.StartDate = myAbsence.MyAbsenceDetails[0].FromHour.toDateString();
            myAbsence.FromDate = myAbsence.MyAbsenceDetails[0].FromHour;//DateTimeHelper.getDateTimeFromISO(myAbsence.MyAbsenceDetails[0].FromHour, true);
            if (!myAbsence.Isongoing) {
                myAbsence.EndDate = myAbsence.MyAbsenceDetails[myAbsence.MyAbsenceDetails.length - 1].ToHour.toDateString();
                myAbsence.ToDate = myAbsence.MyAbsenceDetails[myAbsence.MyAbsenceDetails.length - 1].ToHour; //DateTimeHelper.getDateTimeFromISO(myAbsence.MyAbsenceDetails[myAbsence.MyAbsenceDetails.length - 1].ToHour, true);
            } else {
                myAbsence.EndDate = null;
                myAbsence.ToDate = null;
            }
        }
    } else {
        myAbsence.FromDate = myAbsenceVM.StartDate;
        myAbsence.ToDate = !isNullOrUndefined(myAbsenceVM.EndDate) ? myAbsenceVM.EndDate : null;

        myAbsence.StartDate = myAbsenceVM.StartDate.toDateString();
        myAbsence.EndDate = myAbsenceVM.EndDate.toDateString();
    }
    return myAbsence;
}

export function prepareModelForUpdate(employeeAbsenceInput: MyAbsence) {
    let employeeAbsence: MyAbsence = Object.assign({}, employeeAbsenceInput);
    if (employeeAbsence.HolidayUnitType == HolidayUnitType.Hours) {
        employeeAbsence.FromDate = employeeAbsence.MyAbsenceDetails[0].FromHour; //DateTimeHelper.getDateTimeFromISO(employeeAbsence.MyAbsenceDetails[0].FromHour, true);
        if (!employeeAbsence.Isongoing ||
            (employeeAbsence.Isongoing && !isNullOrUndefined(employeeAbsence.EndDate))) {
            let toHour = employeeAbsence.MyAbsenceDetails[employeeAbsence.MyAbsenceDetails.length - 1].ToHour;
            if (toHour instanceof Date) {
                employeeAbsence.EndDate = toHour.toDateString();
            } else {
                employeeAbsence.EndDate = new Date(toHour).toDateString();
            }
            employeeAbsence.ToDate = employeeAbsence.MyAbsenceDetails[employeeAbsence.MyAbsenceDetails.length - 1].ToHour //DateTimeHelper.getDateTimeFromISO(employeeAbsence.MyAbsenceDetails[employeeAbsence.MyAbsenceDetails.length - 1].ToHour, true);
        } else {
            employeeAbsence.EndDate = null;
            employeeAbsence.ToDate = null;
        }
    } else {
        employeeAbsence.FromDate = DateTimeHelper.getDatePartfromString(employeeAbsence.StartDate);
        employeeAbsence.ToDate = !isNullOrUndefined(employeeAbsence.EndDate) ?
            DateTimeHelper.getDatePartfromString(employeeAbsence.EndDate) :
            null;

        employeeAbsence.StartDate = employeeAbsence.FromDate.toDateString();
        employeeAbsence.EndDate = !isNullOrUndefined(employeeAbsence.ToDate) ?
            employeeAbsence.ToDate.toDateString() :
            null;
    }
    return employeeAbsence;
}

export function extractDaysToValidate(myAbsenceVM: MyAbsenceVM, myAbsence: MyAbsence): Array<WorkingDayValidationModel> {
    let itemsToValidate = [];

    if (!isNullOrUndefined(myAbsenceVM) &&
        isNullOrUndefined(myAbsenceVM.MyAbsenceDetails)) {
        myAbsenceVM.MyAbsenceDetails = [];
    }

    if (myAbsenceVM.UnitType == HolidayUnitType.Hours) {
        itemsToValidate = myAbsenceVM.MyAbsenceDetails.map((item) => {
            let workingDayValidationModel = new WorkingDayValidationModel();
            workingDayValidationModel.startDate = DateTimeHelper.getDatePart(item.Date).toDateString();
            workingDayValidationModel.endDate = DateTimeHelper.getDatePart(item.Date).toDateString();
            workingDayValidationModel.ongoing = false;
            workingDayValidationModel.checkEnd = false;
            workingDayValidationModel.editObject = myAbsence || null;

            workingDayValidationModel.validDateTime = new WorkingDayDetailModel();

            workingDayValidationModel.validDateTime.StartTime = item.FromHour;
            workingDayValidationModel.validDateTime.EndTime = item.ToHour;
            workingDayValidationModel.validDateTime.GlobalStartTime = item.StartTimeHours;
            workingDayValidationModel.validDateTime.GlobalEndTime = item.EndTimeHours;
            workingDayValidationModel.validDateTime.GlobalMaxHours
                = DateTimeHelper.getDurationInHours(item.StartTimeHours, item.EndTimeHours);
            return workingDayValidationModel;
        });
    } else {
        let workingDayValidationModel = new WorkingDayValidationModel();
        workingDayValidationModel.startDate = myAbsenceVM.StartDate.toDateString();
        workingDayValidationModel.endDate = !isNullOrUndefined(myAbsenceVM.EndDate) ? myAbsenceVM.EndDate.toDateString() : null;
        workingDayValidationModel.ongoing = (myAbsenceVM.Type == MyAbsenceType.Absence && myAbsenceVM.Isongoing);
        workingDayValidationModel.checkEnd = (
            myAbsenceVM.Type == MyAbsenceType.Absence &&
            !isNullOrUndefined(myAbsenceVM) &&
            myAbsenceVM.Isongoing);
        workingDayValidationModel.editObject = myAbsence || null;

        workingDayValidationModel.validDateTime = null;

        itemsToValidate = Array.of(workingDayValidationModel);
    }
    return itemsToValidate;
}

export function extractValidationResult(response: Response): Array<ValidationResultVM> {
    let body = response.json();
    let result: Array<ValidationResultVM> = [];
    if (body.hasOwnProperty('Entities')) {
        result = Array.from(body.Entities).map((entity) => {
            return {
                HasError: !entity['IsValid'] as boolean,
                Message: entity['Message'] as string,
                StartDate: entity['StartDate'] as string,
                EndDate: entity['EndDate'] as string
            };
        });
        return result;
    }
    return result;
}

export function getFiscalYear(startDate: Date, endDate: Date, fiscalYears: Array<FiscalYear>): FiscalYear {
    let selectedFYear: FiscalYear;
    if (!isNullOrUndefined(fiscalYears)) {
        let filtertedYears = fiscalYears.filter((fiscalYear) => {
            let fyStartDate = DateTimeHelper.getDatePart(fiscalYear.StartDate);
            let fyEndDate = DateTimeHelper.getDatePart(fiscalYear.EndDate);

            if ((startDate >= fyStartDate && startDate <= fyEndDate) &&
                (endDate >= fyStartDate && endDate <= fyEndDate)) {
                return fiscalYear;
            }
        });

        if (!isNullOrUndefined(filtertedYears) && filtertedYears.length === 1) {
            selectedFYear = filtertedYears[0];
        }
    }
    return selectedFYear;
}

export function showCompleteSnackbarMessage(message: string, myAbsenceType: MyAbsenceType) {
    let snackbarVM = ObjectHelper.createInsertCompleteSnackbarMessage(MyAbsenceType[myAbsenceType], message);
    snackbarVM.message = snackbarVM.message.substring(0, snackbarVM.message.length - 3);
    return new BaseMessageVM(snackbarVM.message, snackbarVM.type, snackbarVM.event, snackbarVM.status);
}

export function showInProgressSnackbarMessage(message: string, myAbsenceType: MyAbsenceType) {
    let snackbarVM = ObjectHelper.createInsertInProgressSnackbarMessage(MyAbsenceType[myAbsenceType], message);
    snackbarVM.message = snackbarVM.message.substring(0, snackbarVM.message.length - 3);
    return new BaseMessageVM(snackbarVM.message, snackbarVM.type, snackbarVM.event, snackbarVM.status);
}

export function prepareModel(employeeAbsenceVM: MyAbsenceVM
    , employeeConfig: EmployeeConfig
    , absenceStatuses: Array<AbsenceStatus>
    , isApproved: boolean
    , approvedBy: string) {
    let myAbsenceEntity = extractMyAbsencefromVM(employeeAbsenceVM);
    myAbsenceEntity.EmployeeId = employeeConfig.Id;
    myAbsenceEntity.EmployeeName = `${employeeConfig.FirstName} ${employeeConfig.Surname}`;
    myAbsenceEntity.SubmittedToUserId = employeeConfig.ManagerUserId;
    myAbsenceEntity.StatusId = getAbsenceStatusIdByName('Requested', absenceStatuses);
    myAbsenceEntity.CompanyId = employeeConfig.CompanyId;
    if (!isNullOrUndefined(myAbsenceEntity.MyAbsenceDetails)) {
        myAbsenceEntity.MyAbsenceDetails.forEach((detail) => {
            detail.CompanyId = myAbsenceEntity.CompanyId;
        });
    }
    if (isApproved && !StringHelper.isNullOrUndefinedOrEmpty(approvedBy)) {
        myAbsenceEntity.ApprovedBy = approvedBy;
        myAbsenceEntity.ApprovedByUser = null;
    }
    return myAbsenceEntity;
}

export function isRequestforChange(employeeAbsence: MyAbsence, absenceStatuses: Array<AbsenceStatus>) {
    if (!isNullOrUndefined(employeeAbsence) &&
        !StringHelper.isNullOrUndefinedOrEmpty(employeeAbsence.StatusId)) {
        let absenceStatus = absenceStatuses.filter(c => c.Id == employeeAbsence.StatusId)[0];
        return absenceStatus.Code == AbsenceStatusCode.Approved || absenceStatus.Code == AbsenceStatusCode.Requestforchange;
    }
}

export function prepareUpdateModel(employeeAbsence: MyAbsence
    , employeeAbsenceVM: MyAbsenceVM
    , employeeConfig: EmployeeConfig
    , employeeSettings: EmployeeSettings
    , absenceStatuses: Array<AbsenceStatus>
    , isApproved: boolean
    , approvedBy: string) {
    let myAbsenceEntity: MyAbsence = Object.assign({}, employeeAbsence, mergeMyAbsenceEntity(employeeAbsenceVM));
    if ((isApproved && !StringHelper.isNullOrUndefinedOrEmpty(approvedBy)) || (!isNullOrUndefined(employeeAbsence) && !StringHelper.isNullOrUndefinedOrEmpty(employeeAbsence.ApprovedBy))) {
        myAbsenceEntity.ApprovedBy = !isNullOrUndefined(approvedBy) ? approvedBy : employeeAbsence.ApprovedBy;
        myAbsenceEntity.ApprovedByUser = null;
    }

    myAbsenceEntity.CompanyId = employeeConfig.CompanyId;
    myAbsenceEntity.EmployeeId = employeeConfig.Id;
    myAbsenceEntity.EmployeeName = `${employeeConfig.FirstName} ${employeeConfig.Surname}`;
    if (!isNullOrUndefined(myAbsenceEntity.MyAbsenceDetails)) {
        myAbsenceEntity.MyAbsenceDetails.forEach((detail) => {
            detail.MyAbsenceId = myAbsenceEntity.Id;
            detail.CompanyId = myAbsenceEntity.CompanyId;
        });
    }
    if (myAbsenceEntity.Isongoing && !isNullOrUndefined(myAbsenceEntity.EndDate)) {
        myAbsenceEntity.Isongoing = false;
        myAbsenceEntity.ResubmittedCount = employeeSettings.NoOfTimesResubmit;
    } else if (myAbsenceEntity.ResubmittedCount < employeeSettings.NoOfTimesResubmit) {
        myAbsenceEntity.ResubmittedCount = myAbsenceEntity.ResubmittedCount + 1;
    }

    if (isRequestforChange(employeeAbsence, absenceStatuses)) {
        if (isApproved) {
            myAbsenceEntity.StatusId = getAbsenceStatusIdByName('Approved', absenceStatuses);
        } else {
            myAbsenceEntity.StatusId = getAbsenceStatusIdByName('Request for change', absenceStatuses);
        }
    } else if (isApproved) {
        let reqForcancellationStatusId = getAbsenceStatusIdByName('Request for cancellation', absenceStatuses);
        let cancelledStatusId = getAbsenceStatusIdByName('Cancelled', absenceStatuses);
        let approvedStatusId = getAbsenceStatusIdByName('Approved', absenceStatuses);

        if (employeeAbsence.StatusId == reqForcancellationStatusId) {
            myAbsenceEntity.StatusId = cancelledStatusId;
        } else {
            myAbsenceEntity.StatusId = approvedStatusId;
        }
    } else {
        myAbsenceEntity.StatusId = getAbsenceStatusIdByName('Requested', absenceStatuses);
    }
    return myAbsenceEntity;
}

export function holidayAbsenceSaveInProgressMessage(employeeAbsence: MyAbsence, statusCode: number) {
    let requestType = MyAbsenceType[employeeAbsence.TypeId].toLowerCase();
    let statusName: string;

    switch (statusCode) {
        case 4:
            statusName = 'Approving';
            break;
        case 6:
            statusName = 'Cancelling';
            break;
        case 5:
            statusName = 'Declining';
            break;
        case 1:
            statusName = 'Submitting';
            break;
        case 2:
        case 3:
        case 7:
        case 8:
            statusName = 'Updating';
            break;
        default:
            statusName = '';
            break;
    }

    return `${statusName} ${requestType} request...`;
}

export function holidayAbsenceSaveCompleteMessage(employeeAbsence: MyAbsence
    , statusCode: number
    , showName: boolean) {
    let requestType = MyAbsenceType[employeeAbsence.TypeId];
    let statusName: string, fromDate: string, toDate: string;
    let requestOf: string = '';

    if (employeeAbsence.HolidayUnitType == HolidayUnitType.Hours) {
        fromDate = DateTimeHelper.formatDate(employeeAbsence.FromDate, true);
        toDate = !isNullOrUndefined(employeeAbsence.ToDate) ?
            DateTimeHelper.formatDate(employeeAbsence.ToDate, true)
            : 'ongoing';
    } else {
        fromDate = DateTimeHelper.formatDate(employeeAbsence.FromDate, false);
        toDate = !isNullOrUndefined(employeeAbsence.ToDate) ?
            DateTimeHelper.formatDate(employeeAbsence.ToDate, false)
            : 'ongoing';
    }

    switch (statusCode) {
        case 4:
            statusName = 'approved';
            break;
        case 6:
            statusName = 'cancelled';
            break;
        case 5:
            statusName = 'declined';
            break;
        case 1:
            statusName = 'submitted';
            break;
        case 2:
        case 3:
        case 7:
        case 8:
            statusName = 'updated';
            break;
        default:
            statusName = '';
            break;
    }

    if (showName) {
        requestOf = `of ${employeeAbsence.EmployeeName} `;
    }

    return `${requestType} request ${requestOf}from ${fromDate} to ${toDate} has been ${statusName}.`;
}

export function reloadSummary(myabsence: MyAbsence
    , fiscalYears: Array<FiscalYear>
    , selectedStartDate: string
    , selectedEndDate: string) {
    let startDate: Date = DateTimeHelper.getDatePartfromString(myabsence.StartDate);
    let endDate: Date = DateTimeHelper.getDatePartfromString(myabsence.EndDate);

    let fiscalYear = getFiscalYear(startDate, endDate, fiscalYears);

    let fyStartDate: Date = DateTimeHelper.getDatePartfromString(selectedStartDate);
    let fyEndDate: Date = DateTimeHelper.getDatePartfromString(selectedEndDate);

    let refreshSummary = (fyStartDate.valueOf() === DateTimeHelper.getDatePart(fiscalYear.StartDate).valueOf() &&
        fyEndDate.valueOf() === DateTimeHelper.getDatePart(fiscalYear.EndDate).valueOf());

    return {
        FYStartDate: DateTimeHelper.getDatePart(fiscalYear.StartDate).toDateString(),
        FYEndDate: DateTimeHelper.getDatePart(fiscalYear.EndDate).toDateString(),
        RefreshSummary: refreshSummary
    };
}
export function formatMyAbsenceDetails(allItems: MyAbsenceDetail[], detail: MyAbsenceDetail) {
    let originalItem = allItems.filter(obj => obj.Id == detail.Id);
    var tempFromHour = new Date(originalItem[0].FromHour);
    detail.FromHour = new Date(tempFromHour.setMinutes(tempFromHour.getMinutes() + (tempFromHour.getTimezoneOffset() * -1)));
    var tempToHour = new Date(originalItem[0].ToHour);
    detail.ToHour = new Date(tempToHour.setMinutes(tempToHour.getMinutes() + (tempToHour.getTimezoneOffset() * -1)));
    return detail;
}
export function extractEmployeeAbsence(response: Response): MyAbsence {
    let body = response.json();
    let objAbs = new MyAbsence();
    Object.assign(objAbs, body);
    if (objAbs.MyAbsenceDetails && objAbs.MyAbsenceDetails.length > 0) {
        //here transform the date to localdate using pipe            
        objAbs.MyAbsenceDetails.forEach(detail => {
            detail = formatMyAbsenceDetails(objAbs.MyAbsenceDetails, detail);
        });
    }

    return objAbs;
}