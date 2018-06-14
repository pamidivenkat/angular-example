import { ContractDetails, EmployeeContractDetails } from "../models/contract-details.model";
import { Response } from '@angular/http';
import { Artifact } from "../models/artifact";
import { isNullOrUndefined } from "util";

export function extractContractDetails(response: Response): Artifact {
    let details = response.json() as Artifact;
    return details;
}

export function extractContractEmployeeDetails(response: Response): EmployeeContractDetails[] {
    let body = response.json();

    let empList: EmployeeContractDetails[] = new Array();
    if (!isNullOrUndefined(body.EmployeeGroup) && !isNullOrUndefined(body.EmployeeGroup.Employees)) {
        body.EmployeeGroup.Employees.forEach(element => {
            let empConData = new EmployeeContractDetails();
            empConData.Fullname = element.FullName;
            empConData.Id = element.Id;
            empConData.HasContract = element.HasContract;
            empConData.JobTitle = isNullOrUndefined(element.Job) ? "" : isNullOrUndefined(element.Job.JobTitle) ? "" : element.Job.JobTitle.Name;
            empConData.DistributionDate = element.EmployeeContractDetails && element.EmployeeContractDetails.DistributionDate != null ? element.EmployeeContractDetails.DistributionDate : "";
            empConData.AcknowledgementDate = element.EmployeeContractDetails && element.EmployeeContractDetails.AcknowledgementDate != null ? element.EmployeeContractDetails.AcknowledgementDate : "";
            empConData.LatestContractVersion = element.EmployeeContractDetails && element.EmployeeContractDetails.LatestContractVersion != null ? element.EmployeeContractDetails.LatestContractVersion : "";
            empList.push(empConData);
        });
    }
    return empList;
}

