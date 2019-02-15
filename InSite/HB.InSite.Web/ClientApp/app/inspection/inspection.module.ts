import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { MaterialModule } from "../shared/material.module";
import { SharedModule } from "../shared/shared.module";
import { InspectionComponent } from "./inspection.component";
import { RouterModule } from "@angular/router";

const inspectionComponents = [InspectionComponent];

@NgModule({
  imports: [CommonModule, MaterialModule, SharedModule, RouterModule],
  declarations: [...inspectionComponents],
  exports: [...inspectionComponents]
})
export class InspectionModule {}
