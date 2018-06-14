import { isNumber, isNullOrUndefined } from 'util';
import { Injectable } from '@angular/core';
import { StringHelper } from '../../shared/helpers/string-helper';
import { RestClientService } from '../../shared/data/rest-client.service';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../shared/reducers/index';
import { Observable } from 'rxjs/Observable';
import { FiscalYear } from '../../shared/models/company.models';

type TimePart = { Hours: number, Minutes: number };

@Injectable()
export class HolidayAbsenceValidationService {
    getDurationInHours(start, end) {
        if (this._validateHourTime(start) && this._validateHourTime(end)) {
            start = start.split(':');
            end = end.split(':');
            let startDate = new Date(0, 0, 0, start[0], start[1], 0);
            let endDate = new Date(0, 0, 0, end[0], end[1], 0);
            let timeDiff = endDate.getTime() - startDate.getTime();
            let hours = Math.floor(timeDiff / 1000 / 60 / 60);
            timeDiff -= hours * 1000 * 60 * 60;
            let minutes = Math.floor(timeDiff / 1000 / 60);
            return Math.abs(hours) + Math.abs(minutes / 60);
        }
        return null;
    }

    getHolidaySummary(startDate: Date, endDate: Date) {
        startDate = this._getDatePart(startDate);
        endDate = this._getDatePart(endDate);
        let selectedFYear: FiscalYear;
        this._store.let(fromRoot.getFiscalYearsData).subscribe((fiscalYears) => {
            if (!isNullOrUndefined(fiscalYears)) {
                fiscalYears.forEach((item) => {
                    let fyStartDate = this._getDatePart(item.StartDate);
                    let fyEndDate = this._getDatePart(item.EndDate);

                    if ((startDate >= fyStartDate && startDate <= fyEndDate) &&
                        (endDate >= fyStartDate && endDate <= fyEndDate)) {
                        selectedFYear = item;
                    }
                });
            }
        });
    }

    private _formatTimeUnit(hourOrMinute: number): string {
        let value = '';
        if (hourOrMinute < 10) {
            value = `0${hourOrMinute}`;
        } else {
            value = hourOrMinute.toString();
        }
        return value;
    }

    private _validateHourTime(input: string): boolean {
        if (!StringHelper.isNullOrUndefinedOrEmpty(input)
            && input.indexOf(':') !== -1
            && input.split(':').length === 2
            && isNumber(parseInt(input.split(':')[0], 10))
            && isNumber(parseInt(input.split(':')[1], 10))) {
            return true;
        }
        return false;
    }

    private _getDatePart(date: Date) {
        return new Date(date.toDateString());
    }

    constructor(private _data: RestClientService, private _store: Store<fromRoot.State>) {

    }
}
