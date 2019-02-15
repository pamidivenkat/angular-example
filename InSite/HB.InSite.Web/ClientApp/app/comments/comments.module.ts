import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { MaterialModule } from "../shared/material.module";
import { SharedModule } from "../shared/shared.module";
import { AddCommentComponent } from "./add-comment/add-comment.component";
import { ViewCommentComponent } from "./view-comment/view-comment.component";

const CommentsComponents = [ViewCommentComponent, AddCommentComponent];

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [...CommentsComponents],
  exports: [...CommentsComponents]
})
export class CommentsModule {}
