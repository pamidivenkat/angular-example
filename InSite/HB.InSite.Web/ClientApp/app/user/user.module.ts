import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { MaterialModule } from "../shared/material.module";
import { SharedModule } from "../shared/shared.module";
import { ProfileComponent } from "./profile/profile.component";

const userComponents = [ProfileComponent];

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [...userComponents],
  exports: [...userComponents]
})
export class UserModule {}
