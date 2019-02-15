import { select } from "@angular-redux/store";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Router } from "@angular/router";
import { NgxGalleryImage, NgxGalleryOptions } from "ngx-gallery";
import { Observable, of, Subject } from "rxjs";
import { distinctUntilChanged, filter, map, switchMap, takeUntil } from "rxjs/operators";

import { Bookmark } from "../../../core/models/bookmark";
import { Post, PostType } from "../../../core/models/post";
import { User } from "../../../core/models/user";
import { PostService } from "../../../core/services/post.service";
import { ReviewService } from "../../../core/services/review.service";
import { SnackbarService } from "../../../core/services/snackbar.service";
import { BaseComponent } from "../../base-component";
import { ModelDialogComponent } from "../model-dialog/model-dialog.component";

@Component({
  selector: "app-post",
  templateUrl: "./post.component.html",
  styleUrls: ["./post.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class PostComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _showBookmark: boolean;
  private _showNotification: boolean;
  private _showFooter: boolean = true;
  private _user: User;
  private _bookmarkId: number;
  private _showComments: boolean = true;
  private _bookmarks: Array<Bookmark>;
  private _isExpiring: boolean = false;
  private _showAnswerCount: boolean = true;
  private _showReAsk: boolean = false;
  private _filePath: string;
  // End of Private Fields

  // Public properties
  public currentPost: Post;
  public postSubject: Subject<Post> = new Subject();
  public galleryOptions: NgxGalleryOptions[];
  public galleryImages: NgxGalleryImage[];

  @Input("post")
  set post(value: Post) {
    this.currentPost = value;
  }
  get post(): Post {
    return this.currentPost;
  }

  @Input("showBookmark")
  set showBookmark(value: boolean) {
    this._showBookmark = value;
  }
  get showBookmark(): boolean {
    return this._showBookmark;
  }

  @Input("showNotification")
  set showNotification(value: boolean) {
    this._showNotification = value;
  }
  get showNotification(): boolean {
    return this._showNotification;
  }

  @Input("showFooter")
  set showFooter(value: boolean) {
    this._showFooter = value;
  }
  get showFooter(): boolean {
    return this._showFooter;
  }

  @Input("showAnswerCount")
  set showAnswerCount(value: boolean) {
    this._showAnswerCount = value;
  }
  get showAnswerCount(): boolean {
    return this._showAnswerCount;
  }

  @Input("showComments")
  set showComments(value: boolean) {
    this._showComments = value;
  }
  get showComments(): boolean {
    return this._showComments;
  }

  @Input("isExpiring")
  set isExpiring(value: boolean) {
    this._isExpiring = value;
  }
  get isExpiring(): boolean {
    return this._isExpiring;
  }

  @Input("showReAsk")
  set showReAsk(value: boolean) {
    this._showReAsk = value;
  }
  get showReAsk(): boolean {
    return this._showReAsk;
  }

  @Input()
  public isAnnouncement: boolean;

  @Input()
  public preserveEmTag: boolean;

  get user(): User {
    return this._user;
  }

  get bookmarkId(): number {
    return this._bookmarkId;
  }

  @select(["identity", "user"])
  User$: Observable<User>;

  @select(["identity", "bookmarks"])
  private _bookmarks$: Observable<Array<Bookmark>>;

  @select(["settings", "values"])
  private _settings$: Observable<Array<any>>;
  // End of Public properties

  // Public Output bindings
  @Output()
  onPostArchived = new EventEmitter<number>();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(
    private _router: Router,
    private _postService: PostService,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog,
    private _reviewService: ReviewService
  ) {
    super();
    this._showBookmark = true;
    this._showNotification = true;

    this.User$.pipe(
      distinctUntilChanged(),
      map(u => u)
    ).subscribe(u => (this._user = u));

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

    this.galleryImages = [];

    if (this.currentPost.attachments) {
      this.currentPost.attachments.map(attachment => {
        if (attachment.isImage) {
          this.galleryImages.push({
            small: this._filePath + attachment.fileIdentifier,
            big: this._filePath + attachment.fileIdentifier,
            medium: this._filePath + attachment.fileIdentifier
          });
        }
      });
    }

    this.postSubject.next(Object.assign({}, this.currentPost));
    this._bookmarks$.pipe(distinctUntilChanged()).subscribe(bookmarks => {
      this._bookmarks = bookmarks ? bookmarks : [];
      const index = this._bookmarks.findIndex(
        bookmark => bookmark.entityId === this.currentPost.entityId || bookmark.entityId === this.currentPost.id
      );
      if (index === -1 && this.currentPost.bookmarkId) {
        this.currentPost.bookmarkId = 0;
      } else if (index !== -1) {
        this.currentPost.bookmarkId = this._bookmarks[index].id;
      }
      this.postSubject.next(Object.assign({}, this.currentPost));
    });
  }

  getType(typeId: number): string {
    return PostType[typeId];
  }

  isReview(): boolean {
    return this.currentPost.type == PostType.Review;
  }

  isKnowledge(): boolean {
    return this.currentPost.type == PostType.Insight;
  }

  isInspection(): boolean {
    return this.currentPost.type == PostType.Inspection;
  }

  isPromotion(): boolean {
    return this.currentPost.type == PostType.Promotion;
  }

  isQuestion(): boolean {
    return this.currentPost.type == PostType.Question;
  }

  isPost(): boolean {
    return !(this.isQuestion() || this.isKnowledge);
  }

  canShowAssociateName() {
    return this.currentPost.type !== PostType.Promotion;
  }

  isShowComment(): boolean {
    return !(this.isInspection() || this.isPromotion() || this.isReview);
  }

  updateBookmark(bookmarkId: number) {
    this._bookmarkId = bookmarkId != -1 ? bookmarkId : null;
  }

  goToPage(postId: number, isEdit?: boolean) {
    let url = "/";
    switch (this.post.type) {
      case PostType.Insight:
      case PostType.Question:
        url = `/post/${isEdit ? "update" : "view"}/${postId}`;
        break;
      case PostType.Review:
        url = `/review/${isEdit ? "update" : "view"}/${this.post.entityId}`;
        break;
      case PostType.Inspection:
        url = `/inspection/${this.post.entityId}`;
        break;
      case PostType.Promotion:
        url = `/promotion/${this.post.entityId}`;
        if (this.isAnnouncement) {
          url = `/announcement/${this.post.entityId}`;
        }

        break;
      default:
        url = `/property/${this.post.entityId}`;
        break;
    }

    this._router.navigateByUrl(url);
  }

  canShowReAsk() {
    return (
      this._showReAsk &&
      this.isQuestion() &&
      this.currentPost.answers.length == 0 &&
      this._user.id === this.currentPost.createdBy
    );
  }

  reAskQuestion() {
    this._postService
      .reAskQuestion(this.currentPost.id)
      .pipe(takeUntil(this._destructor$))
      .subscribe(response => {
        if (response instanceof HttpErrorResponse) {
          this._snackbar.error(response.statusText);
        } else {
          this._snackbar.success("Your unanswered question has been updated");
        }
      });
  }

  archivePost() {
    let dialogRef = this._dialog.open(ModelDialogComponent, {
      width: "350px",
      data: {
        name: "Are you sure you want to archive this record?",
        okName: "Yes"
      }
    });

    dialogRef
      .afterClosed()
      .pipe(
        takeUntil(this._destructor$),
        filter(result => result),
        switchMap(result => {
          if (this.currentPost.type === PostType.Review) {
            return this._reviewService.getReviewById(this.currentPost.entityId);
          } else {
            return of(this.currentPost);
          }
        }),
        switchMap(post => {
          if (this.currentPost.type === PostType.Review) {
            return this._reviewService.archiveReview(this.currentPost.entityId);
          } else {
            post.archive = true;
            return this._postService.updatePost(post);
          }
        })
      )
      .subscribe(response => {
        if (response instanceof HttpErrorResponse) {
          this._snackbar.error("Unable to archive");
        } else {
          this.onPostArchived.emit(this.currentPost.id);
          this._snackbar.success("Post archived successfully");
        }
      });
  }

  // End of public methods
}
