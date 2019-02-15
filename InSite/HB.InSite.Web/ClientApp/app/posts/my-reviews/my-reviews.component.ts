import { select } from "@angular-redux/store";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NgxGalleryImage, NgxGalleryOptions } from "ngx-gallery";
import { Observable } from "rxjs";
import { distinctUntilChanged, filter, takeUntil } from "rxjs/operators";

import { User } from "../../core/models/user";
import { LayoutActions } from "../../core/redux/actions/layout.actions";
import { ReviewService } from "../../core/services/review.service";
import { BaseComponent } from "../../shared/base-component";
import { CommonHelpers } from "../../shared/helpers/common-helper";
import { PostTypePipe } from "../../shared/pipes/post-type.pipe/post-type.pipe";
import * as constants from "./../../app.constants";

@Component({
  selector: "app-my-reviews",
  templateUrl: "./my-reviews.component.html",
  styleUrls: ["./my-reviews.component.scss"]
})
export class MyReviewComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _posts: Array<any>;
  private _postTypeId: number;
  private _isAnswerPage: boolean;
  private _pageTitle: string;
  private _totalCount: number;
  private _maxId: number = 0;
  private _user: User;
  private _isLoading: boolean = true;
  private _filePath: string;

  @select(["identity", "user"])
  private _user$: Observable<User>;

  @select(["layout", "isScrollEnd"])
  private _isScrollEnd$: Observable<boolean>;

  @select(["settings", "values"])
  private _settings$: Observable<Array<any>>;
  // End of Private Fields

  // Public properties
  public consts;
  public galleryOptions: NgxGalleryOptions[];
  // public galleryImages: NgxGalleryImage[];

  get posts(): Array<any> {
    return this._posts;
  }
  get postTypeId(): number {
    return 4; //this._postTypeId; // type 4 is review;
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
    private _postService: ReviewService
  ) {
    super();
    this.consts = constants;
    this._posts = [];

    this._settings$
      .pipe(
        takeUntil(this._destructor$),
        filter(setting => setting !== null)
      )
      .subscribe(settings => {
        this._filePath =
          settings.find(setting => setting.name === "BlobStorage:Path").value +
          "/" +
          settings.find(setting => setting.name === "BlobStorage:Container").value +
          "/";
      });
  }
  // End of constructor

  // Private methods
  private _getPosts() {
    this._isLoading = true;
    const options = Object.create({});
    options.createdbyid = this._user.id;
    options.maxId = this._maxId;
    options.count = 30;
    options.includeItems = true;
    this._postService
      .getReviewsByUser(this._user.id, options)
      .pipe(takeUntil(this._destructor$))
      .subscribe(posts => {
        this._isLoading = false;
        if (posts) {
          this._posts = this._posts.concat(posts.data);
          this._totalCount = posts.paging.recordCount;
          this._maxId = posts.paging.maxId;
        }
      });
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this.galleryOptions = [
      {
        width: "600px",
        height: "400px",
        thumbnailsColumns: 4
      },
      { image: false, thumbnailsRemainingCount: true, height: "100px" },
      { breakpoint: 500, width: "100%" }
    ];

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

  getGalleryImages(reviewId: number): NgxGalleryImage[] {
    let images: NgxGalleryImage[] = [];
    this.posts.find(post => post.reviewId === reviewId).attachments.map(attachment => {
      if (attachment.isImage) {
        images.push({
          small: this._filePath + attachment.fileIdentifier,
          big: this._filePath + attachment.fileIdentifier,
          medium: this._filePath + attachment.fileIdentifier
        });
      }
    });
    return images;
  }

  constructAddress(location: Array<string>): string {
    return location.filter(part => part).join(", ");
  }
  // End of public methods
}
