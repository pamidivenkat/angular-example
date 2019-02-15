import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { MaterialModule } from "../shared/material.module";
import { SharedModule } from "../shared/shared.module";

import { AdminService } from "./services/admin.service";
import { UserRolesComponent, UserRolesResolver } from "./user-roles/user-roles.component";
import { ManageClientReviewsComponent, ManageClientReviewsResolver } from "./manage-client-reviews/manage-client-reviews.component";
import { SynonymsComponent, SynonymsResolver } from "./synonyms/synonyms.component";
import { PointsComponent, PointsResolver } from "./points/points.component";
import { GeneralComponent, GeneralResolver } from "./general/general.component";
import { ExpirationsComponent, ExpirationsResolver } from "./expirations/expirations.component";
import { CategoriesComponent, CategoriesResolver } from "./categories/categories.component";
import { AdvertisementsComponent, AdvertisementsResolver } from "./advertisements/advertisements.component";
import { RouterModule } from "@angular/router";

const adminProviders = [
    AdminService,
    ManageClientReviewsResolver,
    UserRolesResolver,
    ExpirationsResolver,
    PointsResolver,
    SynonymsResolver,
    AdvertisementsResolver,
    CategoriesResolver,
    GeneralResolver
];
const adminComponents = [
    UserRolesComponent,
    ManageClientReviewsComponent,
    ExpirationsComponent,
    PointsComponent,
    SynonymsComponent,
    AdvertisementsComponent,
    CategoriesComponent,
    GeneralComponent
];

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [...adminProviders],
  declarations: [...adminComponents],
  exports: [...adminComponents]
})
export class AdminModule {}
