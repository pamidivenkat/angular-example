import { AeSortModel } from '../../atlas-elements/common/models/ae-sort-model';
import { AbsenceType } from './../models/company.models';
import { EnumHelper } from './enum-helper';
import { Employee } from '../../employee/models/employee.model';
import { DropDownItem } from '../../employee/models/dropdown-item';
import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { FiscalYear } from '../models/company.models';
import { isNullOrUndefined } from 'util';
import {
    AbsenceStatus
    , AbsenceStatusCode
    , IncidentCategory
    , UserList
    , UserProfile
    , MainActivity
    , SubActivity
    , GeoLocation,
    LocalAuthority
} from '../models/lookup.models';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { IConHelper } from './icon-helper';
import { AeInformationBarItem } from './../../atlas-elements/common/models/ae-informationbar-item';
import { AeInformationBarItemType } from '../../atlas-elements/common/ae-informationbar-itemtype.enum'
import { Response } from '@angular/http';
import { TrainingCourse } from '../../shared/models/training-course.models';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { DataTableOptions } from '../../atlas-elements/common/models/ae-datatable-options';
import * as Immutable from 'immutable';
import { DisciplinaryOutcome, EventType, Outcome, EmployeeLeavingReason, EmployeeLeavingSubReason } from '../../employee/models/timeline';
import { Site } from './../../shared/models/site.model';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { StringHelper } from '../../shared/helpers/string-helper';
import { RiskAssessmentType } from '../../risk-assessment/models/risk-assessment-type';
import { ProcedureGroup } from '../../shared/models/proceduregroup';
import { User } from "../../email-shared/models/email.model";
import { HWPShortModel } from '../../company/nonworkingdaysandbankholidays/models/nonworkingdays-model';

export function extractInformationBarItems(response: Response): AeInformationBarItem[] {

    let informationBarItems: AeInformationBarItem[] = [];
    let infoItem: AeInformationBarItem;
    let resp = response.json();
    if (!isNullOrUndefined(resp)) {
        let body = Array.from(resp);
        body.map((value, i) => {
            if (value['Code'] != 0) {
                infoItem = new AeInformationBarItem(value['Code'], value['Count'], value['Name'], false, IConHelper.GetByInformationBarItemTooltip(value['Code'], value['Count']), value['IconName']);
                infoItem.Priority = <number>value['Priority'];
                informationBarItems.push(infoItem);
            }
        });
    }
    return informationBarItems.sort((first, second): number => {
        if (first.Priority < second.Priority) return -1;
        if (first.Priority > second.Priority) return 1; return 0;
    });
}

export function extractRiskAssessmentInformationBarItems(response: Response): AeInformationBarItem[] {
    let informationBarItems: AeInformationBarItem[] = [];
    let body = Array.from(response.json());
    let infoItem: AeInformationBarItem;
    body.map((value, i) => {
        let statCode: number = <number>value['Code'];
        switch (statCode) {
            case AeInformationBarItemType.OutstandingAssessmentsActions: {
                infoItem = new AeInformationBarItem(value['Code'], value['Count'], value['Name'], false, ' ', value['IconName'], '', false);
            }
                break;
            default:
                infoItem = new AeInformationBarItem(value['Code'], value['Count'], value['Name'], false, IConHelper.GetByInformationBarItemTooltip(value['Code'], value['Count']), value['IconName']);
                break;
        }
        infoItem.Priority = <number>value['Priority'];
        informationBarItems.push(infoItem);
    });
    return informationBarItems.sort((first, second): number => {
        if (first.Priority < second.Priority) return -1;
        if (first.Priority > second.Priority) return 1; return 0;
    });
}

/* Training Course - start */
export function extractTrainingCourseList(trainingCourseResponse: AtlasApiResponse<TrainingCourse>): Array<TrainingCourse> {
    let trainingCourseList: Array<TrainingCourse> = trainingCourseResponse.Entities.map(x => {
        return x;
    });
    return trainingCourseList;
}
export function extractTrainingCourseDetails(response: Response): TrainingCourse {
    let trainingCourseDetails: TrainingCourse;
    let body = response.json();
    trainingCourseDetails = <TrainingCourse>body;
    return trainingCourseDetails;
}
/* Training Course - end */

export function extractAbsenceStatus(absenceStatus: AbsenceStatus[]): Immutable.List<AeSelectItem<string>> {
    return Immutable.List(absenceStatus.filter(keyValuePair => keyValuePair.Code !== AbsenceStatusCode.Resubmitted &&
        keyValuePair.Code !== AbsenceStatusCode.Requestforchange && keyValuePair.Code !== AbsenceStatusCode.Requestforcancellation).map((keyValuePair) => {
            let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id);
            aeSelectItem.Childrens = null;
            if (keyValuePair.Code === AbsenceStatusCode.Requested) {
                aeSelectItem.Text = 'Pending';
            }
            else
                aeSelectItem.Text = keyValuePair.Name;
            aeSelectItem.Value = keyValuePair.Id;
            return aeSelectItem;
        }));
};

export function mapFiscalYearsToAeSelectItems(fiscalYearSource: Array<FiscalYear>): Immutable.List<AeSelectItem<string>> {
    let fiscalYears: Immutable.List<AeSelectItem<string>> = Immutable.List([]);
    if (!isNullOrUndefined(fiscalYearSource)) {
        fiscalYears = Immutable.List(fiscalYearSource).map((year) => {
            let item: AeSelectItem<string> = new AeSelectItem<string>();
            item.Text = year.DisplayName;
            item.Value = year.StartDate + 'dt' + year.EndDate;
            item.Disabled = false;
            item.Childrens = null;
            return item;
        }).toList();
    }
    return fiscalYears;
}

export function extractEventTypeItems(jsonArraye): EventType[] {
    return jsonArraye.map((eventTypeItem) => {
        if (!isNullOrUndefined(eventTypeItem)) {
            let eventType = new EventType();
            eventType.Code = eventTypeItem.Code;
            eventType.DataTemplate = eventTypeItem.DataTemplate;
            eventType.HasTaskCreation = eventTypeItem.HasTaskCreation;
            eventType.Id = eventTypeItem.Id;
            eventType.OrderNo = eventTypeItem.OrderNo;
            eventType.Title = eventTypeItem.Title;
            eventType.UITemplate = eventTypeItem.UITemplate;

            return eventType
        }
    });
}

export function extractDisciplinaryOutcomeItems(jsonArrayd): DisciplinaryOutcome[] {
    return jsonArrayd.Entities.map((disciplinaryOutcomeItem) => {
        if (!isNullOrUndefined(disciplinaryOutcomeItem)) {
            let disciplinaryOutcome = new DisciplinaryOutcome();
            disciplinaryOutcome.Code = disciplinaryOutcomeItem.Code;
            disciplinaryOutcome.Id = disciplinaryOutcomeItem.Id;
            disciplinaryOutcome.OrderNo = disciplinaryOutcomeItem.OrderNo;
            disciplinaryOutcome.Title = disciplinaryOutcomeItem.Title;

            return disciplinaryOutcome;
        }
    });
}

export function extractOutcomeItems(jsonArrayd): Outcome[] {
    return jsonArrayd.Entities.map((outcomeItem) => {
        if (!isNullOrUndefined(outcomeItem)) {
            let outcome = new Outcome();
            outcome.Id = outcomeItem.Id;
            outcome.OrderNo = outcomeItem.OrderNo;
            outcome.Title = outcomeItem.Title;

            return outcome;
        }
    });
}

export function extractIncidentCategories(response: Response): Array<IncidentCategory> {
    let incidentCategories: Array<IncidentCategory> = [];
    if (!isNullOrUndefined(response)) {
        incidentCategories = Array.from(response.json().Entities).map((cat) => {
            let incidentCategory = new IncidentCategory();
            return ObjectHelper.extract(cat, incidentCategory);
        });
    }
    return incidentCategories;
}

export function mapSiteLookupTableToAeSelectItems(dataSource: Site[]): Immutable.List<AeSelectItem<string>> {
    let aeSelectList = Immutable.List(dataSource.map((item) => {
        let text = item.SiteNameAndPostcode;
        if (StringHelper.isNullOrUndefinedOrEmpty(text)) {
            text = item.Name;
        }
        let ee = new AeSelectItem<string>(text, item.Id, false);
        return ee;
    }));
    return aeSelectList;
}

export function mapEmploymentTypeLookupTableToAeSelectItems(dataSource: AeSelectItem<string>[]): Immutable.List<AeSelectItem<string>> {
    let aeSelectList = Immutable.List(dataSource.map((item) => {
        let ee = new AeSelectItem<string>(item.Text, item.Value, false);
        return ee;
    }));
    return aeSelectList;
}

export function mapIncidentCategoriesToAeSelectItems(dataSource: IncidentCategory[]): Immutable.List<AeSelectItem<string>> {
    if (!isNullOrUndefined(dataSource) && dataSource.length > 0) {
        let aeSelectList: Array<AeSelectItem<string>> = [];
        aeSelectList = dataSource.map((item) => {
            let ee = new AeSelectItem<string>(item.Name, item.Id, false);
            return ee;
        }).sort((a, b) => a.Text.localeCompare(b.Text));
        return Immutable.List(aeSelectList);
    }
    return null;
}

export function concatenateSelectItemValues(types: string[]): string {
    let selectedValues: string;
    if (!isNullOrUndefined(types) && types.length > 0) {
        selectedValues = types.join(',');
    }
    return selectedValues;
}

export function extractReportCategories(response: Response): Immutable.List<AeSelectItem<string>> {
    let reportCategories = Array.from(response.json().Entities) as DropDownItem[];
    let reportCategoriesItems = reportCategories.map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id, false);
        aeSelectItem.Childrens = null;
        return aeSelectItem;
    })
    reportCategoriesItems.push(new AeSelectItem<string>('Other', null, false));
    return Immutable.List(reportCategoriesItems);
}
export function extractDataTableOptions(pagingInfo: PagingInfo, sortInfo?: AeSortModel) {
    if (isNullOrUndefined(pagingInfo)) return new DataTableOptions(1, 10);
    if (isNullOrUndefined(sortInfo)) return new DataTableOptions(pagingInfo.PageNumber, pagingInfo.Count);
    return new DataTableOptions(pagingInfo.PageNumber, pagingInfo.Count, sortInfo.SortField, sortInfo.Direction);
}

export function extractDataTotalCount(pagingInfo: PagingInfo) {
    if (isNullOrUndefined(pagingInfo)) return 10;
    return pagingInfo.TotalCount;
}


export function extractLeavingReasonItems(jsonArrayd): EmployeeLeavingReason[] {
    return jsonArrayd.Entities.map((outcomeItem) => {
        if (!isNullOrUndefined(outcomeItem)) {
            let reason = new EmployeeLeavingReason();
            reason.Id = outcomeItem.Id;
            reason.OrderNo = outcomeItem.OrderNo;
            reason.Title = outcomeItem.Title;
            return reason;
        }
    });
}

export function extractSubReasonItems(jsonArrayd): EmployeeLeavingSubReason[] {
    return jsonArrayd.Entities.map((item) => {
        if (!isNullOrUndefined(item)) {
            let subReason = new EmployeeLeavingSubReason();
            subReason.Id = item.Id;
            subReason.OrderNo = item.OrderNo;
            subReason.Title = item.Title;
            subReason.LeavingReasonId = item.LeavingReasonId;
            return subReason;
        }
    });
}


export function extractUserProfiles(response: Response): UserProfile[] {
    let body = response.json();
    let profiles = <Array<UserProfile>>body.Entities;
    return profiles;
}

export function extractUserProfilesOptions(response: Response): Immutable.List<AeSelectItem<string>> {
    let body = response.json();
    let profiles = <Array<UserProfile>>body.Entities;
    let grpFrSO = 'Group Franchise Service Owner';
    let grpSO = 'Group Service Owner';
    profiles = profiles.filter(profile =>
        ((profile.Name !== grpFrSO) || (profile.Name !== grpSO))
    );
    let profileOptions = profiles.map((item) => {
        let aeSelectItem = new AeSelectItem<string>(item.Name, item.Id, false);
        aeSelectItem.Childrens = null;
        return aeSelectItem;
    });

    return Immutable.List(profileOptions);
}

export function extractUserSelectOptionListData(response: Response): AeSelectItem<string>[] {
    let salaryJobTitle = Array.from(response.json().Entities) as UserList[];
    return salaryJobTitle.map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.FirstName + ' ' + keyValuePair.LastName, keyValuePair.Id, false);
        aeSelectItem.Childrens = null;
        return aeSelectItem;
    });
}

export function getAeSelectItemsFromEnum<T extends number>(e: any) {
    return Immutable.List(EnumHelper.getNamesAndValues(e).map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<number>(keyValuePair.name, keyValuePair.value, false);
        aeSelectItem.Childrens = null;
        return aeSelectItem;
    }))
}

export function addOtherOptions(sites) {
    let siteOptions = [{ Name: 'All sites', Id: '00000000-0000-0000-0000-000000000000' }]
    sites.map(<Site>(site) => {
        siteOptions.push({ Name: site.Name, Id: site.Id })
    })
    siteOptions.push({ Name: 'Select New Affected Site Location', Id: 'Other' });

    return siteOptions;
}

export function mapToAeSelectItems(response: Response, includeOtherOption: boolean = false): Immutable.List<AeSelectItem<string>> {
    let items: Immutable.List<AeSelectItem<string>> = Immutable.List([]);
    let body = response.json();
    if (!isNullOrUndefined(body)) {
        items = Immutable.List(Array.from(body.Entities).map(c => new AeSelectItem<string>(c['Name'], c['Id'], false)));
    }

    if (includeOtherOption) {
        items = items.concat(new AeSelectItem('Other option not listed', 'other', false)).toList();
    }
    return items;
}

export function extractMainActivities(response: Response): Array<MainActivity> {
    let items: Array<MainActivity> = [];
    let body = response.json();
    if (!isNullOrUndefined(body)) {
        items = Array.from(body.Entities).map(c => {
            let mainActivity = new MainActivity();
            mainActivity = ObjectHelper.extract(c, mainActivity);
            return mainActivity;
        });
    }
    return items;
}

export function extractSubActivities(response: Response): Array<SubActivity> {
    let items: Array<SubActivity> = [];
    let body = response.json();
    if (!isNullOrUndefined(body)) {
        items = Array.from(body.Entities).map(c => {
            let subActivity = new SubActivity();
            subActivity = ObjectHelper.extract(c, subActivity);
            return subActivity;
        });
    }
    return items;
}

export function extractGeoLocations(response: Response): Array<GeoLocation> {
    let items: Array<GeoLocation> = [];
    let body = response.json();
    if (!isNullOrUndefined(body)) {
        items = Array.from(body.Entities).map(c => {
            let geoLocation = new GeoLocation();
            geoLocation = ObjectHelper.extract(c, geoLocation);
            return geoLocation;
        });
    }
    return items;
}

export function extractLocalAuthorities(response: Response): Array<LocalAuthority> {
    let items: Array<LocalAuthority> = [];
    let body = response.json();
    if (!isNullOrUndefined(body)) {
        items = Array.from(body.Entities).map(c => {
            let localAuthority = new LocalAuthority();
            localAuthority = ObjectHelper.extract(c, localAuthority);
            return localAuthority;
        });
    }
    return items;
}

export function getRiskAssessmentTypes(response: Response): Immutable.List<AeSelectItem<string>> {
    let riskAssessmentTypes = Array.from(response.json()) as RiskAssessmentType[];
    let riskAssessmentTypesOptions = new Array<AeSelectItem<string>>();

    riskAssessmentTypes.map((keyValuePair) => {
        if (keyValuePair.Name === 'General'
            || keyValuePair.Name === 'Control of substances hazardous to health'
            || keyValuePair.Name === 'General - Migrated'
            || keyValuePair.Name === 'Control of substances hazardous to health - Migrated'
        ) {
            let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id, (keyValuePair.Name.indexOf('Migrated') !== -1) ? true : false);
            aeSelectItem.Childrens = null;
            riskAssessmentTypesOptions.push(aeSelectItem);
        }
    });
    return Immutable.List<AeSelectItem<string>>(riskAssessmentTypesOptions);
}

export function extractProcedureGroups(response: Response): Array<ProcedureGroup> {
    let procedureGroups: Array<ProcedureGroup> = [];
    let body = response.json();
    if (!isNullOrUndefined(body)) {
        Array.from(body.Entities).map(c => {
            let procedureGroup = new ProcedureGroup();
            procedureGroup = ObjectHelper.extract(c, procedureGroup);
            procedureGroups.push(procedureGroup);
        });
    }
    return procedureGroups;
}

export function extractUsersData(response: Response): Array<User> {
    let items: Array<User> = [];
    let body = response.json().Entities as Array<User>;
    if (!isNullOrUndefined(body)) {
        items = Array.from(body).filter(x => x.HasEmail == true).map(usr => {
            let user = new User(usr['Id'], usr['FirstName'], usr['LastName'], usr['HasEmail'], usr['Email']);
            return user;
        });
    }
    return items;
}

export function extractHWPShortModels(response: Response): Array<HWPShortModel> {
    let profileList: Array<HWPShortModel> = [];
    if (!isNullOrUndefined(response)) {
        let body = response.json();
        Array.from(body.Entities).forEach(c => {
            let profile = new HWPShortModel();
            profile = ObjectHelper.extract(c, profile);
            profileList.push(profile);
        });
    }
    return profileList;
}

export function extractHWPShortModel(response: Response): HWPShortModel {
    let profile;
    if (!isNullOrUndefined(response)) {
        let body = response.json();
        profile = new HWPShortModel();
        profile = ObjectHelper.extract(body, profile);
    }
    return profile;
}

export function removeDuplicateAbsenceTypes(originalArray: Array<AbsenceType>): Array<AbsenceType> {
    let arrayAfterDuplicatesRemoval: Array<AbsenceType> = [];
    //first add example false items to the list since they take the priority
    let nonExampleTypes = originalArray.filter(obj => !obj.IsExample);
    let examples = originalArray.filter(obj => obj.IsExample);
    let newArray = Array.from(nonExampleTypes);
    let exampleNewArray = Array.from(examples);
    newArray.forEach(nonEx => {
        arrayAfterDuplicatesRemoval.push(nonEx);
    });

    exampleNewArray.forEach(example => {
        let existingitem = arrayAfterDuplicatesRemoval.filter(obj => obj.TypeName.toLowerCase() == example.TypeName.toLowerCase());
        if (existingitem.length == 0) // there is no non example type which is already in the list , deleting that item
            arrayAfterDuplicatesRemoval.push(example);
    });

    return arrayAfterDuplicatesRemoval;
}
