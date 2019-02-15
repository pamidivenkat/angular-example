import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { SharedModule } from "../shared/shared.module";
import { PropertyComponent } from "./property.component";
import { ReportsComponent } from "./reports/reports.component";

const propertyComponents = [PropertyComponent, ReportsComponent];

@NgModule({
  imports: [CommonModule, SharedModule, FormsModule, ReactiveFormsModule],
  declarations: [...propertyComponents],
  exports: [...propertyComponents]
})
export class VenueModule {}
