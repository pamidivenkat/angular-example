import { isNullOrUndefined } from 'util';
import { AeSelectItem } from './../../../atlas-elements/common/models/ae-select-item';
import { FormGroup } from '@angular/forms';
import { DateTimeHelper } from './../../../shared/helpers/datetime-helper';
import { AeListItem } from './../../../atlas-elements/common/models/ae-list-item';
import { NonWorkingdaysModel, HWPAssignToModel, HWPAssignedTo, HolidayWorkingProfileMap, ExcludedEmployees, ExistingProfile } from './../models/nonworkingdays-model';
import * as Immutable from 'immutable';

export function processNonWorkingDaysList(data: NonWorkingdaysModel[], companyNonWorkingDayId: string): NonWorkingdaysModel[] {
    if (data) {
        data.forEach(obj => {
            if (obj.Country)
                obj.CountryName = obj.Country.Name;

            obj.CompanyNonWorkingDaysId = companyNonWorkingDayId;
        });
    }
    return data;
}

export function getAssignedToItems(nonWorkingdayProfile: NonWorkingdaysModel): Immutable.List<AeListItem> {
    let finalList = Immutable.List<AeListItem>();
    if (nonWorkingdayProfile.HWPAssignedTo && nonWorkingdayProfile.HWPAssignedTo.length > 0) {
        switch (nonWorkingdayProfile.HWPAssignedTo[0].AssignTo.toLowerCase()) {
            case "department":
                nonWorkingdayProfile.HolidayWorkingProfileMapList.forEach(keyValuePair => {
                    if (keyValuePair.Department) {
                        let aeListItem = new AeListItem();
                        aeListItem.Text = keyValuePair.Department.Name;
                        finalList = finalList.push(aeListItem);
                    }
                });
            case "site":
                nonWorkingdayProfile.HolidayWorkingProfileMapList.forEach(keyValuePair => {
                    if (keyValuePair.Site) {
                        let aeListItem = new AeListItem();
                        aeListItem.Text = keyValuePair.Site.Name;
                        finalList = finalList.push(aeListItem);
                    }
                });
            case "employee":
                nonWorkingdayProfile.HolidayWorkingProfileMapList.forEach(keyValuePair => {
                    if (keyValuePair.Employee) {
                        let aeListItem = new AeListItem();
                        aeListItem.Text = keyValuePair.Employee.FirstName + ' ' + keyValuePair.Employee.Surname;
                        finalList = finalList.push(aeListItem);
                    }
                });
            default:
                break;
        }
        return finalList;
    }
    else {
        finalList = Immutable.List<AeListItem>();
        return finalList;
    }
}

export function getAssignedToMetaString(metaCode: string): string {
    if (metaCode) {
        switch (metaCode.toLowerCase()) {
            case '1':
                return 'Company';
            case '4':
                return 'Department';
            case '3':
                return 'Site';
            case '17':
                return 'Employee';
            default:
                return '';
        }
    }
    return '';
}

export function getAssignedToMeta(assignTo: string): string {
    if (assignTo) {
        switch (assignTo.toLowerCase()) {
            case 'company':
                return '1';
            case 'department':
                return '4';
            case 'site':
                return '3';
            case 'employee':
                return '17';
            default:
                return '0';
        }
    }
    return '0';
}
export function getNonWorkingDayEntity(response: any): NonWorkingdaysModel {
    let responseObj = new NonWorkingdaysModel();
    Object.assign(responseObj, response);
    if (!isNullOrUndefined(responseObj.Country)) {
        responseObj.CountryName = responseObj.Country.Name;
    } else {
        responseObj.CountryName = '';
    }
    // change all bankhoiday dates to date data types
    if (responseObj.PublicHolidayList) {
        responseObj.PublicHolidayList.forEach(
            obj => {
                obj.HolidayDate = obj.HolidayDate;
                obj.Year = (new Date(obj.HolidayDate)).getFullYear();
                let dayName = DateTimeHelper.DayOfTheWeek((new Date(obj.HolidayDate)));
                obj.DayOfTheWeek = dayName.charAt(0).toUpperCase() + dayName.slice(1).toLowerCase();
            }
        )
    }
    if (responseObj.HWPAssignedTo) {
        responseObj.HWPAssignedTo.forEach(
            obj => {
                obj.AssignedToMeta = getAssignedToMeta(obj.AssignTo);
            }
        )
    }
    return responseObj;
}

export function mapFromNonWorkingDaysFullEntity(fullEntity: NonWorkingdaysModel): HWPAssignToModel {
    let model = new HWPAssignToModel();
    model = Object.assign(model, fullEntity);
    model.AssignedTo = fullEntity.HWPAssignedTo ? fullEntity.HWPAssignedTo[0] : new HWPAssignedTo();
    model.ExcludedEmployees = fullEntity.ExcludedEmployees;
    model.HolidayWorkingProfileMapList = fullEntity.HolidayWorkingProfileMapList;
    return model;
}

export function getValuesToBind(assignModel: HWPAssignToModel, metaCode: string): AeSelectItem<string>[] {
    let valuesToBind: AeSelectItem<string>[] = [];
    if (assignModel.HolidayWorkingProfileMapList) {
        if (metaCode != '-1') {
            assignModel.HolidayWorkingProfileMapList.forEach(profileMap => {
                if (profileMap) {
                    switch (metaCode) {
                        case '4':
                            if (profileMap.Department && profileMap.DepartmentId && profileMap.Department.Name)
                                valuesToBind.push(new AeSelectItem(profileMap.Department.Name, profileMap.DepartmentId));
                            break;
                        case '3':
                            if (profileMap.Site && profileMap.SiteId && profileMap.Site.Name)
                                valuesToBind.push(new AeSelectItem(profileMap.Site.Name, profileMap.SiteId));
                            break;
                        case '17':
                            if (profileMap.Employee && profileMap.EmployeeId && profileMap.Employee.FirstName)
                                valuesToBind.push(new AeSelectItem(profileMap.Employee.FirstName + ' ' + profileMap.Employee.Surname, profileMap.EmployeeId));
                            break;
                    }
                }
            });
        }
        else if (metaCode == '-1') {
            //here need to return the excluded employees
            if (assignModel.ExcludedEmployees) {
                assignModel.ExcludedEmployees.forEach(exclEmp => {
                    if (exclEmp.Employee && exclEmp.EmployeeId)
                        valuesToBind.push(new AeSelectItem(exclEmp.Employee.FirstName + ' ' + exclEmp.Employee.Surname, exclEmp.Employee.Id));
                });
            }
        }
        else {

        }
    }
    return valuesToBind;
}
export function getExistingProfiles(mapModel: HolidayWorkingProfileMap[], metaCode: string): ExistingProfile[] {
    let existingModels: ExistingProfile[] = [];
    if (mapModel) {
        switch (metaCode) {
            case '1':
                break;
            case '4':
                mapModel.forEach(obj => {
                    if (obj) {
                        let model = new ExistingProfile();
                        model.Id = obj.DepartmentId;
                        existingModels.push(model);
                    }
                });
                break;
            case '3':
                mapModel.forEach(obj => {
                    if (obj) {
                        let model = new ExistingProfile();
                        model.Id = obj.SiteId;
                        existingModels.push(model);
                    }
                });
                break;
            case '17':
                mapModel.forEach(obj => {
                    if (obj) {
                        let model = new ExistingProfile();
                        model.Id = obj.EmployeeId;
                        existingModels.push(model);
                    }
                });
                break;
        }
    }
    return existingModels;
}
export function mapFromAssignmentModelToHolidayWorkingModel(assignModel: HWPAssignToModel): NonWorkingdaysModel {
    let nonWorkingDayModel: NonWorkingdaysModel = new NonWorkingdaysModel();
    Object.assign(nonWorkingDayModel, assignModel);
    //nonWorkingDayModel.HWPAssignedTo = [];
    //nonWorkingDayModel.HWPAssignedTo.push(assignModel.AssignedTo);
    nonWorkingDayModel.ExcludedEmployees = assignModel.ExcludedEmployees;
    nonWorkingDayModel.HolidayWorkingProfileMapList = assignModel.HolidayWorkingProfileMapList;
    nonWorkingDayModel.ExistingProfiles = getExistingProfiles(nonWorkingDayModel.HolidayWorkingProfileMapList, assignModel.AssignedTo.AssignedToMeta);
    delete nonWorkingDayModel['AssignedTo']; // removing this key since it causing the circula dependancy
    delete nonWorkingDayModel['HWPAssignedTo'];
    return nonWorkingDayModel;
}

export function generatePublicHolidayYears(): Immutable.List<AeSelectItem<number>> {
    let currentYear = (new Date()).getFullYear();
    let lastTenyears =
        Array.from(new Array(15), (x, i) => i)
            .map((element, index: number) => {
                let year = currentYear + index;
                return new AeSelectItem<number>(year.toString(), year, false);
            });
    return Immutable.List(lastTenyears);
}

export function getFlatValues(values: Array<string>): string {
    let finalValue: string = '';
    if (values) {
        values.forEach(value => {
            if (value) {
                finalValue = value.hasOwnProperty('Value') ?  finalValue + (<any>value).Value + "," : finalValue + value + ",";
            }
        });
    }
    if (finalValue) {
        finalValue = finalValue.substring(0, finalValue.length - 1);
    }
    return finalValue;
}


export function mapFormToNonWorkingDayAssignModel(nonWorkingModel: NonWorkingdaysModel, assignModel: HWPAssignToModel, assignFormGroup: FormGroup): HWPAssignToModel {
    let isDefault = assignFormGroup.controls['IsDefault'].value;
    let assignedTo = <string>assignFormGroup.controls['assignedTo'].value;
    let selctedDepts = (assignFormGroup.controls['department'] ? assignFormGroup.controls['department'].value : []);
    let selctedSites = (assignFormGroup.controls['site'] ? assignFormGroup.controls['site'].value : []);
    let selctedEmployees = (assignFormGroup.controls['employee'] ? assignFormGroup.controls['employee'].value : []);
    let exclemployees = (assignFormGroup.controls['excludedEmployee'].value);

    if (isNullOrUndefined(assignModel.AssignedTo)) {
        assignModel.AssignedTo = new HWPAssignedTo();
    }

    //assignModel.AssignedTo.AssignedToMeta = assignedTo;
    assignModel.AssignedTo.IsDefault = false;// by default set as false;
    if (assignedTo == '1')
        assignModel.AssignedTo.IsDefault = isDefault;

    assignModel.AssignedTo.AssignTo = getAssignedToMetaString(assignedTo);
    assignModel.AssignedTo.HolidayWorkingProfileId = nonWorkingModel.Id;
    let existinHolidayWorkignProfile: NonWorkingdaysModel = new NonWorkingdaysModel();
    //assigning only requried properties since its creating circutal reference errors.
    assignModel.AssignedTo.HolidayWorkingProfile = existinHolidayWorkignProfile;
    assignModel.AssignedTo.HolidayWorkingProfile.Country = nonWorkingModel.Country;
    assignModel.AssignedTo.HolidayWorkingProfile.Id = nonWorkingModel.Id;
    assignModel.AssignedTo.HolidayWorkingProfile.IsExample = nonWorkingModel.IsExample;
    assignModel.AssignedTo.HolidayWorkingProfile.CompanyId = nonWorkingModel.CompanyId;
    // assignModel.AssignedTo.HolidayWorkingProfile =  nonWorkingModel;
    var existingProfileslist = nonWorkingModel.HolidayWorkingProfileMapList.slice(0);

    assignModel.HolidayWorkingProfileMapList = [];
    switch (assignedTo) {
        case '4':
            if (selctedDepts) {
                selctedDepts.forEach(deptSelectItem => {
                    if (deptSelectItem) {
                        let newItem: HolidayWorkingProfileMap = new HolidayWorkingProfileMap();
                        newItem.HolidayWorkingProfileId = nonWorkingModel.Id;
                        let selectitem: AeSelectItem<string> = deptSelectItem;
                        newItem.DepartmentId = selectitem && selectitem.Value ? selectitem.Value : deptSelectItem;
                        assignModel.HolidayWorkingProfileMapList.push(newItem);
                    }
                });
            }
            break;
        case '3':
            if (selctedSites) {
                selctedSites.forEach(siteSelectItem => {
                    if (siteSelectItem) {
                        let newItem: HolidayWorkingProfileMap = new HolidayWorkingProfileMap();
                        newItem.HolidayWorkingProfileId = nonWorkingModel.Id;
                        let selectitem: AeSelectItem<string> = siteSelectItem;
                        newItem.SiteId = selectitem && selectitem.Value ? selectitem.Value : siteSelectItem;
                        assignModel.HolidayWorkingProfileMapList.push(newItem);
                    }
                });
            }
            break;
        case '17':
            if (selctedEmployees) {
                selctedEmployees.forEach(empSelectItem => {
                    if (empSelectItem) {
                        let newItem: HolidayWorkingProfileMap = new HolidayWorkingProfileMap();
                        newItem.HolidayWorkingProfileId = nonWorkingModel.Id;
                        let selectitem: AeSelectItem<string> = empSelectItem;
                        newItem.EmployeeId = selectitem && selectitem.Value ? selectitem.Value : empSelectItem;
                        assignModel.HolidayWorkingProfileMapList.push(newItem);
                    }
                });
            }
        case '1':
            // if company selected
            let newItem: HolidayWorkingProfileMap = new HolidayWorkingProfileMap();
            newItem.HolidayWorkingProfileId = nonWorkingModel.Id;
            assignModel.HolidayWorkingProfileMapList.push(newItem);
            break;
        default:
            break;
    }
    //Now we need to update the list based on the existing profiles data as per 1/x logic
    existingProfileslist.forEach(existingProfile => {
        existingProfile.IsDeleted = true;
        assignModel.HolidayWorkingProfileMapList.push(existingProfile);
    });

    //exclude employees only in site, department cases..
    assignModel.ExcludedEmployees = [];
    if (assignedTo == '3' || assignedTo == '4') {
        exclemployees.forEach(exclEmp => {
            if (exclEmp) {
                let exEmp: ExcludedEmployees = new ExcludedEmployees();
                exEmp.HolidayWorkingProfileId = nonWorkingModel.Id;
                let selectitem: AeSelectItem<string> = exclEmp;
                exEmp.EmployeeId = selectitem && selectitem.Value ? selectitem.Value : exclEmp;
                assignModel.ExcludedEmployees.push(exEmp);
            }
        });
    }
    return assignModel;
}
