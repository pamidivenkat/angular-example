export class EmployeeMetadata {
    public Id: string;
    public Name: string;
    public DepartmentId: string;
    public SiteId: string;
    public SiteName: string;
    public JobId: string;
    public IsManager: boolean;

    constructor() {
        this.Id = '';
        this.Name = '';
        this.IsManager = false;
        this.SiteId = '';
        this.SiteName ='';
        this.JobId = '';
        this.DepartmentId = '';
    }
}
