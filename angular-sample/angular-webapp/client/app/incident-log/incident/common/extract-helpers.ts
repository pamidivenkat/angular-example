import { isObject } from 'rxjs/util/isObject';
import { Response } from '@angular/http';
import { Site } from './../../../company/sites/models/site.model';
import { EmployeeFullEntity } from './../../../employee/models/employee-full.model';
import { IncidentReportedBy } from './../models/incident-reported-by.model';
import { IncidentType } from './../../../shared/models/lookup.models';
import * as Immutable from 'immutable';
import { AeSelectItem } from './../../../atlas-elements/common/models/ae-select-item';
import { InjuredPerson, SelectedEmployeeDetails } from './../models/incident-injured-person.model';
import { IncidentRIDDOR, RIDDOROnlineFormVM, RIDDORReportedMedium } from './../models/incident-riddor.model';
import { ObjectHelper } from './../../../shared/helpers/object-helper';
import { isNullOrUndefined } from 'util';
import { Gender } from './../../../shared/models/lookup.models';
import { StringHelper } from './../../../shared/helpers/string-helper';
import { IncidentPreviewVM } from './../models/incident-preview.model';
import { Address } from './../../../employee/models/employee.model'
import { EnumHelper } from "../../../shared/helpers/enum-helper";
import { IncidentDetailsVM, Witness } from './../models/incident-about-incident';

export function extractHeadOfficeSiteData(response: Response): Site {
    let headOfficeSite: Site;
    let body = response.json();
    headOfficeSite = (<Site[]>body)[0];
    return headOfficeSite;
}

export function extractSelectedUserEmployeeData(response: Response): Address {
    let selecteduserEmpDetails: Address;
    let body = response.json();
    selecteduserEmpDetails = <Address>body[0];
    return selecteduserEmpDetails;
}

export function extractSelectedIncidentReportedByData(response: Response): IncidentReportedBy {
    let selectedIncidentReportedByDetails: IncidentReportedBy;
    let body = response.json();
    selectedIncidentReportedByDetails = <IncidentReportedBy>body;
    return selectedIncidentReportedByDetails;
}

export function extractInjuredPersonData(response: Response): InjuredPerson {
    let data: InjuredPerson = new InjuredPerson();
    let body = response.json();
    if (body != null) {
        data.Id = body.Id;
        data.Address = body.Address;
        data.AddressId = body.AddressId;
        data.DateOfBirth = body.DateOfBirth;
        data.Gender = body.Gender;
        data.InjuredPartyId = body.InjuredPartyId;
        data.IsPregnant = body.IsPregnant;
        data.Name = body.Name;
        data.Occupation = body.Occupation;
        data.OtherInjuredParty = body.OtherInjuredParty;
        data.StartDate = body.StartDate;
        data.UserId = body.UserId;
    }
    return data;
}


export function extractSelectedEmployeeDetailsData(response: Response): SelectedEmployeeDetails {
    let selectedEmpDetails: SelectedEmployeeDetails = new SelectedEmployeeDetails();
    let body = response.json();
    if (body != null) {
        selectedEmpDetails.Address = body.Address ? body.Address : null;
        selectedEmpDetails.DateOfBirth = body.DOB;
        selectedEmpDetails.Occupation = body.Job.JobTitle.Name;
        selectedEmpDetails.StartDate = body.Job.StartDate;
        selectedEmpDetails.Gender = body.Gender;
    }
    return selectedEmpDetails;
}

export function mergeWithSelectedIncidentReportedByData(oldIncidentReportedBy: IncidentReportedBy
    , newIncidentReportedBy: IncidentReportedBy
    , loggedInUserId: string): IncidentReportedBy {
    oldIncidentReportedBy.Address = newIncidentReportedBy.Address;
    oldIncidentReportedBy.AddressId = newIncidentReportedBy.AddressId;
    oldIncidentReportedBy.Author = null;
    oldIncidentReportedBy.CompanyId = newIncidentReportedBy.CompanyId;
    oldIncidentReportedBy.Id = newIncidentReportedBy.Id;
    oldIncidentReportedBy.Incident = null;
    oldIncidentReportedBy.ModifiedBy = loggedInUserId;
    oldIncidentReportedBy.ModifiedOn = new Date();
    oldIncidentReportedBy.Modifier = null;
    oldIncidentReportedBy.Name = newIncidentReportedBy.Name;
    oldIncidentReportedBy.User = null;
    oldIncidentReportedBy.UserId = newIncidentReportedBy.UserId;
    oldIncidentReportedBy.Version = newIncidentReportedBy.Version;
    return oldIncidentReportedBy;
}

export function mapIncidentTypeToAeSelectItems(incidentTypes: IncidentType[]): Immutable.List<AeSelectItem<string>> {
    incidentTypes = incidentTypes.sort(function (a, b) { return (a.IncidentCategory.Name > b.IncidentCategory.Name) ? 1 : ((b.IncidentCategory.Name > a.IncidentCategory.Name) ? -1 : 0); });

    let groupedIncidentTypes = incidentTypes.reduce(function (obj, item) {
        obj[item.IncidentCategory.Name] = obj[item.IncidentCategory.Name] || [];
        obj[item.IncidentCategory.Name].push(item);
        return obj;
    }, {});

    let aeSelectItemList: Immutable.List<AeSelectItem<string>> = Immutable.List(Object.keys(groupedIncidentTypes).map((groupName, index) => {
        if (groupedIncidentTypes[groupName].length > 0) {
            let incidentTypeGroup: AeSelectItem<string> = new AeSelectItem<string>(groupName, '', false);

            groupedIncidentTypes[groupName] = (<Array<IncidentType>>groupedIncidentTypes[groupName])
                .sort(function (a, b) { return (a.Name > b.Name) ? 1 : ((b.Name > a.Name) ? -1 : 0); });

            incidentTypeGroup.Childrens = groupedIncidentTypes[groupName].map(item => {
                let incidentTypeGroupItem: AeSelectItem<string> = new AeSelectItem<string>(item.Name, item.Id, false);
                incidentTypeGroupItem.Childrens = null;
                return incidentTypeGroupItem;
            });
            incidentTypeGroup.Childrens = incidentTypeGroup.Childrens.sort(function (a, b) { return (a.Text > b.Text) ? 1 : ((b.Text > a.Text) ? -1 : 0); });
            return incidentTypeGroup;
        }
    }));
    return aeSelectItemList;
}

export function extractRIDDOR(body: any): IncidentRIDDOR {
    let incidentRIDDOR: IncidentRIDDOR = new IncidentRIDDOR();
    if (!isNullOrUndefined(body)) {
        incidentRIDDOR = ObjectHelper.extract(body, incidentRIDDOR);

        if (body.hasOwnProperty('RIDDORReportedBy') &&
            !isNullOrUndefined(body.RIDDORReportedBy)) {
            incidentRIDDOR.RIDDORReportedByName = body.RIDDORReportedBy.FullName;
        }

        if (body.hasOwnProperty('LocalAuthority') &&
            !isNullOrUndefined(body.LocalAuthority)) {
            incidentRIDDOR.CountyId = body.LocalAuthority.GeoRegionId;
            if (!isNullOrUndefined(body.LocalAuthority.GeoRegion)) {
                incidentRIDDOR.CountryId = body.LocalAuthority.GeoRegion.CountryId;
            }
        }

        if (StringHelper.isNullOrUndefinedOrEmpty(incidentRIDDOR.MainIndustryId) &&
            !StringHelper.isNullOrUndefinedOrEmpty(incidentRIDDOR.OtherMainIndustry)) {
            incidentRIDDOR.MainIndustryId = 'other';
        }

        if (StringHelper.isNullOrUndefinedOrEmpty(incidentRIDDOR.MainActivityId) &&
            !StringHelper.isNullOrUndefinedOrEmpty(incidentRIDDOR.OtherMainActivity)) {
            incidentRIDDOR.MainActivityId = 'other';
        }

        if (StringHelper.isNullOrUndefinedOrEmpty(incidentRIDDOR.SubActivityId) &&
            !StringHelper.isNullOrUndefinedOrEmpty(incidentRIDDOR.OtherSubActivity)) {
            incidentRIDDOR.SubActivityId = 'other';
        }
    }
    return incidentRIDDOR;
}

export function extractRIDDOROnlineForm(response: Response): RIDDOROnlineFormVM {
    let vm = new RIDDOROnlineFormVM();
    let body = response.json();
    if (!isNullOrUndefined(body)) {
        vm = ObjectHelper.extract(body, vm);

        if (body.hasOwnProperty('Gender') &&
            !isNullOrUndefined(body['Gender'])) {
            vm.GenderText = Gender[parseInt(body['Gender'], 10)]
        }

        if (body.hasOwnProperty('AIDetails') &&
            !isNullOrUndefined(body['AIDetails'])) {
            let aboutIncidentDetails = <IncidentDetailsVM>JSON.parse(body['AIDetails']);
            vm.AboutIncidentDetails = aboutIncidentDetails;
            extractAboutIncidentDetails(vm);
            if (aboutIncidentDetails.hasOwnProperty('WhenHappened') &&
                !isNullOrUndefined(aboutIncidentDetails['WhenHappened'])) {
                var tempDt = new Date(aboutIncidentDetails['WhenHappened']);
                if (isNaN(tempDt.valueOf())) {
                    vm.WhenHappened = null;
                }
                else {
                    vm.WhenHappened = new Date(tempDt.setMinutes(tempDt.getMinutes() + (tempDt.getTimezoneOffset() * -1)));
                }
            }
            if (aboutIncidentDetails.hasOwnProperty('Premises') &&
                !isNullOrUndefined(aboutIncidentDetails['Premises'])) {
                vm.WhereHappened = aboutIncidentDetails['Premises'];
            }
            if (aboutIncidentDetails.hasOwnProperty('InjuryDescription') &&
                !isNullOrUndefined(aboutIncidentDetails['InjuryDescription'])) {
                vm.InjuryDescription = aboutIncidentDetails['InjuryDescription'];
            }
        }
        else {
            vm.AboutIncidentDetails = new IncidentDetailsVM();
        }

        if (body.hasOwnProperty('DateOfBirth') &&
            !isNullOrUndefined(body['DateOfBirth'])) {
            vm.DateOfBirth = new Date(body['DateOfBirth']);
        }
        if (body.hasOwnProperty('MobilePhone') &&
            !isNullOrUndefined(body['MobilePhone'])) {
            vm.HomePhone = body['MobilePhone'];
        }
        vm.Age = calculatePersonAge(vm.DateOfBirth);
        vm.FullAddress = getFormattedAddress(body['Address'])
    }
    return vm;
}

export function getFormattedAddress(address) {
    let formattedAddress = '';
    if (!isNullOrUndefined(address)) {
        if (isObject(address)) {
            if (!StringHelper.isNullOrUndefinedOrEmpty(address.AddressLine1)) {
                formattedAddress = formattedAddress + address.AddressLine1 + ',';
            }

            if (!StringHelper.isNullOrUndefinedOrEmpty(address.AddressLine2)) {
                formattedAddress = formattedAddress + address.AddressLine2 + ',';
            }

            if (!StringHelper.isNullOrUndefinedOrEmpty(address.Town)) {
                formattedAddress = formattedAddress + address.Town + ',';
            }

            if (!StringHelper.isNullOrUndefinedOrEmpty(address.Postcode)) {
                formattedAddress = formattedAddress + address.Postcode + ',';
            }
            if (formattedAddress.length > 0) {
                formattedAddress = formattedAddress.substr(0, formattedAddress.length - 1);
            }
        }
    }
    return formattedAddress;
}

export function calculatePersonAge(dob: Date): string {
    dob = new Date(dob);
    if (dob < new Date() && dob.getFullYear() >= 1850) {
        let currentDate = new Date();
        let years = (currentDate.getMonth() < dob.getMonth()) ? currentDate.getFullYear() - dob.getFullYear() - 1 : currentDate.getFullYear() - dob.getFullYear();
        let months = (currentDate.getMonth() < dob.getMonth()) ? 12 - (dob.getMonth() - currentDate.getMonth()) : currentDate.getMonth() - dob.getMonth();
        let newMonthsCount = (currentDate.getDate() < dob.getDate()) ? months - 1 : months;
        years = newMonthsCount < 0 ? years - 1 : years;
        return `${years} year(s)`;
    }
    return '0 years';
}

export function extractIncidentPreviewData(response: Response): IncidentPreviewVM {
    let vm = new IncidentPreviewVM();
    let body = response.json();
    if (!isNullOrUndefined(body)) {
        vm = ObjectHelper.extract(body, vm);
        vm.PreviewDate = new Date();

        if (body.hasOwnProperty('AIDetails') &&
            !isNullOrUndefined(body['AIDetails'])) {
            let aboutIncidentDetails = <IncidentDetailsVM>JSON.parse(body['AIDetails']);
            vm.AboutIncidentDetails = aboutIncidentDetails;
            extractAboutIncidentDetails(vm);
            if (aboutIncidentDetails.hasOwnProperty('WhenHappened') &&
                !isNullOrUndefined(aboutIncidentDetails['WhenHappened'])) {
                var tempDt = new Date(aboutIncidentDetails['WhenHappened']);
                if (isNaN(tempDt.valueOf())) {
                    vm.AboutIncidentDetails.WhenHappened = null;
                }
                else {
                    vm.AboutIncidentDetails.WhenHappened = tempDt;
                }
            }
            if (aboutIncidentDetails.hasOwnProperty('IncidentTypeId') &&
                !isNullOrUndefined(aboutIncidentDetails['IncidentTypeId'])) {
                vm.AboutIncidentIncidentTypeId = aboutIncidentDetails['IncidentTypeId'];
            }
            if (aboutIncidentDetails.hasOwnProperty('HasWitness') && !isNullOrUndefined(aboutIncidentDetails.Witnesses)) {              
                vm.Witnesses = (<Array<Witness>>aboutIncidentDetails.Witnesses).filter(x => !StringHelper.isNullOrUndefinedOrEmpty(x.FullName) || !StringHelper.isNullOrUndefinedOrEmpty(x.Telephone) || !StringHelper.isNullOrUndefinedOrEmpty(x.JobRole));
            }
            let abtIncDetails = JSON.parse(body['AIDetails']);
            if (aboutIncidentDetails.hasOwnProperty('DiagnosedDiseaseCategory')) {
                if (!StringHelper.isNullOrUndefinedOrEmpty(abtIncDetails['DiagnosedDiseaseCategory'])) {
                    vm.DiagnosedDiseaseCategoryName = abtIncDetails['DiagnosedDiseaseCategory'][0].Name;
                }
            }


        }
        else {
            vm.AboutIncidentDetails = new IncidentDetailsVM();
        }

        if (body.hasOwnProperty('CompanyId') && !isNullOrUndefined(body['CompanyId'])) {
            vm.CompanyId = body['CompanyId'];
        }

        if (body.hasOwnProperty('InjuredPerson') && !isNullOrUndefined(body['InjuredPerson'])) {

            if (!isNullOrUndefined(body['InjuredPerson'].Name)) {
                vm.InjuredPersonName = body['InjuredPerson'].Name;
            }
            if (!isNullOrUndefined(body['InjuredPerson'].Address)) {
                vm.InjuredPersonAddressLine1 = body['InjuredPerson'].Address.AddressLine1;
                vm.InjuredPersonAddressLine2 = body['InjuredPerson'].Address.AddressLine2;
                vm.InjuredPersonTown = body['InjuredPerson'].Address.Town;
                vm.InjuredPersonPostcode = body['InjuredPerson'].Address.Postcode;
                vm.InjuredPersonMobilePhone = body['InjuredPerson'].Address.MobilePhone;
            }
            if (!isNullOrUndefined(body['InjuredPerson'].InjuredParty)) {
                vm.InjuredPersonInjuredPartyName = body['InjuredPerson'].InjuredParty.Name;
            }
            else {
                vm.InjuredPersonInjuredPartyName = body['InjuredPerson'].OtherInjuredParty;
            }
            if (!isNullOrUndefined(body['InjuredPerson'].Occupation)) {
                vm.InjuredPersonOccupation = body['InjuredPerson'].Occupation;
            }
            if (!isNullOrUndefined(body['InjuredPerson'].Gender)) {
                vm.InjuredPersonGender = body['InjuredPerson'].Gender;
                vm.InjuredPersonGenderText = body['InjuredPerson'].Gender == 1 ? 'Male' : 'Female';
            }
            if (!isNullOrUndefined(body['InjuredPerson'].OtherInjuredParty)) {
                vm.InjuredPersonOtherInjuredParty = body['InjuredPerson'].OtherInjuredParty;
            }
            if (!isNullOrUndefined(body['InjuredPerson'].DateOfBirth)) {
                vm.InjuredPersonDateOfBirth = body['InjuredPerson'].DateOfBirth;
            }
            if (!isNullOrUndefined(body['InjuredPerson'].StartDate)) {
                vm.InjuredPersonStartDate = body['InjuredPerson'].StartDate;
            }
            if (!isNullOrUndefined(body['InjuredPerson'].IsPregnant)) {
                vm.NewOrExpectantMother = body['InjuredPerson'].IsPregnant;
            }
            if (!isNullOrUndefined(body['InjuredPerson'].InjuredPartyId)) {
                vm.InjuredPartyId = body['InjuredPerson'].InjuredPartyId;
                vm.IsInjuredPartyEmployee = (body['InjuredPerson'].InjuredPartyId.toUpperCase() == "F62694A9-75A0-4B54-9055-DC08AB25329E") ? true : false;
            }

        }

        if (body.hasOwnProperty('IncidentReportedBy') && !isNullOrUndefined(body['IncidentReportedBy'])) {
            if (!isNullOrUndefined(body['IncidentReportedBy'].Name)) {
                vm.IncidentReportedByUserFullName = body['IncidentReportedBy'].Name;
            }
            if (!isNullOrUndefined(body['IncidentReportedBy'].Address)) {
                vm.IncidentReportedByAddressLine1 = body['IncidentReportedBy'].Address.AddressLine1;
                vm.IncidentReportedByAddressLine2 = body['IncidentReportedBy'].Address.AddressLine2;
                vm.IncidentReportedByTown = body['IncidentReportedBy'].Address.Town;
                vm.IncidentReportedByPostcode = body['IncidentReportedBy'].Address.Postcode;
            }
        }

        if (body.hasOwnProperty('Author') && !isNullOrUndefined(body['Author'])) {
            vm.Signature = body['Author'].Signature;
            vm.AuthorCompanyId = body['Author'].CompanyId;
        }

        if (body.hasOwnProperty('StatusId') && !isNullOrUndefined(body['StatusId'])) {
            vm.IncidentStatus = body['StatusId'];
        }
        if (!isNullOrUndefined(body['ReportedToRIDDORReportedMedium'])) {
            vm.ReportedToRIDDORReportedMedium = EnumHelper.getNamesAndValues(RIDDORReportedMedium).find(x => x.value == body['ReportedToRIDDORReportedMedium']).name;
        }
        if (isNullOrUndefined(body['RTFirstName'])) {
            body['RTFirstName'] = "";
        }
        if (isNullOrUndefined(body['RTLastName'])) {
            body['RTLastName'] = "";
        }
        vm.ReportedToReportedBy = (body['RTFirstName']) + ' ' + (body['RTLastName']);
    }
    return vm;
}
export function extractValuesInAlphabeticOrder(data: Array<any>) {
    let sortedData: Array<any>;
    sortedData = data.sort((value1, value2) => {
        var value = value1.Name.toUpperCase();
        var valueToCheckWith = value2.Name.toUpperCase();
        if (value < valueToCheckWith) {
            return -1;
        }
        if (value > valueToCheckWith) {
            return 1;
        }
        return 0;
    });
    return sortedData;
}
function extractAboutIncidentDetails(vm: any) {
    if (vm.AboutIncidentDetails.hasOwnProperty('InjuryTypes') &&
        !isNullOrUndefined(vm.AboutIncidentDetails['InjuryTypes'])) {
        let typeNames = Array.from(vm.AboutIncidentDetails['InjuryTypes']).map((ip) => {
            if (ip.hasOwnProperty('Name')) {
                return ip['Name'];
            }
        });
        if (!isNullOrUndefined(typeNames) &&
            typeNames.length > 0) {
            vm.InjuryTypesText = typeNames.join(',');
        } else {
            vm.InjuryTypesText = ' ';
        }
    }
    else {
        vm.InjuryTypesText = null;
    }
    if (vm.AboutIncidentDetails.hasOwnProperty('InjuredParts') &&
        !isNullOrUndefined(vm.AboutIncidentDetails['InjuredParts'])) {
        let partNames = Array.from(vm.AboutIncidentDetails['InjuredParts']).map((ip) => {
            if (ip.hasOwnProperty('Name')) {
                return ip['Name'];
            }
        });
        if (!isNullOrUndefined(partNames) &&
            partNames.length > 0) {
            vm.InjuredPartsText = partNames.join(',');
        } else {
            vm.InjuredPartsText = ' ';
        }
    }
    else {
        vm.InjuredPartsText = null;
    }
}