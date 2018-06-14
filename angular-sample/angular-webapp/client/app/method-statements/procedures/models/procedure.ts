import { ProcedureGroup } from './../../../shared/models/proceduregroup';

export class Procedure {
    public Id: string;
    public Name: string;
    public Description: string;
    public IsExample: boolean;
    public ProcedureGroupId: string;
    public ProcedureGroupName: string;
    public ProcedureGroup: ProcedureGroup;
    public OrderIndex: number;
    public CompanyId: string;
    public IsSelected: boolean;

    constructor() {
        this.Id = '';
        this.Name = '';
        this.Description = null;
        this.IsExample = false;
        this.ProcedureGroupId = '';
        this.ProcedureGroupName = '';
        this.ProcedureGroup = null;
        this.OrderIndex = null;
        this.CompanyId = '';
        this.IsSelected = false;
    }
}
