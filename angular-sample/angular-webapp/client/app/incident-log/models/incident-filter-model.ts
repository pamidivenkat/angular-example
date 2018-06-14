export class IncidentFilterModel {
    public Site: string;
    public Category: string;
    public Year: number;
    public IsRIDDOR: boolean;
    public Status: number;

    constructor() {
        this.Site = '';
        this.Category = '';
        this.Status = null;
        this.IsRIDDOR = false;
        this.Year = null;
    }
}
