import { Injectable } from '@angular/core';
import {
    PublicHoliday
    , NonWorkingdaysModel
} from '../../nonworkingdaysandbankholidays/models/nonworkingdays-model';
import { isNullOrUndefined } from 'util';
import { StringHelper } from '../../../shared/helpers/string-helper';

@Injectable()
export class NonWorkingDaysAndPublicHolidayService {
    private _publicHolidays: Array<PublicHoliday> = [];
    private _nonWorkingdayProfiles: Array<NonWorkingdaysModel>;
    private _profileToExclude: string;

    public getPublicHolidays() {
        return this._publicHolidays;
    }

    public setPublicHolidays(publicHolidays: Array<PublicHoliday>) {
        if (!isNullOrUndefined(publicHolidays)) {
            this._publicHolidays = publicHolidays.slice();
        } else {
            this._publicHolidays = [];
        }
    }

    public getNonWorkingdayProfiles() {
        return this._nonWorkingdayProfiles;
    }

    public setNonWorkingdayProfiles(nonWorkingdayProfiles: Array<NonWorkingdaysModel>) {
        if (!isNullOrUndefined(nonWorkingdayProfiles)) {
            this._nonWorkingdayProfiles = nonWorkingdayProfiles.slice();
        } else {
            this._nonWorkingdayProfiles = [];
        }
    }

    public setProfileToExclude(profileId: string) {
        this._profileToExclude = profileId;
    }

    public checkProfileExists(name: string) {
        if (!StringHelper.isNullOrUndefinedOrEmpty(name) &&
            !isNullOrUndefined(this._nonWorkingdayProfiles)) {
            let filteredResult = [];
            if (!StringHelper.isNullOrUndefinedOrEmpty(this._profileToExclude)) {
                filteredResult = this._nonWorkingdayProfiles
                    .filter((profile) => profile.Id.toLowerCase() !== this._profileToExclude.toLowerCase() &&
                        profile.Name.toLowerCase() === name.toLowerCase());
            } else {
                filteredResult = this._nonWorkingdayProfiles
                    .filter((profile) => profile.Name.toLowerCase() === name.toLowerCase());
            }

            return filteredResult.length > 0;
        }
        return false;
    }

    constructor() {
    }
}
