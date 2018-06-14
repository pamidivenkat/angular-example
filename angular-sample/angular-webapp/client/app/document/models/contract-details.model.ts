import { EmployeeGroup } from './../../shared/models/company.models';

export class ContractDetails {
    Title: string;
    Version: string;
    ModifiedOn: Date;
    EmployeeGroup: EmployeeGroup;
    constructor() {
        this.Version = "";
        this.Title = "";
        this.ModifiedOn = null;
        this.EmployeeGroup = new EmployeeGroup();
    }
}

export class EmployeeContractDetails {
    Id: string;
    Fullname: string;
    JobTitle: string;
    LatestContractVersion: string;
    DistributionDate: Date;
    AcknowledgementDate: Date;
    HasContract: boolean;
}
