import { Routes } from "@angular/router";

import { AdvertisementsComponent, AdvertisementsResolver } from "./admin/advertisements/advertisements.component";
import { CategoriesComponent, CategoriesResolver } from "./admin/categories/categories.component";
import { ExpirationsComponent, ExpirationsResolver } from "./admin/expirations/expirations.component";
import { GeneralComponent, GeneralResolver } from "./admin/general/general.component";
import {
  ManageClientReviewsComponent,
  ManageClientReviewsResolver
} from "./admin/manage-client-reviews/manage-client-reviews.component";
import { PointsComponent, PointsResolver } from "./admin/points/points.component";
import { SynonymsComponent, SynonymsResolver } from "./admin/synonyms/synonyms.component";
import { UserRolesComponent, UserRolesResolver } from "./admin/user-roles/user-roles.component";
import { AuthCallbackComponent } from "./auth-callback/auth-callback.component";
import { ContainerComponent } from "./container/container.component";
import { PostResolver } from "./core/resolvers/post.resolver";
import { PropertyResolver } from "./core/resolvers/property.resolver";
import { ReviewResolver } from "./core/resolvers/review.resolver";
import { AuthGuardService } from "./core/services/authguard.service";
import { InspectionComponent } from "./inspection/inspection.component";
import { LoginComponent } from "./login/login.component";
import { AddUpdatePostComponent } from "./posts/add-update-post/add-update-post.component";
import { AddUpdateReviewComponent } from "./posts/add-update-review/add-update-review.component";
import { MyExpirationContentComponent } from "./posts/my-expiration-content/my-expiration-content.component";
import { MyPostsComponent } from "./posts/my-posts/my-posts.component";
import { MyReviewComponent } from "./posts/my-reviews/my-reviews.component";
import { PostFullViewComponent } from "./posts/post-full-view/post-full-view.component";
import { PromotionComponent } from "./promotion/promotion.component";
import { PropertyComponent } from "./property/property.component";
import { PostReviewComponent } from "./review/post-review/post-review.component";
import { ReviewComponent } from "./review/review/review.component";
import { SearchResultsComponent } from "./search-results/search-results.component";
import { FilterBookmarksComponent } from "./shared/layout/filter-bookmarks/filter-bookmarks.component";
import { LayoutComponent } from "./shared/layout/layout.component";
import { ManageFoldersComponent } from "./shared/layout/manage-folders/manage-folders.component";
import { MyBookmarksComponent } from "./shared/layout/my-bookmarks/my-bookmarks.component";
import { MyPreferencesComponent } from "./shared/layout/my-preferences/my-preferences.component";
import { NotfoundComponent } from "./shared/layout/notfound/notfound.component";
import { RecentNotificationComponent } from "./shared/layout/recent-notification/recent-notification.component";
import { ProfileComponent } from "./user/profile/profile.component";

export const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    canActivateChild: [AuthGuardService],
    children: [
      { path: "", component: ContainerComponent },
      {
        path: "post/view/:id",
        component: PostFullViewComponent,
        resolve: { postData: PostResolver }
      },
      {
        path: "insight/add",
        component: AddUpdatePostComponent,
        resolve: { data: PropertyResolver }
      },
      {
        path: "question/add",
        component: AddUpdatePostComponent,
        resolve: { data: PropertyResolver }
      },
      {
        path: "review/add",
        component: AddUpdateReviewComponent,
        resolve: { data: PropertyResolver }
      },
      {
        path: "review/update/:id",
        component: AddUpdateReviewComponent,
        resolve: { reviewData: ReviewResolver }
      },
      { path: "postreview/update/:id", component: PostReviewComponent },
      { path: "review/view/:id", component: ReviewComponent },
      {
        path: "post/update/:id",
        component: AddUpdatePostComponent,
        resolve: { postData: PostResolver }
      },
      {
        path: "property/:id",
        component: PropertyComponent,
        resolve: { data: PropertyResolver }
      },
      { path: "notifications", component: RecentNotificationComponent },
      { path: "mybookmarks", component: MyBookmarksComponent },
      { path: "filterbookmarks", component: FilterBookmarksComponent },
      { path: "manage-folders", component: ManageFoldersComponent },
      { path: "search/results/:type/:text", component: SearchResultsComponent },
      { path: "myreviews", component: MyReviewComponent },
      { path: "myquestions", component: MyPostsComponent },
      { path: "myanswers", component: MyPostsComponent },
      { path: "myinsight", component: MyPostsComponent },
      { path: "myinspections", component: MyPostsComponent },
      { path: "myexpiringcontent", component: MyExpirationContentComponent },
      { path: "profile/:id", component: ProfileComponent },
      { path: "inspection/:id", component: InspectionComponent },
      { path: "promotion/:id", component: PromotionComponent },
      { path: "pagenotfound", component: NotfoundComponent },
      { path: "mypreferences", component: MyPreferencesComponent },
      { path: "announcement/:id", component: PromotionComponent }
    ]
  },
  { path: "auth-callback", component: AuthCallbackComponent },
  { path: "signin", component: LoginComponent },
  { path: "signout", component: LoginComponent },
  {
    path: "admin",
    component: LayoutComponent,
    canActivate: [AuthGuardService],
    data: {
      expectedRoles: ["admin"]
    },
    canActivateChild: [AuthGuardService],
    children: [
      {
        path: "",
        redirectTo: "userroles",
        pathMatch: "full"
        //component: UserRolesComponent,
        //resolve: { data: UserRolesResolver }
      },
      {
        path: "clientreviews",
        component: ManageClientReviewsComponent,
        resolve: { data: ManageClientReviewsResolver }
      },
      {
        path: "userroles",
        component: UserRolesComponent,
        resolve: { data: UserRolesResolver }
      },
      {
        path: "expirations",
        component: ExpirationsComponent,
        resolve: { data: ExpirationsResolver }
      },
      {
        path: "points",
        component: PointsComponent,
        resolve: { data: PointsResolver }
      },
      {
        path: "synonyms",
        component: SynonymsComponent,
        resolve: { data: SynonymsResolver }
      },
      {
        path: "advertisements",
        component: AdvertisementsComponent,
        resolve: { data: AdvertisementsResolver }
      },
      {
        path: "categories",
        component: CategoriesComponent,
        resolve: { data: CategoriesResolver }
      },
      {
        path: "general",
        component: GeneralComponent,
        resolve: { data: GeneralResolver }
      }
    ]
  },
  { path: "postreview", component: PostReviewComponent }
];
