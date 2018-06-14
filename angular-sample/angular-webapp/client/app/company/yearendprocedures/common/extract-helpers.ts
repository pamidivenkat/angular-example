import { isNullOrUndefined } from 'util';
import { Response } from '@angular/http';
import {
    YearEndProcedureModel
    , FiscalYearModel
    , YearEndProcedureStatus
    , YearEndProcedureResultModel
} from './../models/yearendprocedure-model';
import { ObjectHelper } from './../../../shared/helpers/object-helper';
import { EnumHelper } from './../../../shared/helpers/enum-helper';
import { HolidayUnitType } from './../../../shared/models/company.models';
import { AtlasParams } from './../../../shared/models/atlas-api-response';
import { StringHelper } from './../../../shared/helpers/string-helper';

export function extractYearEndProcedureData(response: Response): YearEndProcedureModel {
    let yepData: YearEndProcedureModel = new YearEndProcedureModel();
    if (!isNullOrUndefined(response)) {
        let body = response.json();
        yepData = ObjectHelper.extract(body, yepData);
        yepData.FiscalYearData = new FiscalYearModel();
        yepData.FiscalYearData = ObjectHelper.extract(body.FiscalYear, yepData.FiscalYearData);
        yepData.FiscalYearData.StartDate = new Date(yepData.FiscalYearData.StartDate);
        yepData.FiscalYearData.EndDate = new Date(yepData.FiscalYearData.EndDate);
    }
    return yepData;
}

export function getYEPStatusList(): Map<number, string> {
    let yepStatusMap: Map<number, string> = new Map<number, string>();
    let statusValues: number[] = EnumHelper.getValues(YearEndProcedureStatus);
    let statusName: string;
    statusValues.forEach(status => {
        statusName = '';
        switch (status) {
            case -2:
                statusName = 'Not reached year end';
                break;
            case -1:
                statusName = 'Error while running year end procedure';
                break;
            case 0:
                statusName = 'Not started';
                break;
            case 1:
                statusName = 'In progress';
                break;
            case 2:
                statusName = 'Awaiting review';
                break;
            case 3:
                statusName = 'Review confirmed';
                break;
            case 4:
                statusName = 'Error while applying confirmed changes';
                break;
            case 5:
                statusName = 'Completed';
                break;
        }
        yepStatusMap.set(status, statusName);
    });
    return yepStatusMap;
}

function _getLengthOfService(startdate) {
    if (startdate) {
        let dob = new Date(startdate);
        let currentDate = new Date();
        let years = (currentDate.getMonth() < dob.getMonth()) ?
            currentDate.getFullYear() - dob.getFullYear() - 1 :
            currentDate.getFullYear() - dob.getFullYear();
        let months = (currentDate.getMonth() < dob.getMonth()) ?
            12 - (dob.getMonth() - currentDate.getMonth()) :
            currentDate.getMonth() - dob.getMonth();
        if (years > 0) {
            return months > 0 ? years + 'Y and ' + months + ' M' : years + ' Y';
        } else {
            return months + ' M';
        }
    }
    return '';
}

export function extractYearEndProcedureResultList(response: Response) {
    let yepResults: Array<YearEndProcedureResultModel> = new Array<YearEndProcedureResultModel>();
    if (!isNullOrUndefined(response)) {
        let body = response.json();
        yepResults = Array.from(body.Entities).map((m) => {
            let model = extractYearEndProcedureResult(m);
            model.FullName = m['FirstName'] + ' ' + m['Surname'];
            model.LengthOfService = _getLengthOfService(model.StartDate);
            model.LastYearHolidayEntitlement
                = `${model.HolidayEntitlement} ${HolidayUnitType[model.ReviewedHolidayUnitType].toLowerCase()}`;
            model.HolidaysTaken
                = `${model.UtilizedHolidayUnits} ${HolidayUnitType[model.UtilizedHolidayUnitType].toLowerCase()}`;
            model.AvailableToCarryForwardUnitType = HolidayUnitType[model.CarryForwardedUnitType].toLowerCase();
            model.ThisYearHolidayEntitlementUnitType = HolidayUnitType[model.ReviewedHolidayUnitType].toLowerCase();
            model.ThisYearTotalHolidays
                = `${(model.ReviewedHolidayEntitlement + model.ReviewedCarryForwardedUnits)} ${HolidayUnitType[model.ReviewedHolidayUnitType].toLowerCase()}`;
            return model;
        });
    }
    return yepResults;
}

export function extractYearEndProcedureResult(inputData: any) {
    let model: YearEndProcedureResultModel = new YearEndProcedureResultModel();
    if (!isNullOrUndefined(inputData)) {
        model = ObjectHelper.extract(inputData, model);
    }
    return model;
}

export function extractEmployeesFromYEPResults(response: Response) {
    let employeeList: Array<string> = [];
    if (!isNullOrUndefined(response)) {
        let body = response.json();
        employeeList = Array.from(body.Entities).map(c => {
            return `${c['FirstName']} ${c['Surname']}`;
        });
    }
    return employeeList;
}

export function getRequestParamsList(params: Map<string, string>): Array<AtlasParams> {
    let result: Array<AtlasParams> = [];
    if (isNullOrUndefined(params)) {
      return result;
    }
    params.forEach((value, key) => {
      if (!StringHelper.isNullOrUndefinedOrEmpty(key) &&
        result.findIndex(c => c.Key.toLowerCase() === key.toLowerCase()) === -1) {
        let param = new AtlasParams(key, value);
        result.push(param);
      }
    });
    return result;
  }