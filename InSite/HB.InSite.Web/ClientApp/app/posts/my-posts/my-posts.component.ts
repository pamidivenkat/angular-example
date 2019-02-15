import { select } from "@angular-redux/store";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { LoadingBarService } from "@ngx-loading-bar/core";
import { Observable } from "rxjs";
import { distinctUntilChanged, takeUntil } from "rxjs/operators";

import { PostType } from "../../core/models/post";
import { User } from "../../core/models/user";
import { LayoutActions } from "../../core/redux/actions/layout.actions";
import { PostService } from "../../core/services/post.service";
import { ReviewService } from "../../core/services/review.service";
import { BaseComponent } from "../../shared/base-component";
import { CommonHelpers } from "../../shared/helpers/common-helper";
import { PostTypePipe } from "../../shared/pipes/post-type.pipe/post-type.pipe";
import { InspectionService } from "./../../core/services/inspection.service";

@Component({
  selector: "app-my-posts",
  templateUrl: "./my-posts.component.html",
  styleUrls: ["./my-posts.component.scss"]
})
export class MyPostsComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _posts: Array<any>;
  private _postTypeId: number;
  private _isAnswerPage: boolean;
  private _pageTitle: string;
  private _totalCount: number;
  private _maxId: number = 0;
  private _user: User;
  private _isLoading: boolean = false;

  @select(["identity", "user"])
  private _user$: Observable<User>;

  @select(["layout", "isScrollEnd"])
  private _isScrollEnd$: Observable<boolean>;
  // End of Private Fields

  // Public properties
  get posts(): Array<any> {
    return this._posts;
  }
  get postTypeId(): number {
    return this._postTypeId;
  }
  get isAnswerPage(): boolean {
    return this._isAnswerPage;
  }
  get pageTitle(): string {
    return this._pageTitle;
  }
  get isLoading(): boolean {
    return this._isLoading;
  }
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(
    private _route: ActivatedRoute,
    private _postTypePipe: PostTypePipe,
    private _layoutActions: LayoutActions,
    private _postService: PostService,
    private _inspectionService: InspectionService,
    private _reviewService: ReviewService,
    private _loadingBar: LoadingBarService
  ) {
    super();
    this._posts = [];
  }
  // End of constructor

  // Private methods
  private _setData(posts: Observable<any>) {
    posts.subscribe(posts => {
      this._isLoading = false;
      if (posts instanceof HttpErrorResponse || !posts) {
        this._posts = this._posts;
      } else {
        this._posts = this._posts.concat(posts.data);
        this._totalCount = posts.paging.recordCount;
        this._maxId = posts.paging.maxId;
      }
    });
  }
  private _getPosts() {
    this._isLoading = true;
    const options = Object.create({});
    options.maxId = this._maxId;
    options.types = this._postTypeId;
    let dataSubscription: Observable<any>;

    switch (this._postTypeId) {
      case PostType.Review:
        options.includeItems = false;
        dataSubscription = this._reviewService
          .getReviewsByUser(this._user.id, options)
          .pipe(takeUntil(this._destructor$));
        break;
      case PostType.Inspection:
        dataSubscription = this._inspectionService
          .getInspectionsByUser(this._user.id, options)
          .pipe(takeUntil(this._destructor$));
        break;
      case 0:
        this._isAnswerPage = true;
        dataSubscription = this._postService
          .getLatestAnswers(this._user.id, options)
          .pipe(takeUntil(this._destructor$));
        break;
      default:
        dataSubscription = this._postService.getPostsByUser(this._user.id, options).pipe(takeUntil(this._destructor$));
        break;
    }
    this._setData(dataSubscription);
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this._loadingBar.complete();
    this._postTypeId = CommonHelpers.getTypeByName(this._route.routeConfig.path.slice(2));

    this._pageTitle = "My " + this._postTypePipe.transform(this._postTypeId) + "s";

    this._user$.pipe(distinctUntilChanged()).subscribe(user => {
      this._user = user;
      if (user) {
        this._getPosts();
      }
    });

    this._isScrollEnd$.pipe(takeUntil(this._destructor$)).subscribe(scrollEnd => {
      if (scrollEnd) {
        if (this.posts.length < this._totalCount) {
          this._getPosts();
        }
      }
      this._layoutActions.updateScrollEnd(false);
    });
  }

  getMorePosts(scroll) {
    if (scroll.endReached) {
      this._layoutActions.updateScrollEnd(true);
    }
  }
  // End of public methods
}
