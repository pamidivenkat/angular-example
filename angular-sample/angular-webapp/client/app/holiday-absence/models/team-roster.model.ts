import { MyAbsence } from './holiday-absence.model';
export class TeamRoster {
    EmployeeId: string;
    Name:string;
    Saturday: MyAbsence;
    Sunday: MyAbsence;
    Monday: MyAbsence;
    Tuesday: MyAbsence;
    Wednesday: MyAbsence;
    Thursday: MyAbsence;
    Friday: MyAbsence;
    NonWorkingDays:number[];
}
 