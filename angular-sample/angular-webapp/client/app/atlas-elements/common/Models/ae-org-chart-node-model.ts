import * as Immutable from 'immutable';
import { AeTemplateComponent } from '../../ae-template/ae-template.component';
import { Subject } from "rxjs/Rx";
export class AeOrgChartNodeModel<T> {
    NodeType: AeOrgChartNodeType;
    Id: string;
    HeaderText: string;
    BodyTemplate: AeTemplateComponent<any>;
    BodyContext: { Id: string, Value: string, Icon: string, Title: string } | any;
    Details: Immutable.List<{ Id: string, Title: string }>;
    DetailsCount: number;
    Children: Immutable.List<AeOrgChartNodeModel<T>>;
    CssClass: string;
    Actions: Immutable.List<{ Title: string, IconName: string, CssClass: string, command: Subject<any> }>;
    Effects: {
        [key: string]: (context) => any
    };
}

export enum AeOrgChartNodeType {
    Company = 1,
    Department = 2,
    Team = 3,
    Employee = 4
}
