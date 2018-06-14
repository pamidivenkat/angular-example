import { CalendarEntityType } from '../common/calendar-entitytype.enum';
import { subDays, subMonths, subWeeks, addDays, addWeeks, addMonths } from "date-fns";

export class Site {
    Id: string;
    SiteNameAndPostcode: string;
    IsActive: boolean;
    Name:string;
}

export class Department {
    Id: string;
    Name: string;
}

export class Employee {
    Id: string;
    FirstName: string;
    SurName: string;
    IsLeaver: boolean;
    DepartmentId: string;
    Fullname: string;
}
export class CalendarEmployee {
    Id: string;
    FirstName: string;
    SurName: string;
    IsLeaver: boolean;
    DepartmentId: string;
    Fullname: string;
    DepartmentName : string;
    SiteName : string;
    SiteId : string;

}
export class CalendarEntityModel {
    constructor() {
        this.CalendarEntities = [];
    }
    CalendarEntities: CalendarEntityTypeModel[];

}

export class CalendarEntityTypeModel {
    CalendarEntityType: CalendarEntityType;
    Filters: any;
    Fields: string;
}

export class DateRangeFilter {
    constructor() {

    }
    start: Date;
    end: Date;
}


