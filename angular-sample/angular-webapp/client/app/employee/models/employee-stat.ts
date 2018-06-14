import { User } from './../../shared/models/user';
export enum EmployeeStatType {
    LastUpdated = 1
}

export class LastUpdated {
    ModifiedOn:Date;
    ModifiedBy:User;

    constructor(){
        this.ModifiedOn = null;
        this.ModifiedBy = null;
    }
}
