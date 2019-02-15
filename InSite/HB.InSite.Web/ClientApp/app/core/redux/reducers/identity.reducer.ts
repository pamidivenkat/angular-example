import { Action } from "redux";

import { AADUser } from "../../models/user";
import { IdentityAction, IdentityActions } from "../actions/identity.actions";
import User = adal.User;

export interface IIdentityState {
  loaded?: boolean;
  isLoggedIn?: boolean;
  user?: AADUser;
  adalUser?: User;
  error?: any;
  userFolders?: any;
  id?: string;
  bookmarks?: Array<any>;
  lastRead?: Date;
  expiringCount?: number;
  notifyCount?: number;
}

const AdalDefault = {
  authenticated: false,
  userName: "",
  error: "",
  token: "",
  profile: {},
  loginCached: false
};
export const INITIAL_STATE: IIdentityState = {
  loaded: false,
  isLoggedIn: false,
  user: null,
  adalUser: AdalDefault,
  error: null,
  userFolders: null,
  id: null,
  bookmarks: null,
  lastRead: null,
  expiringCount: 0,
  notifyCount: 0
};

// A higher-order reducer: accepts an animal type and returns a reducer
// that only responds to actions for that particular animal type.
export function identityReducer(state: IIdentityState = INITIAL_STATE, a: Action): IIdentityState {
  const action = a as IdentityAction;
  switch (action.type) {
    case IdentityActions.IDENTITY_INITIALIZE:
      return {
        ...state,
        loaded: true
      };
    case IdentityActions.IDENTITY_USER_LOADED:
      return {
        ...state,
        error: null,
        isLoggedIn: true,
        ...action.payload
      };
    case IdentityActions.IDENTITY_ADAL_USER_LOADED:
      return {
        ...state,
        error: null,
        isLoggedIn: true,
        ...action.payload
      };

    case IdentityActions.IDENTITY_ADAL_USER_UNLOADED:
      return {
        ...state,
        error: null,
        adalUser: AdalDefault
      };
    case IdentityActions.IDENTITY_ACCESS_TOKEN_EXPIRED:
    case IdentityActions.IDENTITY_USER_UNLOAD:
      return {
        ...state,
        user: null,
        isLoggedIn: false,
        error: null,
        userFolders: null,
        id: null,
        bookmarks: null,
        lastRead: null,
        expiringCount: 0,
        notifyCount: 0
      };
    case IdentityActions.IDENTITY_USER_FOLDERS_LOAD:
      return {
        ...state,
        error: null,
        ...action.payload
      };
    case IdentityActions.IDENTITY_USER_BOOKMARKS_LOAD:
      return {
        ...state,
        ...action.payload
      };
    case IdentityActions.IDENTITY_USER_LAST_READ:
      return {
        ...state,
        ...action.payload
      };
    case IdentityActions.IDENTITY_USER_EXP_COUNT:
      return {
        ...state,
        ...action.payload
      };
    case IdentityActions.IDENTITY_USER_NOTIFY_COUNT:
      return {
        ...state,
        ...action.payload
      };
  }

  return state;
}
