import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { DateRangeFilter, Department } from "./calendar-models";
export class CalendarFilterModel {
    Site: AeSelectItem<string>[];
    Department: Department[];
    Employee: AeSelectItem<string>[];
    ShowPending: boolean;
    dateRange: DateRangeFilter
    ExcludeLeavers: boolean;
    constructor() {
        this.Site = [];
        this.Department = [];
        this.Employee = [];
        this.ShowPending = false;
        this.ExcludeLeavers = true;
        this.dateRange = null;
    }
}

export enum TeamCalendarLoadType {
    ChildComponent = 1,
    ChildRoute = 2
}