import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { TimeAgoPipe } from "time-ago-pipe";

import { MaterialModule } from "../material.module";
import { SharedModule } from "../shared.module";
import { AdminLayoutComponent } from "./admin-layout/admin-layout.component";
import { AdminMenuComponent } from "./admin-menu/admin-menu.component";
import { FabButtonComponent } from "./fab-button/fab-button.component";
import { SmdFabSpeedDialModule } from "./fab-button/speed-dial/speed-dial";
import { FilterBookmarksComponent } from "./filter-bookmarks/filter-bookmarks.component";
import { HeaderComponent } from "./header/header.component";
import { SearchComponent } from "./header/search/search.component";
import { LayoutComponent } from "./layout.component";
import { ManageFoldersComponent } from "./manage-folders/manage-folders.component";
import { MenuComponent } from "./menu/menu.component";
import { MyBookmarksComponent } from "./my-bookmarks/my-bookmarks.component";
import { MyPreferencesComponent } from "./my-preferences/my-preferences.component";
import { NotfoundComponent } from "./notfound/notfound.component";
import { RecentNotificationComponent } from "./recent-notification/recent-notification.component";
import { RightPanelComponent } from "./right-panel/right-panel.component";
import { SnackbarComponent } from "./snackbar/snackbar.component";

const LayoutComponents = [
  AdminLayoutComponent,
  AdminMenuComponent,
  LayoutComponent,
  RightPanelComponent,
  MenuComponent,
  HeaderComponent,
  SearchComponent,
  FabButtonComponent,
  SnackbarComponent,
  RecentNotificationComponent,
  TimeAgoPipe,
  MyBookmarksComponent,
  NotfoundComponent,
  MyPreferencesComponent,
  ManageFoldersComponent,
  FilterBookmarksComponent
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    FormsModule,
    SmdFabSpeedDialModule,
    SharedModule,
    ReactiveFormsModule
  ],
  declarations: [...LayoutComponents],
  exports: [...LayoutComponents],
  entryComponents: [SnackbarComponent]
})
export class LayoutModule {}
