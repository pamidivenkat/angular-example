import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { Department, Employee, Site } from '../model/calendar-models';
import { isNullOrUndefined } from 'util';
import { CalendarEvent } from '../../atlas-elements/common/models/calendar-models/calendarEvent';
import { Response } from '@angular/http';
import * as Immutable from 'immutable';
import { AbsenceStatusType } from "../../holiday-absence/common/absence-status-type.enum";
import { formatMyAbsenceDetails } from './../../holiday-absence/common/extract-helpers';
const colors: any = {
    // Public Holiday color
    green: {
        primary: '#f9bcca',
        secondary: '#f9bcca'
    },
    //Holiday color
    blue: {
        primary: '#87e3c6',
        secondary: '#87e3c6'
    },
    //Absence color
    yellow: {
        primary: '#ffdb4e',
        secondary: '#ffdb4e'
    },
    //Pending Holiday color
    gray: {
        primary: '#e1dad0',
        secondary: '#e1dad0'
    }
};

export function extractCalendarInformation(response: any): CalendarEvent[] {
    let calendarInformation: CalendarEvent[] = new Array();
    let body = Array.from(response.Entities);
    let ctype: number;
    body.filter((value, i) => {
        ctype = value['CalendarEntityType'];
        return (!isNullOrUndefined(ctype) && (ctype === 2 || ctype === 1))
    }).map((value, i) => {
        ctype = value['CalendarEntityType'];
        let events = value['events'];
        if (!isNullOrUndefined(events) && events.length > 0) {
            switch (ctype) {
                case 2:
                    {
                        Array.from(events).map((val: any) => {

                            var eve = <CalendarEvent>{};
                            eve.start = new Date(val.HolidayDate);
                            eve.allDay = true;  // As it is public holiday marking event allDay = true
                            eve.color = colors.green; // TODO:202
                            eve.id = val.Id;
                            eve.title = val.Name;
                            eve.eventType = val.Name;
                            calendarInformation.push(eve);
                        });
                    }
                case 1:
                    {
                        Array.from(events).map((val: any) => {
                            let PendingStatus = (!isNullOrUndefined(val.Status)) ? val.Status.Code : 0;
                            if (val.AbsenceDetails && val.AbsenceDetails.length > 0) {
                                Array.from(val.AbsenceDetails).map((hourAbsences: any) => {
                                    hourAbsences = formatMyAbsenceDetails(val.AbsenceDetails, hourAbsences);
                                    var eve = <CalendarEvent>{};
                                    eve.start = new Date(hourAbsences.FromHour);
                                    eve.end = new Date(hourAbsences.ToHour);
                                    eve.allDay = false;
                                    eve.color = (val.TypeId === 1) ? ((PendingStatus === AbsenceStatusType.Requested || PendingStatus === AbsenceStatusType.Requestforchange || PendingStatus === AbsenceStatusType.Requestforcancellation || PendingStatus === AbsenceStatusType.Resubmitted || PendingStatus === AbsenceStatusType.Escalated) ? colors.gray : colors.blue) : colors.yellow;
                                    eve.id = val.Id;
                                    eve.eventType = (val.TypeId === 1) ? ((PendingStatus === AbsenceStatusType.Requested || PendingStatus === AbsenceStatusType.Requestforchange || PendingStatus === AbsenceStatusType.Requestforcancellation || PendingStatus === AbsenceStatusType.Resubmitted || PendingStatus === AbsenceStatusType.Escalated) ? 'Pending Holiday' : 'Holiday') : "Absence";
                                    eve.title = val.FullName + " - " + eve.eventType + " from " + eve.start.getHours() + "." + ((eve.start.getMinutes() < 10 ? '0' : '') + eve.start.getMinutes()) + " to " + eve.end.getHours() + "." + ((eve.end.getMinutes() < 10 ? '0' : '') + eve.end.getMinutes()) + " on " + eve.start.getDate() + "-" + (eve.start.getMonth() + 1) + "-" + eve.start.getFullYear() + "";
                                    calendarInformation.push(eve);
                                });
                            }
                            else {
                                if (val && val.TypeId === 1 || val.TypeId === 2) {
                                    var eve = <CalendarEvent>{};
                                    // Get holidaytype
                                    let apPm = (!isNullOrUndefined(val.HalfDayType)) ? ((val.HalfDayType == 1) ? ' AM' : ' PM') : '';
                                    eve.start = new Date(val.StartDate);
                                    eve.end = !isNullOrUndefined(val.EndDate) ? new Date(val.EndDate) : val.EndDate;
                                    eve.allDay = (val.IsHour === true ? false : true);  // As it is public holiday marking event allDay = true
                                    eve.color = (val.TypeId === 1) ? ((PendingStatus === AbsenceStatusType.Requested || PendingStatus === AbsenceStatusType.Requestforchange || PendingStatus === AbsenceStatusType.Requestforcancellation || PendingStatus === AbsenceStatusType.Resubmitted || PendingStatus === AbsenceStatusType.Escalated) ? colors.gray : colors.blue) : colors.yellow;
                                    eve.id = val.Id;
                                    eve.eventType = (val.TypeId === 1) ? ((PendingStatus === AbsenceStatusType.Requested || PendingStatus === AbsenceStatusType.Requestforchange || PendingStatus === AbsenceStatusType.Requestforcancellation || PendingStatus === AbsenceStatusType.Resubmitted || PendingStatus === AbsenceStatusType.Escalated) ? 'Pending Holiday' : 'Holiday') : "Absence";
                                    let daysText: string;
                                    if (val.IsHour) {
                                        daysText = val.NoOfUnits > 1 ? 'Hours' : 'Hour';
                                    } else {
                                        daysText = val.NoOfUnits > 1 ? 'Days' : 'Day';
                                    }

                                    if (isNullOrUndefined(eve.end)) {
                                        eve.title = val.FullName + " ( " + eve.eventType + " from " + eve.start.getDate() + "/" + (eve.start.getMonth() + 1) + "/" + eve.start.getFullYear() + " : ongoing " + " ) ";
                                    } else {
                                        eve.title = val.FullName + " - " + eve.eventType + " from " + eve.start.getDate() + "/" + (eve.start.getMonth() + 1) + "/" + eve.start.getFullYear() + " to " + eve.end.getDate() + "/" + (eve.end.getMonth() + 1) + "/" + eve.end.getFullYear() + " - " + val.NoOfUnits + " " + daysText + apPm + "";
                                    }
                                    calendarInformation.push(eve);
                                }
                            }
                        });
                    }
                default:
            }

        }
    });
    return calendarInformation;
}


export function mapSitesToAeSelect(sites: Site[]): Immutable.List<AeSelectItem<string>> {
    if (isNullOrUndefined(sites)) return Immutable.List<AeSelectItem<string>>([]);
    // map sites to imutable list of AeSelectItem
    let aeSelectSites: Immutable.List<AeSelectItem<string>> = Immutable.List(sites.map(site => {
        let siteoption: AeSelectItem<string> = new AeSelectItem<string>();
        siteoption.Text = !isNullOrUndefined(site['SiteNameAndPostcode']) && site['SiteNameAndPostcode'] != '' ? site['SiteNameAndPostcode'] : site['Name'];
        siteoption.Disabled = false;
        siteoption.Value = site['Id'];
        return siteoption;
    }));
    return aeSelectSites;
}

export function mapDepartmentsToAeSelect(depts: Department[]): Immutable.List<AeSelectItem<string>> {
    if (isNullOrUndefined(depts)) return Immutable.List<AeSelectItem<string>>([]);
    // map sites to imutable list of AeSelectItem
    let aeSelectDepts: Immutable.List<AeSelectItem<string>> = Immutable.List(depts.map(dept => {
        let deptOption: AeSelectItem<string> = new AeSelectItem<string>();
        deptOption.Text = dept['Name'];
        deptOption.Disabled = false;
        deptOption.Value = dept['Id'];
        return deptOption;
    }));
    return aeSelectDepts;
}

export function mapEmployeesToAeSelect(emps: Employee[]): Immutable.List<AeSelectItem<string>> {
    if (isNullOrUndefined(emps)) return Immutable.List<AeSelectItem<string>>([]);
    // map sites to imutable list of AeSelectItem
    let aeSelectEmps: Immutable.List<AeSelectItem<string>> = Immutable.List(emps.filter(e => e.IsLeaver === false).map(emp => {
        let empOption: AeSelectItem<string> = new AeSelectItem<string>();
        empOption.Text = `${emp['FirstName']} ${emp['Surname']}`;
        empOption.Disabled = false;
        empOption.Value = emp['Id'];
        return empOption;
    }));
    return aeSelectEmps;
}