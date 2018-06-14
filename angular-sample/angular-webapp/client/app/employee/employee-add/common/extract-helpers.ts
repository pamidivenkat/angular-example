import { EmployeeFullEntity } from './../../../employee/models/employee-full.model';
import { isNullOrUndefined } from 'util';

export function prepareEmployeeFullEntityForAddEmployee(employeeDetailsFormModel: any): EmployeeFullEntity {
    let employee: EmployeeFullEntity = new EmployeeFullEntity();
    if (!isNullOrUndefined(employeeDetailsFormModel)) {
        Object.keys(employee).forEach((keyName) => {
            if (Object.keys(employeeDetailsFormModel).indexOf(keyName) !== -1) {
                if (keyName === 'Job' && !isNullOrUndefined(employeeDetailsFormModel['Job'])) {
                    employee.Job.Days = employeeDetailsFormModel.Days;
                    employee.Job.DepartmentId = employeeDetailsFormModel.DepartmentId;
                    employee.Job.EmploymentTypeId = employeeDetailsFormModel.EmploymentTypeId;
                    employee.Job.HolidayEntitlement = employeeDetailsFormModel.HolidayEntitlement;
                    employee.Job.HolidayUnitType = employeeDetailsFormModel.HolidayUnitType;
                    employee.Job.HomeBased = employeeDetailsFormModel.HomeBased;
                    employee.Job.HoursAWeek = employeeDetailsFormModel.HoursAWeek;
                    employee.Job.JobTitleId = employeeDetailsFormModel.Job.JobTitleId;
                    employee.Job.OtherEmployeeType = employeeDetailsFormModel.OtherEmployeeType;
                    employee.Job.ProbationaryPeriod = employeeDetailsFormModel.ProbationaryPeriod;
                    employee.Job.SiteId = employeeDetailsFormModel.SiteId;
                    employee.Job.StartDate = employeeDetailsFormModel.StartDate;
                } else
                {
                    employee[keyName] = employeeDetailsFormModel[keyName];
                }
            }
        });     
    }
    return employee;
}