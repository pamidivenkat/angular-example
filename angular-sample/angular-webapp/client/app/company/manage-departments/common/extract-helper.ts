import { Response } from '@angular/http';
import { DepartmentModel, DepartmentEntity } from '../models/department.model';
import { isNullOrUndefined } from 'util';
import { DepartmentType } from '../models/department-type.enum';
import { StringHelper } from '../../../shared/helpers/string-helper';
import * as Immutable from 'immutable';
import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { EmployeeMetadata } from '../models/employee-metadata.model';
import { ObjectHelper } from '../../../shared/helpers/object-helper';
import { EmployeeBasicInfoModel } from '../models/employee-basic-info.model';
import { Gender } from '../../../employee/common/gender.enum';
import { SalutationCode } from '../../../employee/common/salutationcode.enum';
import { AeOrgChartNodeType } from '../../../atlas-elements/common/models/ae-org-chart-node-model';

export function extractDepartmentsFromResponse(response: Response): {
    departments: Array<DepartmentModel>,
    entities: Array<DepartmentEntity>
} {
    let departments: Array<DepartmentModel> = [];
    let deptEntities: Array<DepartmentEntity> = [];
    let body = response.json();
    if (!isNullOrUndefined(body)) {
        let company = new DepartmentModel();
        company.Id = body['Id'];
        company.Name = body['Name'];
        company.Type = AeOrgChartNodeType.Company;
        departments.push(company);
        deptEntities = prepareDepartmentEntities(body.Departments);
        let depts = prepareDepartments(body.Departments);
        departments = departments.concat(depts);
    }
    return {
        departments: departments,
        entities: deptEntities
    };
}

export function prepareDepartments(departmentList: any) {
    let departments: Array<DepartmentModel> = [];
    if (!isNullOrUndefined(departmentList)) {
        Array.from(departmentList).forEach((item, index) => {
            let department = extractDepartmentModel(item);

            if (!isNullOrUndefined(item['Departments']) &&
                Array.from(item['Departments']).length > 0) {
                departments.push(...prepareDepartments(Array.from(item['Departments'])));
            }
            departments.push(department);
        });
    }
    return departments;
}

export function prepareDepartmentEntities(departmentList: any) {
    let departments: Array<DepartmentEntity> = [];
    if (!isNullOrUndefined(departmentList)) {
        Array.from(departmentList).forEach((item, index) => {
            let resp = new Response(Object.create({ body: item, status: 200 }));
            let department = extractDepartmentEntity(resp);

            if (!isNullOrUndefined(item['Departments']) &&
                Array.from(item['Departments']).length > 0) {
                departments.push(...prepareDepartmentEntities(Array.from(item['Departments'])));
            }
            departments.push(department);
        });
    }
    return departments;
}

export function mapDepartmentsToAeSelectItems(departments: Array<DepartmentModel>): Immutable.List<AeSelectItem<string>> {
    let departmentsMap: Array<AeSelectItem<string>> = [];

    departmentsMap = departmentsMap.concat(departments.filter(d => d.Type === AeOrgChartNodeType.Department || d.Type === AeOrgChartNodeType.Team)
        .map((item) => new AeSelectItem<string>(item.Name, item.Id, false))
        .sort((a, b) => a.Text.localeCompare(b.Text)));

    return Immutable.List(departmentsMap);
}

export function extractEmployees(response: Response): Array<EmployeeMetadata> {
    let employees: Array<EmployeeMetadata> = [];
    let body = response.json();
    if (!isNullOrUndefined(body)) {
        Array.from(body).forEach((item) => {
            let employee = new EmployeeMetadata();
            item['Name'] = ((<string>(item['FirstName'] || '')).trim() + ' ' + (<string>(item['Surname'] || '')).trim()).trim();
            employee = ObjectHelper.extract(item, employee);
            employees.push(employee);
        });
    }
    return employees;
}

export function groupEmployeesByDepartment(employees: Array<EmployeeMetadata>): Map<string, Array<EmployeeMetadata>> {
    let employeesByDepartment = new Map<string, Array<EmployeeMetadata>>();
    if (!isNullOrUndefined(employees)) {
        let groupedResult = employees.reduce((prev, curr, index) => {
            prev[curr.DepartmentId] = prev[curr.DepartmentId] || [];
            prev[curr.DepartmentId].push(curr);
            return prev;
        }, {});
        for (let key in groupedResult) {
            if (groupedResult.hasOwnProperty(key)) {
                employeesByDepartment.set((key == 'null' ? 'none' : key), groupedResult[key]);
            }
        }
    }
    return employeesByDepartment;
}

export function extractDepartmentEntity(response: Response): DepartmentEntity {
    let department: DepartmentEntity = new DepartmentEntity();
    let body = response.json();
    if (!isNullOrUndefined(body)) {
        department = ObjectHelper.extract(body, department);
    }
    return department;
}

export function extractDepartmentModel(item): DepartmentModel {
    let department = new DepartmentModel();
    department.Id = item['Id'];
    department.Name = item['Name'];
    department.ManagerId = item['ManagerId'];
    department.SectorId = item['SectorId'];
    department.ParentId = item['ParentId'];
    if (!isNullOrUndefined(item['Sector'])) {
        department.SectorName = item['Sector']['Name'];
    } else {
        department.SectorName = null;
    }
    let departmentType = <string>item['Type'];
    if (!StringHelper.isNullOrUndefinedOrEmpty(departmentType)) {
        if (departmentType.toLowerCase() === 'department') {
            department.Type = AeOrgChartNodeType.Department;
        } else if (departmentType.toLowerCase() === 'team') {
            department.Type = AeOrgChartNodeType.Team;
        }
    }
    return department;
}

export function mapDepartmentEntity(model: DepartmentModel, entity: DepartmentEntity): DepartmentEntity {
    entity.Name = model.Name;
    entity.ParentId = model.ParentId;
    entity.ManagerId = StringHelper.isNullOrUndefinedOrEmpty(model.ManagerId) ?
        null :
        model.ManagerId;
    entity.Type = DepartmentType[model.Type].toString();
    return entity;
}

export function mapEmployeeBasicInfo(response: Response): EmployeeBasicInfoModel {
    let model: EmployeeBasicInfoModel = new EmployeeBasicInfoModel();
    model = ObjectHelper.extract(response.json(), model);
    model.GenderText = Gender[model.Gender];
    model.Salutation = SalutationCode[parseInt(model.Title, 10)];
    model.FullName = `${(model.FirstName || '').trim()} ${(model.Surname || '').trim()}`;
    model.Age = calculateAge(model.DOB);
    return model;
}

export function calculateAge(dob: Date): string {
    dob = new Date(dob);
    if (dob < new Date() && dob.getFullYear() >= 1850) {
        let currentDate = new Date();
        let years = (currentDate.getMonth() < dob.getMonth()) ?
            currentDate.getFullYear() - dob.getFullYear() - 1
            : currentDate.getFullYear() - dob.getFullYear();
        let months = (currentDate.getMonth() < dob.getMonth()) ?
            12 - (dob.getMonth() - currentDate.getMonth())
            : currentDate.getMonth() - dob.getMonth();
        let newMonthsCount = (currentDate.getDate() < dob.getDate()) ? months - 1 : months;
        years = newMonthsCount < 0 ? years - 1 : years;
        return `${years} year(s)`;
    }
    return '0 years';
}
