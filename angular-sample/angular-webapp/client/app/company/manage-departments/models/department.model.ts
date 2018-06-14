import { DepartmentType } from './department-type.enum';
import { AeOrgChartNodeType } from '../../../atlas-elements/common/models/ae-org-chart-node-model';

export class DepartmentModel {
    public Id: string;
    public Name: string;
    public ManagerId: string;
    public Type: AeOrgChartNodeType;
    public SectorId: string;
    public SectorName: string;
    public ParentId: string;
    public ParentDepartmentName: string;
    public Departments: DepartmentModel[]

    constructor() {
        this.Id = '';
        this.Name = '';
        this.ManagerId = '';
        this.Type = null;
        this.SectorId = '';
        this.SectorName = '';
        this.ParentId = '';
        this.Departments = [];
        this.ParentDepartmentName = '';
    }
}

export class DepartmentEntity {
    public Id: string;
    public CompanyId: string;
    public Name: string;
    public ManagerId: string;
    public Type: string;
    public SectorId: string;
    public Sector: any;
    public ParentId: string;
    public OrderIndex: number;
    public CreatedOn: Date;
    public CreatedBy: string;
    public ModifiedOn: Date;
    public ModifiedBy: string;
    public IsDeleted: boolean;
    public Version: string;
    public LCid: number;

    constructor() {
        this.Id = '';
        this.Name = '';
        this.ManagerId = '';
        this.Type = null;
        this.SectorId = '';
        this.Sector = null;
        this.ParentId = '';
        this.CompanyId = '';
        this.OrderIndex = null;
        this.CreatedOn = null;
        this.CreatedBy = '';
        this.ModifiedBy = null;
        this.ModifiedOn = null;
        this.IsDeleted = false;
        this.LCid = null;
        this.Version = null;
    }
}
