export class IncidentKeyFields {
    PersonReportingTabKeyFields: string[];
    AboutAffectedPartyTabKeyFields: string[];
    RIDDORTabKeyFields: string[];
    AboutIncidentKeyFields: string[];
    constructor() {
        this.PersonReportingTabKeyFields = ['IncidentReportedByUserFullName', 'IncidentReportedByAddressLine1',
            'IncidentReportedByTown', 'IncidentReportedByCountyName', 'IncidentReportedByPostcode'];
        this.AboutAffectedPartyTabKeyFields = ['InjuredPersonInjuredPartyName', 'InjuredPersonName', 'InjuredPersonOccupation', 'InjuredPersonAddressLine1', 'InjuredPersonCounty',
            'InjuredPersonPostcode', 'InjuredPersonGenderText'];
        this.RIDDORTabKeyFields = ['ReportedToMainIndustry', 'ReportedToMainActivity', 'ReportedToSubActivity', 'ReportedToReportedBy', 'ReportedToRIDDORReportedDate', 'ReportedToLocalAuthority', 'ReportedToRIDDORReportedMedium', 'ReportedToMainFactor', 'ReportedToWorkProcess'];
        this.AboutIncidentKeyFields = ['AboutIncidentIncidentTypeId']
    }
}