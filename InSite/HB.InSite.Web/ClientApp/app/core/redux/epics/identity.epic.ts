import { HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AdalService } from "adal-angular4";
import { ActionsObservable, createEpicMiddleware } from "redux-observable";
import { of } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";

import { AADUser } from "../../models/user";
import { AuthenticationService } from "../../services/authentication.service";
import { BookmarkService } from "../../services/bookmark.service";
import { SnackbarService } from "../../services/snackbar.service";
import { UserService } from "../../services/user.service";
import { IdentityAction, IdentityActions } from "../actions/identity.actions";
import { SettingsActions } from "../actions/settings.actions";

@Injectable()
export class IdentityEpics {
  private _aadUser: AADUser;

  constructor(
    private _service: AuthenticationService,
    private _actions: IdentityActions,
    private _router: Router,
    private _settingsActions: SettingsActions,
    private _bookmarkService: BookmarkService,
    private _snackbar: SnackbarService,
    private _adal: AdalService,
    private _userService: UserService
  ) {}

  public createEpic() {
    return [
      createEpicMiddleware(this.identityAdalLoad$),
      createEpicMiddleware(this.identityLoad$),
      createEpicMiddleware(this.identityUnload$),
      createEpicMiddleware(this.initBookmarkFolders$),
      createEpicMiddleware(this.initBookmarks$)
    ];
  }

  identityAdalLoad$ = (action$: ActionsObservable<IdentityAction>) =>
    action$.ofType(IdentityActions.IDENTITY_INITIALIZE).pipe(
      switchMap(() => this._adal.getUser()),
      map(u => (u ? this._actions.loadAdalUserIdentity(u) : this._actions.unloadAdalUserIdentity()))
    );

  identityLoad$ = (action$: ActionsObservable<IdentityAction>) =>
    action$.ofType(IdentityActions.IDENTITY_ADAL_USER_LOADED).pipe(
      map(action => {
        const user = action.payload.adalUser;
        this._aadUser = new AADUser();
        if (user && user.profile) {
          this._aadUser.oid = user.profile.oid;
          this._aadUser.exp = user.profile.exp - new Date().getTime();
          this._aadUser.name = user.profile.name;
          this._aadUser.token = user.token;
          this._aadUser.username = user.userName;
          this._aadUser.roles = user.profile.roles;
          return user.profile.oid;
        } else {
          console.log("user profile not found");
        }
      }),
      switchMap(oid => this._userService.getUserById(oid)),
      switchMap(user => {
        if (user instanceof HttpErrorResponse) {
          return this._userService.createAspNetUser(this._aadUser.username, this._aadUser.oid);
        } else {
          return of(user);
        }
      }),
      map(user => {
        user.roles = user.roles;
        user.auth_token = this._adal.userInfo.token;
        user.id = this._aadUser.oid;
        this._settingsActions.initSettings();
        this._actions.userFoldersInit(user.id);
        this._actions.userBookmarksInit(user.id);
        return this._actions.loadUserIdentity(user);
      }),
      tap(user => {
        if (user.payload.user && (<any>user.payload.user).error) {
          this._snackbar.error((<any>user.payload.user).error + "");
          this._actions.logoutUserIdentity();
        } else {
          user && localStorage.setItem("currentUser", JSON.stringify(user));
        }
      })
    );

  identityUnload$ = (action$: ActionsObservable<IdentityAction>) =>
    action$.ofType(IdentityActions.IDENTITY_USER_UNLOAD).pipe(
      map(() => {
        this._service.logout();
        return this._actions.resetIdentity();
      })
      // tap(() => this._router.navigate(["signin"]))
    );

  initBookmarkFolders$ = (action$: ActionsObservable<IdentityAction>) =>
    action$.ofType(IdentityActions.IDENTITY_USER_FOLDERS_INIT).pipe(
      switchMap(payload => {
        return this._bookmarkService.getFolders(payload.payload.id).pipe(
          map(data => {
            let folders = [];
            folders.push({
              id: 0,
              name: "Bookmarks",
              parentId: null
            });
            if (data && !(data instanceof HttpErrorResponse)) {
              data.map(folder => {
                folders.push({
                  id: folder.id,
                  name: folder.name,
                  parentId: folder.parentId
                });
              });
            }
            return this._actions.userFoldersLoad(folders, payload.payload.id);
          })
        );
      })
    );

  initBookmarks$ = (action$: ActionsObservable<IdentityAction>) =>
    action$.ofType(IdentityActions.IDENTITY_USER_BOOKMARKS_INIT).pipe(
      switchMap(payload => {
        return this._bookmarkService.getBookmarks(payload.payload.id);
      }),
      map(data => {
        const bookmarks = data instanceof HttpErrorResponse ? [] : data;

        return this._actions.userBookmarksLoad(bookmarks);
      })
    );
}
