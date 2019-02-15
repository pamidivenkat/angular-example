import { dispatch } from "@angular-redux/store";
import { Injectable } from "@angular/core";
import { FluxStandardAction } from "flux-standard-action";

import { AADUser } from "../../models/user";
import { IIdentityState } from "../reducers/identity.reducer";

import User = adal.User;

// Flux-standard-action gives us stronger typing of our actions.
type Payload = IIdentityState;

export type IdentityAction = FluxStandardAction<Payload>;

const IDENTITY_PREFIX = "[IDENTITY] ";

@Injectable()
export class IdentityActions {
  static readonly IDENTITY_INITIALIZE = `${IDENTITY_PREFIX}INITIALIZE`;
  static readonly IDENTITY_ACCESS_TOKEN_EXPIRED = `${IDENTITY_PREFIX}ACCESS_TOKEN_EXPIRED`;
  static readonly IDENTITY_ACCESS_TOKEN_EXTEND = `${IDENTITY_PREFIX}ACCESS_TOKEN_EXTEND`;
  static readonly IDENTITY_USER_LOADED = `${IDENTITY_PREFIX}USER_LOADED`;
  static readonly IDENTITY_ADAL_USER_LOADED = `${IDENTITY_PREFIX}ADAL_USER_LOADED`;
  static readonly IDENTITY_ADAL_USER_UNLOADED = `${IDENTITY_PREFIX}ADAL_USER_UNLOADED`;
  static readonly IDENTITY_USER_UNLOAD = `${IDENTITY_PREFIX}USER_UNLOADED`;
  static readonly IDENTITY_USER_RESET = `${IDENTITY_PREFIX}USER_RESET`;
  static readonly IDENTITY_USER_FOLDERS_INIT = `${IDENTITY_PREFIX}USER_FOLDER_INIT`;
  static readonly IDENTITY_USER_FOLDERS_LOAD = `${IDENTITY_PREFIX}USER_FOLDER_LOAD`;
  static readonly IDENTITY_USER_BOOKMARKS_INIT = `${IDENTITY_PREFIX}USER_BOOKMARKS_INIT`;
  static readonly IDENTITY_USER_BOOKMARKS_LOAD = `${IDENTITY_PREFIX}USER_BOOKMARKS_LOAD`;
  static readonly IDENTITY_USER_LAST_READ = `${IDENTITY_PREFIX}USER_CLEAR_TIME`;
  static readonly IDENTITY_USER_EXP_COUNT = `${IDENTITY_PREFIX}USER_EXP_COUNT`;
  static readonly IDENTITY_USER_NOTIFY_COUNT = `${IDENTITY_PREFIX}USER_NOTIFY_COUNT`;

  @dispatch()
  public initIdentity = (): IdentityAction => ({
    type: IdentityActions.IDENTITY_INITIALIZE,
    meta: null,
    payload: null
  });

  public resetIdentity = (): IdentityAction => ({
    type: IdentityActions.IDENTITY_USER_RESET,
    meta: null,
    payload: null
  });

  public unloadUserIdentity = (): IdentityAction => ({
    type: IdentityActions.IDENTITY_USER_UNLOAD,
    meta: null,
    payload: null
  });

  @dispatch()
  public loadUserIdentity = (payload): IdentityAction => ({
    type: IdentityActions.IDENTITY_USER_LOADED,
    meta: null,
    payload: {
      user: payload,
      id: payload.id
    }
  });

  @dispatch()
  public loginAdalUserIdentity = (payload: User): IdentityAction => ({
    type: IdentityActions.IDENTITY_ADAL_USER_LOADED,
    meta: null,
    payload: {
      adalUser: payload
    }
  });

  public loadAdalUserIdentity = (payload: User): IdentityAction => ({
    type: IdentityActions.IDENTITY_ADAL_USER_LOADED,
    meta: null,
    payload: {
      adalUser: payload
    }
  });

  public unloadAdalUserIdentity = (): IdentityAction => ({
    type: IdentityActions.IDENTITY_ADAL_USER_UNLOADED,
    meta: null,
    payload: null
  });

  @dispatch()
  public loginUserIdentity = (payload: AADUser): IdentityAction => ({
    type: IdentityActions.IDENTITY_USER_LOADED,
    meta: null,
    payload: {
      user: payload,
      id: null
    }
  });

  @dispatch()
  public logoutUserIdentity = (): IdentityAction => ({
    type: IdentityActions.IDENTITY_USER_UNLOAD,
    meta: null,
    payload: null
  });

  @dispatch()
  public userFoldersInit = (userId: string): IdentityAction => ({
    type: IdentityActions.IDENTITY_USER_FOLDERS_INIT,
    meta: null,
    payload: {
      id: userId
    }
  });

  @dispatch()
  public userFoldersLoad = (payload: any, id: string): IdentityAction => ({
    type: IdentityActions.IDENTITY_USER_FOLDERS_LOAD,
    meta: null,
    payload: {
      userFolders: payload,
      id: id
    }
  });

  @dispatch()
  public userBookmarksInit = (userId: string): IdentityAction => ({
    type: IdentityActions.IDENTITY_USER_BOOKMARKS_INIT,
    meta: null,
    payload: {
      id: userId
    }
  });

  @dispatch()
  public userBookmarksLoad = (payload: Array<any>): IdentityAction => ({
    type: IdentityActions.IDENTITY_USER_BOOKMARKS_LOAD,
    meta: null,
    payload: {
      bookmarks: payload
    }
  });

  @dispatch()
  public userLastRead = (payload: Date): IdentityAction => ({
    type: IdentityActions.IDENTITY_USER_LAST_READ,
    meta: null,
    payload: {
      lastRead: payload
    }
  });

  @dispatch()
  public userExpCount = (count: number): IdentityAction => ({
    type: IdentityActions.IDENTITY_USER_EXP_COUNT,
    meta: null,
    payload: {
      expiringCount: count
    }
  });

  @dispatch()
  public userNotifyCount = (count: number): IdentityAction => ({
    type: IdentityActions.IDENTITY_USER_NOTIFY_COUNT,
    meta: null,
    payload: {
      notifyCount: count
    }
  });
}
