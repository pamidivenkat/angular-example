import { dispatch } from "@angular-redux/store";
import { Injectable } from "@angular/core";
import { FluxStandardAction } from "flux-standard-action";

import { ISettingsState } from "../reducers/settings.reducer";

const SETTINGS_PREFIX = "[SETTINGS]";
type Payload = ISettingsState;
export type SettingsAction = FluxStandardAction<Payload>;

@Injectable()
export class SettingsActions {
  static readonly SETTING_INITIALIZE = `${SETTINGS_PREFIX}INITIALIZE`;
  static readonly SETTINGS_LOAD = `${SETTINGS_PREFIX}LOAD`;

  @dispatch()
  public initSettings = (): SettingsAction => ({
    type: SettingsActions.SETTING_INITIALIZE,
    meta: null,
    payload: null
  });

  @dispatch()
  public settingsLoad = (payload): SettingsAction => ({
    type: SettingsActions.SETTINGS_LOAD,
    meta: null,
    payload: {
      values: payload
    }
  });
}
