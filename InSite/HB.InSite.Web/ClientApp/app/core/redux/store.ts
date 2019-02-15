import { combineReducers, Reducer } from "redux";

import {
  identityReducer,
  IIdentityState,
  INITIAL_STATE as IDENTITY_INIT_STATE
} from "./reducers/identity.reducer";
import {
  ILayoutState,
  INITIAL_STATE as LAYOUT_INIT_STATE,
  layoutReducer
} from "./reducers/layout.reducer";
import {
  INITIAL_STATE as SETTINGS_INIT_STATE,
  ISettingsState,
  settingsReducer
} from "./reducers/settings.reducer";

export interface IAppState {
  identity: IIdentityState;
  layout: ILayoutState;
  settings: ISettingsState;
}

export const INITIAL_STATE: IAppState = {
  identity: IDENTITY_INIT_STATE,
  layout: LAYOUT_INIT_STATE,
  settings: SETTINGS_INIT_STATE
};

export const rootReducer: Reducer<IAppState> = combineReducers({
  identity: identityReducer,
  layout: layoutReducer,
  settings: settingsReducer
});
