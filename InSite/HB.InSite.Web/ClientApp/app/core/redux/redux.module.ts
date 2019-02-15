import { DevToolsExtension, NgRedux, NgReduxModule } from "@angular-redux/store";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { IdentityActions } from "./actions/identity.actions";
import { LayoutActions } from "./actions/layout.actions";
import { SettingsActions } from "./actions/settings.actions";
import { IdentityEpics } from "./epics/identity.epic";
import { SettingsEpics } from "./epics/settings.epic";
import { IAppState, INITIAL_STATE, rootReducer } from "./store";
import { environment } from "../../../environments/environment";
import { SharedModule } from "../../shared/shared.module";

@NgModule({
  imports: [NgReduxModule, CommonModule, SharedModule],
  providers: [IdentityActions, IdentityEpics, LayoutActions, SettingsActions, SettingsEpics],
  declarations: []
})
export class ReduxModule {
  constructor(
    public store: NgRedux<IAppState>,
    devTools: DevToolsExtension,
    identityEpics: IdentityEpics,
    settingsEpics: SettingsEpics
  ) {
    // Tell @angular-redux/store about our rootReducer and our initial state.
    // It will use this to create a redux store for us and wire up all the
    // events.
    store.configureStore(
      rootReducer,
      INITIAL_STATE,
      [...identityEpics.createEpic(), ...settingsEpics.createEpic()],
      // IF YOU DO NOT HAVE REDUX DEVTOOLS INSTALLED THIS SHOULD BE []
      [] // environment.production ? [] : [devTools.enhancer()]
    );
  }
}
