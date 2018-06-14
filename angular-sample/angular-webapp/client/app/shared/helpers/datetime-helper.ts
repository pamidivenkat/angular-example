import { AeSelectItem } from './../../atlas-elements/common/models/ae-select-item';
import { isNumber, isNullOrUndefined } from 'util';
import { StringHelper } from './string-helper';
import { WeekModel } from './../models/weekmodel';
import * as Immutable from 'immutable';

export class DateTimeHelper {
    static getDatePart(date: Date) {
        if (isNullOrUndefined(date)) {
            return null;
        }

        if (typeof (date) === 'string') {
            let dateStr = <string>date;
            return DateTimeHelper.getDateTimeFromISO(dateStr, false);
        }
        return new Date(date.toDateString());
    }

    static getDatePartfromString(dateStr: string) {
        if (isNullOrUndefined(dateStr)) {
            return null;
        }

        let date = new Date(dateStr);
        return DateTimeHelper.getDatePart(date);
    }

    static getDurationInHours(start, end) {
        let hours: number = 0;
        if (DateTimeHelper.validateHourTime(start) &&
            DateTimeHelper.validateHourTime(end)) {
            start = start.split(':');
            end = end.split(':');
            let startDate = new Date(0, 0, 0, start[0], start[1], 0);
            let endDate = new Date(0, 0, 0, end[0], end[1], 0);
            hours = DateTimeHelper.calculateDuration(startDate, endDate);
        }
        return hours;
    }

    static calculateDuration(startDate: Date, endDate: Date) {
        if (typeof (startDate) === 'string') {
            startDate = new Date(startDate);
        }

        if (typeof (endDate) === 'string') {
            endDate = new Date(endDate);
        }

        let timeDiff = endDate.getTime() - startDate.getTime();
        let hours = Math.floor(timeDiff / 1000 / 60 / 60);
        timeDiff -= hours * 1000 * 60 * 60;
        let minutes = Math.floor(timeDiff / 1000 / 60);
        return Math.abs(hours) + Math.abs(minutes / 60);
    }

    static transformDate(date: string) {
        let result: string = '';
        if (!StringHelper.isNullOrUndefinedOrEmpty(date)) {
            let inputDate: Date = new Date(date);
            result = `${inputDate.getHours()}:${inputDate.getMinutes()}`;
        }
        return result;
    }
    static getTimePartWithoutTransform(date: Date) {
        let result: string = '';
        if (!isNullOrUndefined(date)) {
            let inputDate: Date = new Date(date);
            result = `${inputDate.getHours()}:${inputDate.getMinutes()}`;
        }
        return result;
    }
    static validateHourTime(input: string): boolean {
        if (!StringHelper.isNullOrUndefinedOrEmpty(input)
            && input.indexOf(':') !== -1
            && input.split(':').length === 2
            && isNumber(parseInt(input.split(':')[0], 10))
            && isNumber(parseInt(input.split(':')[1], 10))) {
            return true;
        }
        return false;
    }

    static getDateFromFormattedHours(date: Date, formattedHour: string) {
        if (DateTimeHelper.validateHourTime(formattedHour)) {
            date = DateTimeHelper.getDatePart(date);
            if (!isNullOrUndefined(date)) {
                date.setHours(parseInt(formattedHour.split(':')[0], 10), parseInt(formattedHour.split(':')[1], 10), 0);
            }
            return date;
        }
        return null;
    }

    static getDateTimeStringFromISO(date: string, includeTime: boolean) {
        if (StringHelper.isNullOrUndefinedOrEmpty(date) || date.indexOf('T') === -1) {
            return '';
        }

        let datePart = date.split('T')[0];
        let timePart = date.split('T')[1];

        let formattedStr = datePart.split('-')[2] + '/' + datePart.split('-')[1] + '/' + datePart.split('-')[0];
        if (includeTime) {
            return formattedStr + ' ' + timePart.substring(0, timePart.length - 3);
        }
        return formattedStr;
    }

    static getDateTimeFromISO(date: string, includeTime: boolean) {
        if (StringHelper.isNullOrUndefinedOrEmpty(date) || date.indexOf('T') === -1) {
            return null;
        }

        let datePart = date.split('T')[0].split('-');
        let timePart = date.split('T')[1].split(':');

        if (includeTime) {
            return new Date(parseInt(datePart[0], 10), parseInt(datePart[1], 10) - 1, parseInt(datePart[2], 10)
                , parseInt(timePart[0], 10), parseInt(timePart[1], 10), parseInt(timePart[2], 10));
        }
        return new Date(parseInt(datePart[0], 10), parseInt(datePart[1], 10) - 1, parseInt(datePart[2], 10));
    }

    static formatDate(date: Date, includeHours: boolean) {
        if (isNullOrUndefined(date)) {
            return '';
        }
        let yyyy = date.getFullYear();
        let mm = date.getMonth() < 9 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
        let dd = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        let dateStr = `${dd}/${mm}/${yyyy}`;
        if (includeHours) {
            let hh = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
            let min = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
            dateStr = dateStr + ` ${hh}:${mm}`;
        }
        return dateStr;
    }
    static getWeek(date: Date): WeekModel {
        let objWeekModel = new WeekModel();
        objWeekModel.Date = date;
        let startDate = date.getDay() ? new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 1) : new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() - 6);
        let endDate = date.getDay() ? new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 7) : new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
        objWeekModel.StartDate = startDate;
        objWeekModel.EndDate = endDate;
        return objWeekModel
    }

    static getYears(referenceYear: number, leftYearCount: number, rightYearCount: number): Immutable.List<AeSelectItem<string>> {
        let years: AeSelectItem<string>[] = [];
        for (let i = 1; i < leftYearCount + rightYearCount + 1; i++) {
            let aeSelectItem = new AeSelectItem<string>((referenceYear - leftYearCount + i).toString(), (referenceYear - leftYearCount + i).toString());
            years.push(aeSelectItem);
        }
        return Immutable.List<AeSelectItem<string>>(years);
    }

    static DayOfTheWeek(dt: Date): string {
        let weekday = new Array(7);
        weekday[0] = "SUNDAY";
        weekday[1] = "MONDAY";
        weekday[2] = "TUESDAY";
        weekday[3] = "WEDNESDAY";
        weekday[4] = "THURSDAY";
        weekday[5] = "FRIDAY";
        weekday[6] = "SATURDAY";
        return weekday[dt.getDay()]
    }
    static getDateFormatRequiredBySummaryAPIKey(date: Date): string {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }
}
