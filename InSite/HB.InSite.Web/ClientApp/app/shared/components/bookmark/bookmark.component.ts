import { select } from "@angular-redux/store";
import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Subject } from "rxjs";
import { Observable } from "rxjs/Observable";
import { distinctUntilChanged, filter, map, switchMap, takeUntil } from "rxjs/operators";

import { Bookmark, Folder } from "../../../core/models/bookmark";
import { PostType } from "../../../core/models/post";
import { SnackbarType } from "../../../core/models/snackbar-type";
import { User } from "../../../core/models/user";
import { IdentityActions } from "../../../core/redux/actions/identity.actions";
import { BookmarkService } from "../../../core/services/bookmark.service";
import { SnackbarService } from "../../../core/services/snackbar.service";
import { BaseComponent } from "../../base-component";
import { ModelDialogComponent } from "../model-dialog/model-dialog.component";
import { Property } from "../../../core/models/property";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-bookmark",
  templateUrl: "./bookmark.component.html",
  styleUrls: ["./bookmark.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class BookmarkComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _isBookmark: boolean;
  private _user: User;
  private _bookmarkId: number;
  private _bookmarks: Array<Bookmark>;
  private _folders: Array<Folder> = [];

  @select(["identity", "user"])
  private _user$: Observable<User>;

  @select(["identity", "bookmarks"])
  private _bookmarks$: Observable<Array<Bookmark>>;

  @select(["identity", "userFolders"])
  private _folders$: Observable<Array<Folder>>;
  // End of Private Fields

  // Public properties
  @Input()
  showLabel: boolean;
  @Input()
  entity: any;
  @Input()
  user: User;
  @Input()
  entitySubject: Subject<any>;

  get isBookmark(): boolean {
    return this._isBookmark;
  }

  // End of Public properties

  // Public Output bindings
  @Output()
  onSaveBookmark = new EventEmitter<number>();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(
    private _dialog: MatDialog,
    private _bookmarkService: BookmarkService,
    private _snackbarService: SnackbarService,
    private _identityActions: IdentityActions
  ) {
    super();
    this._user$.pipe(takeUntil(this._destructor$)).subscribe(user => (this._user = user));

    this._bookmarks$.pipe(takeUntil(this._destructor$)).subscribe(bookmarks => {
      this._bookmarks = bookmarks ? bookmarks : [];
    });

    this._folders$.pipe(takeUntil(this._destructor$)).subscribe(folders => {
      this._folders = folders instanceof HttpErrorResponse ? [] : folders;
    });
  }

  // End of constructor

  // Private methods
  // End of private methods

  // Public methods
  ngOnInit() {
    if (this.entity) {
      this._isBookmark = this.entity.bookmarkId && this.entity.bookmarkId !== 0;
      this._bookmarkId = this.entity.bookmarkId === 0 ? null : this.entity.bookmarkId;
    }
    if (this.entitySubject) {
      this.entitySubject.pipe(distinctUntilChanged()).subscribe(data => {
        this.entity = data;
        this._isBookmark = this.entity.bookmarkId && this.entity.bookmarkId !== 0;
        this._bookmarkId = this.entity.bookmarkId;
      });
    }
  }

  showConfirm() {
    let title = "Add to bookmarks?";
    let btnName = "Add";

    const isRemove = this._isBookmark || this._bookmarkId;

    let folders = this._folders;

    if (isRemove) {
      title = "Remove from bookmarks?";
      btnName = "Remove";
      folders = null;
    }

    let dialogRef = this._dialog.open(ModelDialogComponent, {
      width: "500px",
      maxWidth: "100%",
      maxHeight: "500px",
      data: { name: title, okName: btnName, type: "bookmark", folders: folders }
    });

    isRemove ? this.delete(dialogRef.afterClosed()) : this.add(dialogRef.afterClosed());
  }

  private delete(dialog: Observable<any>) {
    if (!this._bookmarkId) {
      return;
    }
    dialog
      .pipe(
        takeUntil(this._destructor$),
        filter(result => result !== null),
        filter(result => result !== undefined),
        filter(result => result),
        switchMap(() => this._bookmarkService.deleteBookmark(this._bookmarkId.toString()))
      )
      .subscribe(() => {
        this._isBookmark = false;
        this.onSaveBookmark.emit(-1);
        this._snackbarService.success("Bookmark removed", SnackbarType.Success);
        const deletedIndex = this._bookmarks.findIndex(bookmark => bookmark.id == this._bookmarkId);
        this._bookmarks.splice(deletedIndex, 1);
        this._identityActions.userBookmarksLoad(Object.assign([], this._bookmarks));
        this._bookmarkId = null;
      });
  }

  private add(dialog: Observable<any>) {
    dialog
      .pipe(
        takeUntil(this._destructor$),
        filter(result => result !== null),
        filter(result => result !== undefined),
        filter(result => result !== false),
        map(result => {
          let bookmark = new Bookmark();
          bookmark.associateId = 0;

          if (this.entity.hasOwnProperty("reviewId")) {
            bookmark.entityId = this.entity.reviewId;
            bookmark.type = PostType.Review;
          } else if (this.entity.hasOwnProperty("inspectionId")) {
            bookmark.entityId = this.entity.inspectionId;
            bookmark.type = PostType.Inspection;
          } else if (this.entity.hasOwnProperty("promoId")) {
            bookmark.entityId = this.entity.promoId;
            bookmark.type = PostType.Promotion;
          } else if (this.entity.hasOwnProperty("announcementId")) {
            bookmark.entityId = this.entity.announcementId;
            bookmark.type = PostType.Promotion;
          } else if (this.entity.hasOwnProperty("propertyId")) {
            bookmark.entityId = this.entity.propertyId;
            bookmark.type = this.entity.type;
          } else {
            bookmark.entityId = this.entity.entityId ? this.entity.entityId : this.entity.id;
            bookmark.type = this.entity.type;
          }

          bookmark.folderId = result === true ? 0 : result;
          return bookmark;
        }),
        switchMap((bookmark: Bookmark) => this._bookmarkService.createBookmark(bookmark))
      )
      .subscribe(result => {
        this._isBookmark = true;
        this.onSaveBookmark.emit(result.id);
        this._bookmarkId = result.id;
        result.post = this.entity;
        if (result.type === PostType.Venue || result.type === PostType.CVB) {
          result.property = this.entity;
        } else {
          result.property = new Property();
          result.property.propertyId = 0;
        }

        if (this.entity.property && !result.post.title) {
          //For inspection/reviews/promotions add property name as title.
          result.post.title = this.entity.property.propertyName;
        }
        result.associateUser = this.entity.associateUser;
        this._bookmarks.push(result);
        this._identityActions.userBookmarksLoad(Object.assign([], this._bookmarks));
        this._snackbarService.success("Bookmarked successfully", SnackbarType.Success);
      });
  }
  // End of public methods
}
