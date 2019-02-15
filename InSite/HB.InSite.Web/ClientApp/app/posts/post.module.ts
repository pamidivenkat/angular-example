import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgxGalleryModule } from "ngx-gallery";
import { QuillModule } from "ngx-quill";

import { CommentsModule } from "../comments/comments.module";
import { MaterialModule } from "../shared/material.module";
import { SharedModule } from "../shared/shared.module";
import { AddAnswerComponent } from "./add-answer/add-answer.component";
import { AddUpdatePostComponent } from "./add-update-post/add-update-post.component";
import { AddUpdateReplyComponent } from "./add-update-reply/add-update-reply.component";
import { AddUpdateReviewComponent } from "./add-update-review/add-update-review.component";
import { AnswerComponent } from "./answer/answer.component";
import { MyAnswerComponent } from "./my-answer/my-answer.component";
import { MyExpirationContentComponent } from "./my-expiration-content/my-expiration-content.component";
import { MyPostsComponent } from "./my-posts/my-posts.component";
import { MyReviewComponent } from "./my-reviews/my-reviews.component";
import { PostFullViewComponent } from "./post-full-view/post-full-view.component";
import { PostReviewRequestComponent } from "./post-review-request/post-review-request.component";
import { PostsComponent } from "./posts.component";

const postComponents = [
  AddUpdatePostComponent,
  AddUpdateReviewComponent,
  PostFullViewComponent,
  PostsComponent,
  PostReviewRequestComponent,
  MyPostsComponent,
  MyReviewComponent,
  AnswerComponent,
  MyAnswerComponent,
  AddAnswerComponent,
  AddUpdateReplyComponent,
  MyExpirationContentComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule,
    RouterModule,
    CommentsModule,
    QuillModule,
    NgxGalleryModule
  ],
  declarations: [...postComponents],
  exports: [...postComponents]
})
export class PostModule {}
