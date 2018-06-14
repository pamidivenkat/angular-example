import { CompanySiteView } from "./company-site-view";

export class CompanyStructure {
    Id: string;
    Name: string;
    Children: Array<CompanySiteView>;
    constructor(id: string, name: string, children: Array<CompanySiteView>) {
        this.Id = id;
        this.Name = name;
        this.Children = children;
    }
}