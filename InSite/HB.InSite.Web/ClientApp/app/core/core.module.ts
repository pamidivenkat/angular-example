import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { PostResolver } from "./resolvers/post.resolver";
import { ReviewResolver } from "./resolvers/review.resolver";
import { PropertyResolver } from "./resolvers/property.resolver";
import { AnswerService } from "./services/answer.service";
import { AuthenticationService } from "./services/authentication.service";
import { AuthGuardService } from "./services/authguard.service";
import { BookmarkService } from "./services/bookmark.service";
import { CategoryService } from "./services/category.service";
import { CommentService } from "./services/comment.service";
import { DataService } from "./services/data.service";
import { NotificationService } from "./services/notification.service";
import { PostService } from "./services/post.service";
import { PropertyService } from "./services/property.service";
import { SettingsService } from "./services/settings.service";
import { SnackbarService } from "./services/snackbar.service";
import { ReviewService } from "./services/review.service";

const CoreProviders = [
  SnackbarService,
  DataService,
  AuthGuardService,
  AuthenticationService,
  PostService,
  ReviewService,
  CategoryService,
  CommentService,
  BookmarkService,
  PostResolver,
  ReviewResolver,
  PropertyResolver,
  PropertyService,
  NotificationService,
  SettingsService,
  AnswerService
];

@NgModule({
  imports: [CommonModule],
  providers: [...CoreProviders]
})
export class CoreModule {}
