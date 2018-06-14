import { Sector } from '../../shared/models/sector';
import { Workspace } from '../../checklist/models/workspace.model';
import { EmployeeJobDetails } from './../job/models/job-details.model';
import { EmployeeEvent } from '../employee-timeline/models/emloyee-event';
import { User } from './../../shared/models/user';
import { VehicleDetails } from '../models/vehicle-details';
import { PreviousEmployment } from '../models/previous-employment';
import { Department } from '../../calendar/model/calendar-models';
import { JobHistory } from '../models/job-history';
import { TrainingDetails } from '../models/qualification-history.model';
import { DropDownItem } from '../models/dropdown-item';
import { AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { DataTableOptions } from '../../atlas-elements/common/models/ae-datatable-options';
import { SalaryHistory } from '../models/salary-history';
import { Country, County, EmployeeRelations, UserList, WorkspaceTypes } from '../../shared/models/lookup.models';
import { EmergencyContact } from '../models/emergency-contact.model';
import { AtlasNotification } from './../../root-module/models/notification';
import { Gender } from './gender.enum';
import { isNullOrUndefined } from 'util';
import { StringHelper } from '../../shared/helpers/string-helper';
import { EthnicGroup, UserProfile } from '../../shared/models/lookup.models';
import { EmployeeFullEntity } from '../models/employee-full.model';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { EmployeeStatistics } from '../models/employee-statistics';
import { SalutationCode } from './salutationcode.enum';
import {
    Address,
    Employee,
    EmployeeContacts,
    EmployeeEmergencyContacts,
    EmployeeEthinicGroup,
    EmployeePayrollDetails
} from '../models/employee.model';
import { Response } from '@angular/http';
import { EmployeeInformation } from '../models/employee-information';
import * as Immutable from 'immutable';
import { EnumHelper } from '../../shared/helpers/enum-helper';
import { AeListItem } from '../../atlas-elements/common/models/ae-list-item';
import { EducationDetails } from '../models/education-history.model';
import { TrainingUserCourseModule } from '../../employee/models/training-history.model';
import { BankDetails } from '../../employee/models/bank-details';
import {
    DisciplinaryOutcome,
    EventType,
    Outcome,
    Sensitivity,
    Timeline
} from '../../employee/models/timeline';
import { EmployeeGroup } from '../../shared/models/company.models';
import { UserAdminDetails, AdminOptions, UserCreateMode } from '../../employee/administration/models/user-admin-details.model';
import { EmployeeSearchData } from '../../employee/models/employee-group-association.model';
import { emptyGuid } from './../../shared/app.constants';
import { LastUpdated } from '../models/employee-stat';


export function extractEmployeePersonalData(response: Response): Employee {
    let employee: Employee = new Employee();
    let body = response.json();
    if (!isNullOrUndefined(body)) {
        Object.keys(body).forEach((keyName) => {
            let value = body[keyName];
            switch (keyName) {
                case 'EthnicGroupValueType':
                    employee.EthnicGroup.EthnicGroupValueType = value;
                    break;
                case 'EthnicGroupValueId':
                    employee.EthnicGroup.EthnicGroupValueId = value;
                    break;
                case 'EthnicGroupName':
                    employee.EthnicGroup.Name = value;
                    break;
                case 'EthnicGroupValueName':
                    employee.EthnicGroup.EthnicGroupValueName = value;
                    break;
                case 'TaxCode':
                    employee.EmployeePayrollDetails.TaxCode = value;
                    break;
                case 'NINumber':
                    employee.EmployeePayrollDetails.NINumber = value;
                    break;
                case 'PensionScheme':
                    employee.EmployeePayrollDetails.PensionScheme = value;
                    break;
                case 'empPayId':
                    employee.EmployeePayrollDetails.Id = value;
                    break;
                case 'CompanyId':
                    employee.EmployeePayrollDetails.CompanyId = value;
                    break;
                case 'EmployeeId':
                    employee.EmployeePayrollDetails.EmployeeId = value;
                    break;
                default:
                    if (Object.keys(employee).indexOf(keyName) != -1) {
                        employee[keyName] = value;
                    }
                    break;
            }
        });
    }
    employee.FullName = `${employee.FirstName} ${employee.Surname}`;
    if (!StringHelper.isNullOrUndefinedOrEmpty(employee.Title) && parseInt(employee.Title, 10) > 0) {
        employee.Salutation = SalutationCode[parseInt(employee.Title, 10)];
    }

    if (!isNullOrUndefined(employee.DOB)) {
        employee.Age = calculateAge(employee.DOB);
    }

    if (!isNullOrUndefined(employee.Gender) && employee.Gender > 0) {
        employee.GenderText = Gender[employee.Gender];
    }
    return employee;
}

export function extractPersonalDataFromFullEntity(employeeData: EmployeeFullEntity, ethinicGroupData: EthnicGroup): Employee {
    let employee: Employee = new Employee();
    if (!isNullOrUndefined(employeeData)) {
        Object.keys(employee).forEach((keyName) => {
            if (Object.keys(employeeData).indexOf(keyName) !== -1) {
                if (keyName === 'EmployeePayrollDetails' && !isNullOrUndefined(employeeData['EmployeePayrollDetails'])) {
                    employee.EmployeePayrollDetails.NINumber = employeeData.EmployeePayrollDetails.NINumber;
                    employee.EmployeePayrollDetails.TaxCode = employeeData.EmployeePayrollDetails.TaxCode;
                } else if (keyName === 'EthnicGroup' &&
                    !isNullOrUndefined(employeeData['EthnicGroup']) && !isNullOrUndefined(ethinicGroupData)) {
                    employee.EthnicGroup.Name = employeeData.EthnicGroup.Name;
                    employee.EthnicGroup.EthnicGroupValueName = ethinicGroupData.Name;
                    employee.EthnicGroup.EthnicGroupValueId = ethinicGroupData.Id;
                    employee.EthnicGroup.EthnicGroupValueType = ethinicGroupData.EthnicGroupValueType;
                    employee.EthnicGroup.EthnicGroupTypeId = ethinicGroupData.EthnicGroupTypeId;
                } else {
                    employee[keyName] = employeeData[keyName];
                }
            }
        });
    }
    employee.FullName = `${employee.FirstName} ${employee.Surname}`;
    if (!StringHelper.isNullOrUndefinedOrEmpty(employee.Title) && parseInt(employee.Title, 10) > 0) {
        employee.Salutation = SalutationCode[parseInt(employee.Title, 10)];
    }

    if (!isNullOrUndefined(employee.DOB)) {
        employee.Age = calculateAge(employee.DOB);
    }

    if (!isNullOrUndefined(employee.Gender) && employee.Gender > 0) {
        employee.GenderText = Gender[employee.Gender];
    }

    return employee;
}

export function extractEmployeeContactsData(response: Response): EmployeeContacts {
    let employeeContacts: EmployeeContacts;
    let body = response.json();
    employeeContacts = <EmployeeContacts>body;
    return employeeContacts;
}

export function extractEmployeeSalaryHistoryData(response: Response): SalaryHistory[] {
    let employeeSalaryHistoryData = response.json().Entities as SalaryHistory[];
    return employeeSalaryHistoryData;
}

export function extractEmployeeSalaryHistoryPagingInfo(response: Response): PagingInfo {
    let employeeSalaryPagingInfo = response.json().PagingInfo as PagingInfo;
    return employeeSalaryPagingInfo;
}

export function extractEmployeeJobHistoryData(response: Response): JobHistory[] {
    let employeeSalaryHistoryData = response.json().Entities as JobHistory[];
    return employeeSalaryHistoryData;
}

export function extractEmployeeJobHistoryPagingInfo(response: Response): PagingInfo {
    let paginationInfo = response.json().PagingInfo as PagingInfo;
    return paginationInfo;

};

export function extractEmployeeSalarySelectOptionListData(response: Response): AeSelectItem<string>[] {
    if (!isNullOrUndefined(response)) {
        let salaryJobTitle = Array.from(response.json().Entities) as DropDownItem[];
        if (!isNullOrUndefined(salaryJobTitle)) {
            salaryJobTitle = salaryJobTitle.filter(obj => !StringHelper.isNullOrUndefinedOrEmpty(obj.Name));
            if (!isNullOrUndefined(salaryJobTitle)) {
                return salaryJobTitle.map((keyValuePair) => {
                    let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id, false);
                    aeSelectItem.Childrens = null;
                    return aeSelectItem;
                });
            }
        }
    }
    return [];
}

export function extractWorkspaceTypesSelectOptionsList(workspaceTypes: WorkspaceTypes[]): Immutable.List<AeSelectItem<string>> {
    if (!isNullOrUndefined(workspaceTypes)) {
        return Immutable.List(workspaceTypes.map((keyValuePair) => {
            let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id, false);
            aeSelectItem.Childrens = null;
            return aeSelectItem;
        }));
    }
    return Immutable.List<AeSelectItem<string>>([]);
}

export function extractUserSelectOptionListData(response: Response): AeSelectItem<string>[] {
    if (!isNullOrUndefined(response)) {
        let salaryJobTitle = Array.from(response.json().Entities) as UserList[];
        if (!isNullOrUndefined(salaryJobTitle)) {
            return salaryJobTitle.map((keyValuePair) => {
                let aeSelectItem = new AeSelectItem<string>(keyValuePair.FirstName + ' ' + keyValuePair.LastName, keyValuePair.Id, false);
                aeSelectItem.Childrens = null;
                return aeSelectItem;
            });
        }
    }
    return [];
}

export function createSelectOptionFromArrayList(response: Array<any>, valueKey: string, textKay: string): AeSelectItem<string>[] {
    if (!isNullOrUndefined(response)) {
        let salaryJobTitle = Array.from(response);
        return salaryJobTitle.map((keyValuePair) => {
            let aeSelectItem = new AeSelectItem<string>(keyValuePair[textKay], keyValuePair[valueKey], false);
            aeSelectItem.Childrens = null;
            return aeSelectItem;
        });
    }
    return [];
}

export function extractEmployeeContactsWithAddressData(response: Response): EmployeeContacts {
    let employeeContacts: EmployeeContacts;
    let body = response.json();
    employeeContacts = <EmployeeContacts>body;
    employeeContacts.AddressLine1 = body.Address.AddressLine1;
    employeeContacts.AddressLine2 = body.Address.AddressLine2;
    employeeContacts.AddressLine3 = body.Address.AddressLine3;
    employeeContacts.Town = body.Address.Town;
    employeeContacts.CountyId = body.Address.CountyId;
    employeeContacts.CountryId = body.Address.CountryId;
    employeeContacts.Postcode = body.Address.Postcode;
    employeeContacts.HomePhone = body.Address.HomePhone;
    employeeContacts.MobilePhone = body.Address.MobilePhone;
    employeeContacts.FullAddress = body.Address.FullAddress;
    return employeeContacts;
}

export function extractEmployeeEmergencyContactsData(response: Response): EmployeeEmergencyContacts {
    let employeeEmergencyContacts: EmployeeEmergencyContacts;
    let body = response.json();
    employeeEmergencyContacts = <EmployeeEmergencyContacts>body;
    return employeeEmergencyContacts;
}

export function extractCountyData(response: Response): Array<County> {
    let countyList: Array<County>;
    let body = response.json();
    countyList = <Array<County>>body;
    return countyList;
}

export function extractCountryData(response: Response): Array<Country> {
    let contryList: Array<Country>;
    let body = response.json();
    contryList = <Array<Country>>body;
    return contryList;
}

export function extractEmployeeRelationsData(response: Response): Array<EmployeeRelations> {
    let employeeRelationsList: Array<EmployeeRelations>;
    let body = response.json();
    employeeRelationsList = <Array<EmployeeRelations>>body;
    return employeeRelationsList;
}

export function calculateAge(dob: Date): string {
    dob = new Date(dob);
    if (dob < new Date() && dob.getFullYear() >= 1850) {
        let currentDate = new Date();
        let years = (currentDate.getMonth() < dob.getMonth()) ? currentDate.getFullYear() - dob.getFullYear() - 1 : currentDate.getFullYear() - dob.getFullYear();
        let months = (currentDate.getMonth() < dob.getMonth()) ? 12 - (dob.getMonth() - currentDate.getMonth()) : currentDate.getMonth() - dob.getMonth();
        let newMonthsCount = (currentDate.getDate() < dob.getDate()) ? months - 1 : months;
        years = newMonthsCount < 0 ? years - 1 : years;
        return `${years} years`;
    }
    return '0 years';
}

export function extractEmployeeInformation(response: Response): EmployeeInformation {
    let employeeInfo: EmployeeInformation = new EmployeeInformation();
    let body = response.json();
    if (!isNullOrUndefined(body)) {
        Object.keys(employeeInfo).forEach((keyName) => {
            if (Object.keys(body).indexOf(keyName) != -1) {
                employeeInfo[keyName] = body[keyName];
            }
        });
    }
    return employeeInfo;
}

export function extractLastUpdatedUserInfo(body) {
    let lastUpdated;
    if (!isNullOrUndefined(body)) {
        lastUpdated = new LastUpdated();
        lastUpdated.ModifiedOn = body.ModifiedOn;
        lastUpdated.ModifiedBy = new User();
        lastUpdated.ModifiedBy.FirstName = body.ModifiedFName;
        lastUpdated.ModifiedBy.LastName = body.ModifiedLName;
    }
    return lastUpdated;
}

export function extractEmployeeStatistics(response: Response): EmployeeStatistics[] {
    let employeeStatistics: EmployeeStatistics[] = response.json();
    return employeeStatistics.sort(statistic => statistic.Priority);
}

export function getAeSelectItemsFromEnum<T extends number>(e: any) {
    return Immutable.List(EnumHelper.getNamesAndValues(e).map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<number>(keyValuePair.name, keyValuePair.value, false);
        aeSelectItem.Childrens = null;
        return aeSelectItem;
    }))
}
export function getAeSelectItemsArrayFromEnum<T extends number>(e: any) {
    return EnumHelper.getNamesAndValues(e).map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<number>(keyValuePair.name, keyValuePair.value, false);
        aeSelectItem.Childrens = null;
        return aeSelectItem;
    });
}

export function extractEmployeeFullData(response: Response): EmployeeFullEntity {
    return <EmployeeFullEntity>response.json();
}

export function concatenateToFullString(partialString: string, fullString: string): string {
    if (StringHelper.isNullOrUndefinedOrEmpty(fullString))
        return partialString;
    else
        return fullString + ", " + partialString;
}

export function extractFullAddress(data: EmployeeContacts) {
    let fullAddress: string = '';
    if (!StringHelper.isNullOrUndefinedOrEmpty(data.AddressLine1)) {
        fullAddress = concatenateToFullString(data.AddressLine1, fullAddress);
    }
    if (!StringHelper.isNullOrUndefinedOrEmpty(data.AddressLine2)) {
        fullAddress = concatenateToFullString(data.AddressLine2, fullAddress);
    }
    if (!StringHelper.isNullOrUndefinedOrEmpty(data.AddressLine3)) {
        fullAddress = concatenateToFullString(data.AddressLine3, fullAddress);
    }
    if (!StringHelper.isNullOrUndefinedOrEmpty(data.Town)) {
        fullAddress = concatenateToFullString(data.Town, fullAddress);
    }
    if (!StringHelper.isNullOrUndefinedOrEmpty(data.CountyName)) {
        fullAddress = concatenateToFullString(data.CountyName, fullAddress);
    }
    if (!StringHelper.isNullOrUndefinedOrEmpty(data.Postcode)) {
        fullAddress = concatenateToFullString(data.Postcode, fullAddress);
    }
    if (!StringHelper.isNullOrUndefinedOrEmpty(data.CountryName)) {
        fullAddress = concatenateToFullString(data.CountryName, fullAddress);
    }
    return fullAddress;
}

export function mergeEmployeeContacts(employeeEntity: EmployeeFullEntity, employeeContacts: EmployeeContacts): EmployeeFullEntity {
    if (employeeContacts != undefined) {
        employeeEntity.PersonalEmail = employeeContacts.PersonalEmail;
        employeeEntity.Email = employeeContacts.Email;
        employeeEntity.Address = new Address();
        employeeEntity.Address.Id = employeeEntity.AddressId;
        employeeEntity.Address.CompanyId = employeeEntity.CompanyId;
        employeeEntity.Address.AddressLine1 = employeeContacts.AddressLine1;
        employeeEntity.Address.AddressLine2 = employeeContacts.AddressLine2;
        employeeEntity.Address.AddressLine3 = employeeContacts.AddressLine3;
        employeeEntity.Address.Town = employeeContacts.Town;
        employeeEntity.Address.CountyId = employeeContacts.CountyId;
        employeeEntity.Address.Postcode = employeeContacts.Postcode;
        employeeEntity.Address.CountryId = employeeContacts.CountryId;
        employeeEntity.Address.HomePhone = employeeContacts.HomePhone;
        employeeEntity.Address.MobilePhone = employeeContacts.MobilePhone;
        employeeEntity.Address.FullAddress = employeeContacts.FullAddress;
    }
    return employeeEntity;
}

export function mergeEmployeePersonal(employeeEntity: EmployeeFullEntity, employeePersonal: Employee): EmployeeFullEntity {
    if (isNullOrUndefined(employeeEntity) || isNullOrUndefined(employeePersonal)) return null;

    Object.keys(employeePersonal).forEach((keyName) => {
        if (employeeEntity.hasOwnProperty(keyName)) {
            if (keyName == 'EmployeePayrollDetails' && !isNullOrUndefined(employeePersonal['EmployeePayrollDetails'])) {
                if (isNullOrUndefined(employeeEntity.EmployeePayrollDetails)) {
                    if (StringHelper.isNullOrUndefinedOrEmpty(employeePersonal.EmployeePayrollDetails.NINumber)
                        && StringHelper.isNullOrUndefinedOrEmpty(employeePersonal.EmployeePayrollDetails.TaxCode)) {
                        employeeEntity.EmployeePayrollDetails = null;
                    } else {
                        employeeEntity.EmployeePayrollDetails = new EmployeePayrollDetails();
                        employeeEntity.EmployeePayrollDetails.NINumber = employeePersonal.EmployeePayrollDetails.NINumber;
                        employeeEntity.EmployeePayrollDetails.TaxCode = employeePersonal.EmployeePayrollDetails.TaxCode;
                    }
                } else {
                    employeeEntity.EmployeePayrollDetails.NINumber = employeePersonal.EmployeePayrollDetails.NINumber;
                    employeeEntity.EmployeePayrollDetails.TaxCode = employeePersonal.EmployeePayrollDetails.TaxCode;
                }
            } else if (keyName == 'EthnicGroup' && !isNullOrUndefined(employeePersonal['EthnicGroup'])) {
                if (isNullOrUndefined(employeeEntity.EthnicGroup)) {
                    employeeEntity.EthnicGroup = new EmployeeEthinicGroup();
                }
                employeeEntity.EthnicGroup.Name = employeePersonal.EthnicGroup.Name;
                employeeEntity.EthnicGroup.EthnicGroupValueName = employeePersonal.EthnicGroup.EthnicGroupValueName;
                employeeEntity.EthnicGroup.EthnicGroupValueId = employeePersonal.EthnicGroup.EthnicGroupValueId;
                employeeEntity.EthnicGroup.EthnicGroupValueType = employeePersonal.EthnicGroup.EthnicGroupValueType;
                employeeEntity.EthnicGroup.EthnicGroupTypeId = employeePersonal.EthnicGroup.EthnicGroupTypeId;
            } else {
                employeeEntity[keyName] = employeePersonal[keyName];
            }
        }
    });

    if (!isNullOrUndefined(employeeEntity.EthnicGroup)) {
        employeeEntity.EthnicGroup.EmployeeId = employeeEntity.Id;
        employeeEntity.EthnicGroup.CompanyId = employeeEntity.CompanyId;
    }

    if (!isNullOrUndefined(employeeEntity.EmployeePayrollDetails)) {
        employeeEntity.EmployeePayrollDetails.EmployeeId = employeeEntity.Id;
        employeeEntity.EmployeePayrollDetails.CompanyId = employeeEntity.CompanyId;
    }

    if (!isNullOrUndefined(employeeEntity.Address)) {
        employeeEntity.Address.Author = null
        employeeEntity.Address.Modifier = null
    }
    return employeeEntity;
}

export function mapEthnicgroupsToAeSelectItems(ethnicGroups: EthnicGroup[]): Immutable.List<AeSelectItem<string>> {
    // sort ethnicgroups by EthnicGroupTypeSequenceId
    ethnicGroups = ethnicGroups.sort(function (a, b) { return a.EthnicGroupTypeSequenceId - b.EthnicGroupTypeSequenceId });

    //group ethnicGroups by EthnicGroupTypeName
    let groupedEthnicGroups = ethnicGroups.reduce(function (obj, item) {
        obj[item.EthnicGroupTypeName] = obj[item.EthnicGroupTypeName] || [];
        if (item && !item.SequenceId) {
            item.SequenceId = 9999;
        }
        obj[item.EthnicGroupTypeName].push(item);
        return obj;
    }, {});

    // map ethnicgroup array to imutable list of AeSelectItem
    let aeSelectItemList: Immutable.List<AeSelectItem<string>> = Immutable.List(Object.keys(groupedEthnicGroups).map((groupName, index) => {
        if (groupedEthnicGroups[groupName].length > 0) {
            let ethnicGroup: AeSelectItem<string> = new AeSelectItem<string>(groupName, '', false);

            // sort items in each ethnic group by SequenceId
            groupedEthnicGroups[groupName] = (<Array<EthnicGroup>>groupedEthnicGroups[groupName])
                .sort(function (a, b) { return a.SequenceId - b.SequenceId; });

            ethnicGroup.Childrens = groupedEthnicGroups[groupName].map(item => {
                let ethnicGroupItem: AeSelectItem<string> = new AeSelectItem<string>(item.Name, item.Id, false);
                ethnicGroupItem.Childrens = null;
                return ethnicGroupItem;
            });
            return ethnicGroup;
        }
    }));
    return aeSelectItemList;
}

export function updateEthnicGroup(employee: Employee, ethinicGroup: EthnicGroup) {
    if (!isNullOrUndefined(ethinicGroup)) {
        employee.EthnicGroup.EthnicGroupValueType = ethinicGroup.EthnicGroupValueType;
        employee.EthnicGroup.EthnicGroupValueName = ethinicGroup.EthnicGroupTypeName;
        employee.EthnicGroup.EthnicGroupTypeId = ethinicGroup.EthnicGroupTypeId;
        employee.EthnicGroup.EthnicGroupValueId = ethinicGroup.Id;
    } else {
        employee.EthnicGroup = null;
    }
    return employee;
}

export function mapEmployeeEmergencyContacts(response: Response): any {
    let emergencyConacts = Array.from(response.json().Entities);
    return { Data: Immutable.List<EmergencyContact>(emergencyConacts), Count: response.json().PaginationInfo.TotalCount };
}

export function mapEmployeeAdminDetails(response: Response): any {
    let employeeAdminInfo: UserAdminDetails = new UserAdminDetails();
    let body = response.json();
    if (!isNullOrUndefined(body)) {
        Object.keys(employeeAdminInfo).forEach((keyName) => {
            if (Object.keys(body).indexOf(keyName) != -1) {
                if (keyName === 'UserProfiles') {
                    employeeAdminInfo[keyName] = Array.from(body[keyName]) as UserProfile[];
                } else {
                    employeeAdminInfo[keyName] = body[keyName];
                }
            }
        });
    }
    return employeeAdminInfo;
}

export function mapLookupTableToAeSelectItems(dataSource: any[]): Immutable.List<AeSelectItem<string>> {
    let aeSelectList = Immutable.List(dataSource.map((item) => {
        let ee = new AeSelectItem<string>(item.Name, item.Id, false);
        return ee;
    }).sort((a, b) => a.Text.toLowerCase() < b.Text.toLocaleLowerCase() ? -1 : 1));
    return aeSelectList;
}


export function getBlankEmployeeEmergencyContactObject(): EmployeeEmergencyContacts {
    var employeeEmergencyContactsObj = new EmployeeEmergencyContacts();
    employeeEmergencyContactsObj.Name = '';
    employeeEmergencyContactsObj.EmployeeRelationId = '';
    employeeEmergencyContactsObj.AddressLine1 = '';
    employeeEmergencyContactsObj.AddressLine2 = '';
    employeeEmergencyContactsObj.Town = '';
    employeeEmergencyContactsObj.CountyId = '';
    employeeEmergencyContactsObj.CountryId = '';
    employeeEmergencyContactsObj.Postcode = '';
    employeeEmergencyContactsObj.HomePhone = '';
    employeeEmergencyContactsObj.MobilePhone = '';
    employeeEmergencyContactsObj.Email = '';
    employeeEmergencyContactsObj.Notes = '';
    employeeEmergencyContactsObj.IsPrimary = false;
    return employeeEmergencyContactsObj;
}

export function getFullAddress(empContactsToSave: EmployeeContacts): string {
    var empFullAddress = [];
    empFullAddress.push(empContactsToSave.AddressLine1 || '');
    empFullAddress.push(empContactsToSave.AddressLine2 || '');
    empFullAddress.push(empContactsToSave.AddressLine3 || '');
    empFullAddress.push(empContactsToSave.Town || '');
    empFullAddress.push(empContactsToSave.CountyName || '');
    empFullAddress.push(empContactsToSave.CountryName || '');
    empFullAddress.push(empContactsToSave.Postcode || '');
    return empFullAddress.filter((v) => (v != '')).map(o => o).join(', ');
}

/* Education History - start */
export function extractEmployeeEducationHistoryDetails(response: Response): EducationDetails {
    let employeeEducationHistoryDetails: EducationDetails;
    let body = response.json();
    employeeEducationHistoryDetails = <EducationDetails>body;
    return employeeEducationHistoryDetails;
}
/* Education History - end */

/* Qualification History - start */
export function extractEmployeeQualificationHistoryDetails(response: Response): TrainingDetails {
    let employeeQualificationHistoryDetails: TrainingDetails;
    let body = response.json();
    employeeQualificationHistoryDetails = <TrainingDetails>body;
    return employeeQualificationHistoryDetails;
}
/* Qualification History - end */

export function extractEngineCCTypes(engineCCTypes: any[]): Immutable.List<AeSelectItem<string>> {
    return Immutable.List(engineCCTypes.map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.EngineCC, keyValuePair.Id);
        aeSelectItem.Childrens = null;
        aeSelectItem.Text = keyValuePair.EngineCC;
        aeSelectItem.Value = keyValuePair.Id;
        return aeSelectItem;
    }));
};

export function extractFuelTypes(fuelTypes: any[]): Immutable.List<AeSelectItem<string>> {
    return Immutable.List(fuelTypes.map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.FuelType, keyValuePair.Id);
        aeSelectItem.Childrens = null;
        aeSelectItem.Text = keyValuePair.FuelType;
        aeSelectItem.Value = keyValuePair.Id;
        return aeSelectItem;
    }));
};

/* Training History - start */
export function extractEmployeeTrainingHistoryDetails(response: Response): TrainingUserCourseModule {
    let employeeTrainingHistoryDetails: TrainingUserCourseModule;
    let body = response.json();
    employeeTrainingHistoryDetails = <TrainingUserCourseModule>body;
    return employeeTrainingHistoryDetails;
}
/* Training History - end */

/**
 * Manage employees list extract method
 * 
 * @export
 * @param {Response} response
 * @returns {Employee[]}
 */
export function extractEmployeesListData(response: Response): Employee[] {
    let employeesList = response.json().Entities as Employee[];
    return employeesList;
}

/**
 * Manage employees list paging info extract method
 * 
 * @export
 * @param {Response} response
 * @returns {PagingInfo}
 */
export function extractEmployeesPagingInfo(response: Response): PagingInfo {
    let employeesPagingInfo = response.json().PagingInfo as PagingInfo;
    return employeesPagingInfo;
}

export function extractEventTypeSelectItems(documentSubCategories: EventType[]): AeSelectItem<string>[] {
    return documentSubCategories.map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Title, keyValuePair.Id, false);
        aeSelectItem.Childrens = null;
        return aeSelectItem;
    }).sort(function (a, b) {
        if (a.Text < b.Text)
            return -1;
        if (a.Text > b.Text)
            return 1;
        return 0;
    });
}

export function extractDisciplinaryOutcomeSelectItems(disciplinaryOutcome: DisciplinaryOutcome[]): AeSelectItem<string>[] {
    return disciplinaryOutcome.map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Title, keyValuePair.Id, false);
        aeSelectItem.Childrens = null;
        return aeSelectItem;
    }).sort(function (a, b) {
        if (a.Text < b.Text)
            return -1;
        if (a.Text > b.Text)
            return 1;
        return 0;
    });
}

export function extractOutcomeSelectItems(outcome: Outcome[]): AeSelectItem<string>[] {
    return outcome.map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Title, keyValuePair.Id, false);
        aeSelectItem.Childrens = null;
        return aeSelectItem;
    }).sort(function (a, b) {
        if (a.Text < b.Text)
            return -1;
        if (a.Text > b.Text)
            return 1;
        return 0;
    });
}


export function mapEmployeesToAeSelectItems(employees: any[]): AeSelectItem<string>[] {
    return employees.map((employee) => {
        let siteName = employee.Job && employee.Job.Site ? employee.Job.Site.Name : employee.SiteName;
        let aeSelectItem = new AeSelectItem<string>(!isNullOrUndefined(siteName) ? (employee.FullName + ' (' + siteName + ')') : employee.FullName, employee.Id);
        return aeSelectItem
    })
}

export function mapEmployeKeyValuesToAeSelectItems(employees: any[]): AeSelectItem<string>[] {
    return employees.map((employee) => {
        let FullName = employee.FirstName ? (employee.FirstName + ' ' + (isNullOrUndefined(employee.MiddleName) ? '' : employee.MiddleName) + ' ' + employee.Surname) : employee.FullName;
        let aeSelectItem = new AeSelectItem<string>(FullName, employee.Id);
        return aeSelectItem
    })
}

export function extractEmployeeEventData(response: Response): EmployeeEvent {
    let employeeEvent: EmployeeEvent;
    let body = response.json();
    employeeEvent = <EmployeeEvent>body;
    return employeeEvent;
}

export function extractEmployeeGroupPagingInfo(response: Response): PagingInfo {
    let employeeGroupsPagingInfo = response.json().PagingInfo as PagingInfo;
    return employeeGroupsPagingInfo;
}

export function extractEmployeeGroupList(response: Response): EmployeeGroup[] {
    let employeeGroupList = response.json().Entities as EmployeeGroup[];
    return employeeGroupList;
}

export function extractPreviousEmployementEntities(response: Response) {
    let body = response.json().Entities as PreviousEmployment[];
    return body;
}

export function extractPreviousEmployementPagingInfo(response: Response) {
    let body = response.json().PagingInfo as PagingInfo;
    return body;
}

export function extractEmployeeVehicleEntities(response: Response) {
    let body = response.json().Entities as VehicleDetails[];
    return body;
}

export function extractEmployeeBankDetails(response: Response): BankDetails {
    let bankDetails: BankDetails;
    let body = response.json();
    bankDetails = <BankDetails>body;
    return bankDetails;
}

export function extractDelegatedUsers(users: Array<User>): Immutable.List<AeSelectItem<string>> {
    if (users) {
        return Immutable.List(users.map((keyValuePair) => {
            let aeSelectItem = new AeSelectItem<string>(keyValuePair.FirstName + ' ' + keyValuePair.Surname, keyValuePair.Id);
            aeSelectItem.Childrens = null;
            return aeSelectItem;
        }));
    }
}

export function extractPagingInfo(response: Response) {
    let body = response.json().PagingInfo as PagingInfo;
    return body;
}


export function extractEmployeeTimelineEntities(response: Response) {
    let body = response.json().Entities as Timeline[];
    return body;
}

export function calculateYearsAndMonthsFromToday(dob: Date) {
    dob = new Date(dob);
    let yearData = '';
    var currentDate = new Date();
    var years = (currentDate.getMonth() < dob.getMonth()) ? currentDate.getFullYear() - dob.getFullYear() - 1 : currentDate.getFullYear() - dob.getFullYear();
    var months = (currentDate.getMonth() < dob.getMonth()) ? 12 - (dob.getMonth() - currentDate.getMonth()) : currentDate.getMonth() - dob.getMonth();
    var newMonthsCount = (currentDate.getDate() > dob.getDate()) ? months - 1 : months;
    if (newMonthsCount < 0) {
        newMonthsCount = 0;
    }
    years = newMonthsCount < 0 ? years - 1 : years;
    months = newMonthsCount < 0 ? 11 : newMonthsCount;
    if (years <= 0) {
        if (years == 0) {
            if (currentDate.getMonth() >= dob.getMonth()) {
                if (currentDate.getMonth() == dob.getMonth()) {
                    if (currentDate.getDate() >= dob.getDate()) {
                        return months > 0 ? years + ' year(s) and ' + months + ' month(s)' : years + ' year(s)';
                    } else {
                        return '';
                    }
                } else {
                    return months > 0 ? years + ' year(s) and ' + months + ' month(s)' : years + ' year(s)';
                }
            } else {
                return '';
            }
        } else {
            return '';
        }

    } else {
        return months > 0 ? years + ' year(s) and ' + months + ' month(s)' : years + ' year(s)';
    }

}

/* Job Details  - start */
export function extractEmployeeJobDetails(response: Response): EmployeeJobDetails {
    let employeeJobDetails: EmployeeJobDetails;
    let body = response.json();
    employeeJobDetails = <EmployeeJobDetails>body;
    return employeeJobDetails;
}

export function mergeEmployeeJobDetails(employeeEntity: EmployeeFullEntity, employeeJobDetails: EmployeeJobDetails): EmployeeFullEntity {
    if (employeeJobDetails != undefined) {
        employeeEntity.Job.EmployeeId = employeeEntity.Id;
        employeeEntity.Job.CompanyId = employeeEntity.CompanyId;
        employeeEntity.Job.DepartmentId = employeeJobDetails.DepartmentId === emptyGuid ? null : employeeJobDetails.DepartmentId;
        employeeEntity.EmploymentTypeId = employeeJobDetails.EmploymentTypeId;
        employeeEntity.EmployeeNumber = employeeJobDetails.EmployeeNumber;
        employeeEntity.Job.ExpiredCarryForwardedUnits = employeeJobDetails.ExpiredCarryForwardedUnits;
        employeeEntity.Job.HolidayEntitlement = employeeJobDetails.HolidayEntitlement;
        employeeEntity.Job.HolidayUnitType = employeeJobDetails.HolidayUnitType;
        employeeEntity.Job.HomeBased = employeeJobDetails.HomeBased;
        employeeEntity.Job.HoursAWeek = employeeJobDetails.HoursAWeek;
        employeeEntity.Job.JobTitleId = employeeJobDetails.JobTitleId;
        employeeEntity.Job.JobTitle = null;
        employeeEntity.Job.Days = employeeJobDetails.Days;
        employeeEntity.Job.OtherEmployeeType = employeeJobDetails.OtherEmployeeType;
        employeeEntity.Job.ProbationaryPeriod = employeeJobDetails.ProbationaryPeriod;
        employeeEntity.Job.SiteId = employeeJobDetails.SiteId === emptyGuid ? null : employeeJobDetails.SiteId;
        employeeEntity.Job.StartDate = employeeJobDetails.StartDate;
        employeeEntity.Job.CarryForwardedUnitType = employeeJobDetails.CarryForwardedUnitType;
        employeeEntity.Job.CarryForwardedUnits = employeeJobDetails.CarryForwardedUnits;
        employeeEntity.Job.HolidayWorkingProfileId = employeeJobDetails.HolidayWorkingProfileId === emptyGuid ? null :
            employeeJobDetails.HolidayWorkingProfileId;
    }
    return employeeEntity;
}

export function getTimelineViewTypeOptionsForAdvance(sensitivity: typeof Sensitivity) {
    return Immutable.List(EnumHelper.getNamesAndValues(sensitivity).filter(enumItem => enumItem.value !== Sensitivity.Sensitive).map((enumItem) => {
        let item: AeSelectItem<number> = new AeSelectItem<number>();
        item.Text = getSensitivityName(enumItem.value);
        item.Value = enumItem.value;
        return item;
    })).sort((a, b) => { return a.Text.localeCompare(b.Text) }).toList();
}


export function getTimelineViewTypeOptionsForBasic(sensitivity: typeof Sensitivity) {
    return Immutable.List(EnumHelper.getNamesAndValues(sensitivity).filter(enumItem => enumItem.value === Sensitivity.Basic).map((enumItem) => {
        let item: AeSelectItem<number> = new AeSelectItem<number>();
        item.Text = getSensitivityName(enumItem.value);
        item.Value = enumItem.value;
        return item;
    })).sort((a, b) => { return a.Text.localeCompare(b.Text) }).toList();
}

export function getTimelineViewTypeOptionsForSensitive(sensitivity: typeof Sensitivity) {
    return Immutable.List(EnumHelper.getNamesAndValues(sensitivity).map((enumItem) => {
        let item: AeSelectItem<number> = new AeSelectItem<number>();
        item.Text = getSensitivityName(enumItem.value);
        item.Value = enumItem.value;
        return item;
    })).sort((a, b) => { return a.Text.localeCompare(b.Text) }).toList();
}

export function getSensitivityName(sensitivity: Sensitivity) {
    switch (sensitivity) {
        case Sensitivity.Basic:
            return 'Basic';
        case Sensitivity.Advance:
            return 'Advanced';
        case Sensitivity.Sensitive:
            return 'Sensitive';
    }
    return '';
}


export function mergeEmployeeOptionsDetails(employeeEntity: EmployeeFullEntity, employeeOptionsDetails: AdminOptions): EmployeeFullEntity {
    if (!isNullOrUndefined(employeeOptionsDetails)) {
        employeeEntity.HasEmail = employeeOptionsDetails.HasEmail;
        employeeEntity.Email = ((employeeOptionsDetails.HasEmail && employeeOptionsDetails.CreateUser) ? employeeOptionsDetails.Email : (!isNullOrUndefined(employeeOptionsDetails.EmpEmailUser) && (employeeOptionsDetails.EmpEmailUser !== '')) ? employeeOptionsDetails.EmpEmailUser : null);
        employeeEntity.CreateUser = employeeOptionsDetails.CreateUser;
        employeeEntity.UserPassword = employeeOptionsDetails.Password;
        employeeEntity.UserId = ((employeeOptionsDetails.CreateUser && employeeOptionsDetails.UserCreateMode == 0) || (!isNullOrUndefined(employeeEntity.UserId))) ? employeeOptionsDetails.UserId : null;
        if (employeeOptionsDetails.CreateUser && isNullOrUndefined(employeeEntity.UserName)) {
            employeeEntity.UserName = (employeeOptionsDetails.HasEmail) ? employeeOptionsDetails.Email : employeeOptionsDetails.UserName;
        }
        employeeEntity.EmpEmailUser = employeeOptionsDetails.EmpEmailUser;
        employeeEntity.ConfirmPassword = employeeOptionsDetails.ConfirmPassword;
        if ((isNullOrUndefined(employeeEntity.UserName) || employeeEntity.UserName == '') && (isNullOrUndefined(employeeOptionsDetails.EmpEmailUser) || employeeOptionsDetails.EmpEmailUser == '') && (isNullOrUndefined(employeeOptionsDetails.Email) || employeeOptionsDetails.Email == '')) {
            employeeEntity.HasEmail = false;
        }

    }
    return employeeEntity;
}

export function extractUserCreationModes(): Immutable.List<AeSelectItem<number>> {
    let userCreateModes: Array<AeSelectItem<number>> = EnumHelper.getAeSelectItems(UserCreateMode);
    return Immutable.List(userCreateModes);
}

export function mergeEmployeeBenefitsDetails(employeeEntity: EmployeeFullEntity, PensionScheme: string): EmployeeFullEntity {
    employeeEntity.EmployeePayrollDetails.PensionScheme = PensionScheme;
    return employeeEntity;
}


export function extractWorkspaceSelectOptionListData(workspaces: Workspace[]): Immutable.List<AeSelectItem<string>> {
    return Immutable.List(workspaces.map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id, false);
        aeSelectItem.Childrens = null;
        return aeSelectItem;
    }));

}

export function extractSectorSelectOptionListData(workspaces: Sector[]): Immutable.List<AeSelectItem<string>> {
    return Immutable.List(workspaces.map((keyValuePair) => {
        let aeSelectItem = new AeSelectItem<string>(keyValuePair.Name, keyValuePair.Id, false);
        aeSelectItem.Childrens = null;
        return aeSelectItem;
    }));

}

export function extractEmployeeSearchData(response: any[]): EmployeeSearchData[] {
    return response.map((employee) => {
        let FullName = employee.FirstName ? (employee.FirstName + ' ' + (isNullOrUndefined(employee.MiddleName) ? '' : employee.MiddleName) + ' ' + employee.Surname) : employee.FullName;
        let searchData = new EmployeeSearchData();
        searchData.FullName = FullName;
        searchData.Id = employee.Id;
        searchData.SiteName = employee.Site.Name;
        searchData.SiteId = employee.Site.Id;
        return searchData
    })
}
