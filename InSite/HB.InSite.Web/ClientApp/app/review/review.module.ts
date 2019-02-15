import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgxGalleryModule } from "ngx-gallery";
import { QuillModule } from "ngx-quill";

import { MaterialModule } from "../shared/material.module";
import { SharedModule } from "../shared/shared.module";
import { PostReviewComponent } from "./post-review/post-review.component";
import { ReviewComponent } from "./review/review.component";
import { ThankyouComponent } from "./thankyou/thankyou.component";

const reviewComponents = [ReviewComponent, PostReviewComponent];

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    SharedModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    QuillModule,
    NgxGalleryModule
  ],
  declarations: [...reviewComponents, ThankyouComponent],
  exports: [...reviewComponents]
})
export class ReviewModule {}
