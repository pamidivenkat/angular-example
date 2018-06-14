export class EmployeeFilterModel {
    Name: string;
    Site: string;
    Department: string;

    constructor() {
        this.Name = '';
        this.Department = 'none';
        this.Site = '';
    }
}
