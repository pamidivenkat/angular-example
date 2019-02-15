import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialogModule } from "@angular/material";
import { RouterModule } from "@angular/router";
import { NgxGalleryModule } from "ngx-gallery";

import { CoreModule } from "../core/core.module";
import { AutoSuggestComponent } from "./components/auto-suggest/auto-suggest.component";
import { BookmarkFoldersComponent } from "./components/bookmark-folders/bookmark-folders.component";
import { BookmarkComponent } from "./components/bookmark/bookmark.component";
import { ModelDialogComponent } from "./components/model-dialog/model-dialog.component";
import { NotificationComponent } from "./components/notification/notification.component";
import { PageCardHeaderComponent } from "./components/page-card-header/page-card-header.component";
import { PostAvatarComponent } from "./components/post-avatar/post-avatar.component";
import { PostMiniComponent } from "./components/post-mini/post-mini.component";
import { PostComponent } from "./components/post/post.component";
import { PosttypeFilterComponent } from "./components/posttype-filter/posttype-filter.component";
import { RateComponent } from "./components/rate/rate.component";
import { RatingComponent } from "./components/rating/rating.component";
import { UserAvatarComponent } from "./components/user-avatar/user-avatar.component";
import { VendorAdsComponent } from "./components/vendor-ads/vendor-ads.component";
import { ScrollTrackerDirective } from "./directives/scroll-tracker.directive";
import { MaterialModule } from "./material.module";
import { HtmlPipe, PriceRangePipe, RemoveAllTagsPipe, RemoveHtmlTagsPipe } from "./pipes/html.pipe";
import { PostTypeColorPipe, PostTypeIconPipe, PostTypePipe } from "./pipes/post-type.pipe/post-type.pipe";
import { NativeScriptInterfaceService } from "./services/native-script-interface.service";
import { ViewFoldersComponent } from "./view-folders/view-folders.component";

export function windowFactory() {
  return <any>window;
}
const SharedComponents = [
  NotificationComponent,
  RatingComponent,
  UserAvatarComponent,
  ModelDialogComponent,
  VendorAdsComponent,
  BookmarkComponent,
  ScrollTrackerDirective,
  PostMiniComponent,
  PostTypePipe,
  PostTypeIconPipe,
  PageCardHeaderComponent,
  PostAvatarComponent,
  PostTypeColorPipe,
  HtmlPipe,
  AutoSuggestComponent,
  BookmarkFoldersComponent,
  PostComponent,
  ViewFoldersComponent,
  PosttypeFilterComponent,
  RemoveHtmlTagsPipe,
  RemoveAllTagsPipe,
  RateComponent,
  PriceRangePipe
];

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    MaterialModule,
    MatDialogModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    NgxGalleryModule
  ],
  declarations: [...SharedComponents],
  exports: [...SharedComponents, MaterialModule],
  entryComponents: [ModelDialogComponent],
  providers: [NativeScriptInterfaceService, PostTypePipe, { provide: "window", useFactory: windowFactory }]
})
export class SharedModule {}
