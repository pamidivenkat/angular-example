import "hammerjs";

import { DecimalPipe } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { APP_INITIALIZER, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { LoadingBarRouterModule } from "@ngx-loading-bar/router";
import { AdalService } from "adal-angular4";

import { AdminModule } from "./admin/admin.module";
import { AppComponent } from "./app.component";
import { routes } from "./app.routes";
import { AppConfigService } from "./appConfig.service";
import { AuthCallbackComponent } from "./auth-callback/auth-callback.component";
import { CommentsModule } from "./comments/comments.module";
import { ContainerComponent } from "./container/container.component";
import { CoreModule } from "./core/core.module";
import { ReduxModule } from "./core/redux/redux.module";
import { InspectionModule } from "./inspection/inspection.module";
import { LoginComponent } from "./login/login.component";
import { PostModule } from "./posts/post.module";
import { PromotionComponent } from "./promotion/promotion.component";
import { VenueModule } from "./property/property.module";
import { ReviewModule } from "./review/review.module";
import { SearchResultsComponent } from "./search-results/search-results.component";
import { LayoutModule } from "./shared/layout/layout.module";
import { MaterialModule } from "./shared/material.module";
import { SharedModule } from "./shared/shared.module";
import { UserModule } from "./user/user.module";

export function configServiceFactory(config: AppConfigService) {
  // Do initing of services that is required before app loads
  // NOTE: this factory needs to return a function (that then returns a promise)
  return () => config.load(); // + any other services...
}

@NgModule({
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes, {
      enableTracing: false,
      onSameUrlNavigation: "reload",
      anchorScrolling: "enabled"
    }),
    MaterialModule,
    CoreModule,
    ReduxModule,
    LayoutModule,
    SharedModule,
    CommentsModule,
    PostModule,
    VenueModule,
    LoadingBarRouterModule,
    UserModule,
    AdminModule,
    InspectionModule,
    ReviewModule
  ],
  declarations: [
    AppComponent,
    ContainerComponent,
    LoginComponent,
    SearchResultsComponent,
    AuthCallbackComponent,
    PromotionComponent
  ],
  providers: [
    AppConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: configServiceFactory,
      deps: [AppConfigService],
      multi: true
    },
    AdalService,
    DecimalPipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
