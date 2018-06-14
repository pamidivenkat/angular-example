import { UserPermission } from './user-permissions-view-vm';
export interface UserPermissionsGroup {
    Id: string,
    Name: string,
    Permissions:Array<UserPermission>
}
