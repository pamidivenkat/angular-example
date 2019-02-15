import { Injectable } from "@angular/core";
import { ActionsObservable, createEpicMiddleware } from "redux-observable";
import { map, switchMap } from "rxjs/operators";

import { SettingsService } from "../../services/settings.service";
import { SettingsAction, SettingsActions } from "../actions/settings.actions";

@Injectable()
export class SettingsEpics {
  constructor(
    private _settingsService: SettingsService,
    private _actions: SettingsActions
  ) {}

  public createEpic() {
    return [createEpicMiddleware(this.loadSettings$)];
  }

  loadSettings$ = (action$: ActionsObservable<SettingsAction>) =>
    action$.ofType(SettingsActions.SETTING_INITIALIZE).pipe(
      switchMap(() =>
        this._settingsService.getSettings().pipe(
          map(result => {
            return this._actions.settingsLoad(result);
          })
        )
      )
    );
}
