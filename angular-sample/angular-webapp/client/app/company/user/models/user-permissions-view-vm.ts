import { UserProfile } from '../../../shared/models/lookup.models';
export class UserProfilesViewVm {
    UserRoles: Array<string>;
    UserId: string;
    Permissions: Map<string, Array<UserPermission>>;
    UserProfiles: Array<UserProfile>;
    /**
     *
     */
    constructor() {
        this.UserRoles = new Array();
        this.Permissions = new Map();
    }
}
export class UserPermission {
    Name: string;
    Description: string;
    Id: string;
}

