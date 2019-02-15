export class User {
  id: string;
  firstName: string;
  lastName: string;
  roles: Array<UserRole>;
  points: number;
  photoUrl: string;
  businessCity: string;
  businessState: string;
  country: string;
  email: string;
  auth_token: string;
  location: string;
}

export enum UserRole {
  Administrator = "admin",
  Moderator = "moderator",
  Delete = "delete",
  Readonly = "readonly",
  Editor = "editor",
  User = "user"
}

export class AssociateUser {
  firstName: string;
  fullname: string;
  lastName: string;
  points: number;
  photoUrl: string;
  businessCity: string;
  businessState: string;
  roles: Array<UserRole>;
  email: string;
  id: string;
  location: string;
  country: string;
}

export class AADUser {
  oid: string;
  token: string;
  username: string;
  name: string;
  exp: number;
  roles: Array<UserRole>;
}

export class Preferences {
  emailPreferenceId: number;
  categoriesEnabled: boolean;
  propertiesEnabled: boolean;
  locationsEnabled: boolean;
  associatesEnabled: boolean;
  sendImmediate: boolean;
  sendSummary: number;
  notificationsEnabled: boolean;
  emailPreferenceAssociates: Array<any>;
  emailPreferenceLocations: Array<any>;
  emailPreferenceProperties: Array<any>;
  emailPreferenceCategories: Array<any>;
}
