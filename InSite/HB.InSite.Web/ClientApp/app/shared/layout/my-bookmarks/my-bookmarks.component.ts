import { select } from "@angular-redux/store";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Router } from "@angular/router";
import { LoadingBarService } from "@ngx-loading-bar/core";
import { Observable } from "rxjs";
import { distinctUntilChanged, filter, switchMap, takeUntil } from "rxjs/operators";

import { Bookmark, Folder } from "../../../core/models/bookmark";
import { PostType } from "../../../core/models/post";
import { User } from "../../../core/models/user";
import { IdentityActions } from "../../../core/redux/actions/identity.actions";
import { LayoutActions } from "../../../core/redux/actions/layout.actions";
import { BookmarkService } from "../../../core/services/bookmark.service";
import { RouterExtService } from "../../../core/services/router-ext.service";
import { SnackbarService } from "../../../core/services/snackbar.service";
import { BaseComponent } from "../../base-component";
import { ModelDialogComponent } from "../../components/model-dialog/model-dialog.component";
import { CommonHelpers } from "../../helpers/common-helper";

@Component({
  selector: "app-my-bookmarks",
  templateUrl: "./my-bookmarks.component.html",
  styleUrls: ["./my-bookmarks.component.scss"]
})
export class MyBookmarksComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _selectedTypes: Array<number> = [];
  private _postTypes: Array<any>;
  private _selectedType;
  private _user: User;
  private _bookmarks: Array<Bookmark>;
  private _isMobile: boolean;
  private _allBookmarks: Array<Bookmark> = [];
  private _folders: Array<Folder> = [];
  private _folderId: number = 0;

  private _folderName: string = "Bookmarks";

  @select(["identity", "user"])
  private _user$: Observable<User>;

  @select(["layout", "isMobile"])
  private _isMobile$: Observable<boolean>;

  @select(["identity", "userFolders"])
  private _folders$: Observable<Array<Folder>>;

  @select(["identity", "bookmarks"])
  bookmarks$: Observable<Array<Bookmark>>;
  // End of Private Fields

  // Public properties
  get postTypes(): Array<any> {
    return this._postTypes;
  }
  get selectedType() {
    return this._selectedType;
  }
  get selectedTypes(): Array<number> {
    return this._selectedTypes;
  }
  get bookmarks(): Array<any> {
    return this._bookmarks;
  }
  get isMobile(): boolean {
    return this._isMobile;
  }
  get folders(): Array<Folder> {
    return this._folders;
  }
  get folderName(): string {
    return this._folderName;
  }

  selectedFolderId: number;
  showFolders: boolean = false;

  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(
    private _bookmarkService: BookmarkService,
    private _dialog: MatDialog,
    private _snackbar: SnackbarService,
    private _actions: IdentityActions,
    private _layoutActions: LayoutActions,
    private _router: Router,
    private _routerExtService: RouterExtService,
    private _loadingBar: LoadingBarService
  ) {
    super();
    this._user$.pipe(distinctUntilChanged()).subscribe(user => (this._user = user));

    this._isMobile$.pipe(distinctUntilChanged()).subscribe(value => {
      this._isMobile = value ? true : false;
    });

    this._folders$.pipe(takeUntil(this._destructor$)).subscribe(folders => {
      this._folders = folders instanceof HttpErrorResponse ? [] : folders;
    });
  }
  // End of constructor

  // Private methods
  private _updateList() {
    this._bookmarks = [];
    let bookmarks = this._allBookmarks.filter(bookmark => bookmark.folderId === this._folderId);

    if (this._selectedTypes && this._selectedTypes.length > 0) {
      this._bookmarks = bookmarks.filter(bookmark => this._selectedTypes.find(type => type === bookmark.type));
    } else {
      this._bookmarks = bookmarks;
    }

    this._bookmarks.sort((a, b) => (a.createdOn > b.createdOn ? -1 : 1));

    //TODo: move fixed value to constants
    let minHeight = this._bookmarks.length * 120 + "px";
    this._layoutActions.minHeight(minHeight);
  }

  private _prepareBookmarks() {
    this._bookmarks = this._allBookmarks
      .filter(bookmark => bookmark.folderId == 0 || bookmark.folderId === null)
      .sort((a, b) => (a.createdOn > b.createdOn ? -1 : 1));
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this._loadingBar.complete();
    this._postTypes = CommonHelpers.EnumToArray(PostType);
    this._selectedType = this._postTypes.map(type => {
      return type.value;
    });

    let prevPage = this._routerExtService.getPreviousUrl();

    if (this._bookmarkService.selectedFilters && (prevPage === "/filterbookmarks" || prevPage === "/manage-folders")) {
      this._selectedTypes = this._bookmarkService.selectedFilters;
      this.selectedFolderId = this._folderId = this._bookmarkService.selectedFolderId;
    } else {
      this.selectedFolderId = 0;
      this._folderId = 0;
      this._bookmarkService.selectedFolderId = null;
    }

    this.bookmarks$.pipe(distinctUntilChanged()).subscribe(bookmarks => {
      this._allBookmarks = bookmarks ? bookmarks : [];
      this._prepareBookmarks();

      //To show the list of bookmarks for selected folder.
      this._updateList();
    });
  }

  changeTypes(postTypes) {
    this._selectedTypes = postTypes;
    this._updateList();
  }

  manageFolders() {
    let dialogRef = this._dialog.open(ModelDialogComponent, {
      width: "600px",
      data: {
        name: "Manage folders",
        okName: "Close",
        type: "bookmark",
        folders: this._folders,
        hideNo: true
      }
    });

    dialogRef
      .afterClosed()
      .pipe(
        takeUntil(this._destructor$),
        filter(result => result)
      )
      .subscribe(result => {
        if (result instanceof HttpErrorResponse) {
          this._snackbar.error(result.error);
        } else {
          console.log("manage folders dialog closed");
        }
      });
  }

  changeFolder(event) {
    if (!event.id) {
      this._folderId = 0;
      this._folderName = "Bookmarks";
    } else {
      this._folderId = event.id;
      this._folderName = event.folderName;
    }
    this._updateList();
    this._bookmarkService.selectedFolderId = this._folderId;
    this.selectedFolderId = this._folderId;
    this.showFolders = false;
  }

  removeBookmark(id: number) {
    let dialogRef = this._dialog.open(ModelDialogComponent, {
      width: "500px",
      maxHeight: "500px",
      data: {
        name: "Remove from bookmarks?",
        okName: "Remove",
        type: "bookmark",
        folders: null
      }
    });

    dialogRef
      .afterClosed()
      .pipe(
        takeUntil(this._destructor$),
        filter(result => result),
        switchMap(() => this._bookmarkService.deleteBookmark(id.toString()))
      )
      .subscribe(response => {
        if (response instanceof HttpErrorResponse) {
          this._snackbar.error(response.statusText);
        } else {
          let index = this._bookmarks.findIndex(bookmark => bookmark.id === id);
          this._bookmarks.splice(index, 1);
          index = this._allBookmarks.findIndex(bookmark => bookmark.id === id);
          this._allBookmarks.splice(index, 1);
          this._actions.userBookmarksLoad(Object.assign([], this._allBookmarks));
          this._snackbar.success("Bookmark removed");
        }
      });
  }

  moveBookmark(id: number) {
    let dialogRef = this._dialog.open(ModelDialogComponent, {
      width: "500px",
      maxHeight: "500px",
      data: {
        name: "Move to folders",
        okName: "Move",
        type: "bookmark",
        folders: this._folders
      }
    });

    dialogRef
      .afterClosed()
      .pipe(
        takeUntil(this._destructor$),
        filter(result => result !== null),
        filter(result => result !== undefined),
        filter(result => result !== false),
        switchMap(result => {
          const bookmark = this._bookmarks.find(bookmark => bookmark.id === id);
          bookmark.folderId = result;
          bookmark.folder = null;
          return this._bookmarkService.updateBookmark(bookmark);
        })
      )
      .subscribe(result => {
        if (result instanceof HttpErrorResponse) {
          this._snackbar.error(result.error);
        } else {
          this._snackbar.success("Bookmark moved");
          this._updateList();
          this._actions.userFoldersInit(this._user.id);
          this._actions.userBookmarksLoad(Object.assign([], this._allBookmarks));
        }
      });
  }

  goToDetails(type: number, id: number) {
    const url = CommonHelpers.gotoPage(type, id);
    this._router.navigateByUrl(url);
  }

  toggleShowFolders() {
    this.showFolders = !this.showFolders;
  }

  goToFilters() {
    this._router.navigateByUrl("/filterbookmarks");
  }
  // End of public methods
}
