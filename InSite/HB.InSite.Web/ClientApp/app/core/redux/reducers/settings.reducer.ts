import { Action } from "redux";

import { SettingsAction, SettingsActions } from "../actions/settings.actions";

export interface ISettingsState {
  values: any;
}

export const INITIAL_STATE: ISettingsState = {
  values: null
};

export function settingsReducer(
  state: ISettingsState = INITIAL_STATE,
  a: Action
): ISettingsState {
  const action = a as SettingsAction;

  switch (action.type) {
    case SettingsActions.SETTING_INITIALIZE:
      return { ...state };
    case SettingsActions.SETTINGS_LOAD:
      return { ...state, ...action.payload };
  }

  return state;
}
