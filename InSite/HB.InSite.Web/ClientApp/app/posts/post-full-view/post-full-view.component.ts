import { select } from "@angular-redux/store";
import { HttpErrorResponse } from "@angular/common/http";
import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild, ViewEncapsulation } from "@angular/core";
import { MatDialog } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxGalleryImage, NgxGalleryOptions } from "ngx-gallery";
import { Observable, of, Subject } from "rxjs";
import { distinctUntilChanged, filter, map, switchMap, takeUntil } from "rxjs/operators";

import { Answer } from "../../core/models/answer";
import { Notification } from "../../core/models/notification";
import { IdentityActions } from "../../core/redux/actions/identity.actions";
import { AnswerService } from "../../core/services/answer.service";
import { NotificationService } from "../../core/services/notification.service";
import { ModelDialogComponent } from "../../shared/components/model-dialog/model-dialog.component";
import { Bookmark } from "./../../core/models/bookmark";
import { Category } from "./../../core/models/category";
import { Comment } from "./../../core/models/comment";
import { Post, PostType } from "./../../core/models/post";
import { SnackbarType } from "./../../core/models/snackbar-type";
import { User } from "./../../core/models/user";
import { CategoryService } from "./../../core/services/category.service";
import { ClaimsHelperService } from "./../../core/services/claims-helper.service";
import { CommentService } from "./../../core/services/comment.service";
import { SnackbarService } from "./../../core/services/snackbar.service";
import { BaseComponent } from "./../../shared/base-component";
import { accordionAnimation } from "./../../shared/helpers/animations";

@Component({
  selector: "app-post-full-view",
  templateUrl: "./post-full-view.component.html",
  styleUrls: ["./post-full-view.component.scss"],
  encapsulation: ViewEncapsulation.None,
  animations: [accordionAnimation]
})
export class PostFullViewComponent extends BaseComponent implements OnInit, AfterViewInit {
  // Private Fields

  private _showDialog: boolean;
  private _selectedPost: Post;
  private _hasData: boolean;
  private _selectedCategory: Category;
  private _venues: Array<any> = [];
  private _brands: Array<any> = [];
  private _locations: Array<any> = [];
  private _isEditable: boolean = false;
  private _comments: Array<Comment> = [];
  private _user: User;
  private _bookmarks: Array<Bookmark>;
  private _postType: any;
  private _parentId: number;
  private _editingComment: Subject<Comment> = new Subject<Comment>();
  private _newComment: Subject<Comment> = new Subject<Comment>();
  private _newReply: Subject<Comment> = new Subject<Comment>();
  private _editingReply: Subject<Comment> = new Subject<Comment>();
  private _isCommentEditing: boolean = false;
  private _selectedId: number = null;
  private _editingAnswer: Subject<Answer> = new Subject<Answer>();
  private _pointsComment: number;
  private _pointsReply: number;
  private _editor: any;
  private _isEditingAnswer: boolean = false;

  @select(["identity", "user"])
  private _user$: Observable<User>;
  @select(["identity", "bookmarks"])
  private _bookmarks$: Observable<Array<Bookmark>>;
  @select(["settings", "values"])
  private _settings$: Observable<Array<any>>;
  // End of Private Fields

  // Public properties
  public toggleInfoBarStatus: boolean;
  public postSubject: Subject<Post> = new Subject();
  public galleryOptions: NgxGalleryOptions[];
  public galleryImages: NgxGalleryImage[];

  get selectedPost(): Post {
    return this._selectedPost;
  }
  get hasData(): boolean {
    return this._hasData;
  }
  get showDialog(): boolean {
    return this._showDialog;
  }

  get selectedCategory(): Category {
    return this._selectedCategory;
  }
  get postComments(): Array<Comment> {
    return this._comments.filter(comment => comment.active === true);
  }
  get venues(): Array<any> {
    return this._venues;
  }
  get brands(): Array<any> {
    return this._brands;
  }
  get locations(): Array<any> {
    return this._locations;
  }
  get isEditable(): boolean {
    return this._isEditable;
  }
  get postType() {
    return this._postType;
  }
  get parentId(): number {
    return this._parentId;
  }
  get editingComment(): Subject<Comment> {
    return this._editingComment;
  }
  get newComment(): Subject<Comment> {
    return this._newComment;
  }
  get newReply(): Subject<Comment> {
    return this._newReply;
  }
  get editingReply(): Subject<Comment> {
    return this._editingReply;
  }
  get isCommentEditing(): boolean {
    return this._isCommentEditing;
  }
  get selectedId(): number {
    return this._selectedId;
  }
  get editingAnswer(): Subject<Answer> {
    return this._editingAnswer;
  }
  get isEditingAnswer(): boolean {
    return this._isEditingAnswer;
  }

  public filePath: string;
  public postVenues: Subject<Array<any>> = new Subject<Array<any>>();
  public postBrands: Subject<Array<any>> = new Subject<Array<any>>();
  public postLocations: Subject<Array<any>> = new Subject<Array<any>>();
  public showReplies: Map<number, boolean> = new Map();

  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ContentChild bindings
  @ViewChild("comments")
  private _commentSection: ElementRef;
  @ViewChild("answers")
  private _answerSection: ElementRef;
  @ViewChild("addComment")
  private _addCommentSection: ElementRef;
  @ViewChild("addAnswerForm")
  private _addAnswerSection: ElementRef;
  // End of Public ContentChild bindings

  // Constructor
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _commentService: CommentService,
    private _snackbarService: SnackbarService,
    private _categoryService: CategoryService,
    private _claimsHelper: ClaimsHelperService,
    private _dialog: MatDialog,
    private _answerService: AnswerService,
    private _renderer: Renderer2,
    private _identityActions: IdentityActions,
    private _notificationService: NotificationService
  ) {
    super();
    if (!this._selectedPost) {
      this._selectedPost = new Post();
      this._selectedCategory = new Category();
    }

    this._hasData = false;
    this._postType = PostType;

    this._settings$
      .pipe(
        takeUntil(this._destructor$),
        filter(setting => setting !== null)
      )
      .subscribe(settings => {
        this.filePath =
          settings.find(setting => setting.name === "BlobStorage:Path").value +
          "/" +
          settings.find(setting => setting.name === "BlobStorage:Container").value +
          "/";

        this._pointsComment = settings.find(setting => setting.name.toLowerCase() === "points:insightcomment").value;

        this._pointsReply = settings.find(setting => setting.name.toLowerCase() === "points:insightcommentreply").value;
      });

    this._user$.pipe(takeUntil(this._destructor$)).subscribe(user => (this._user = user));
  }
  // End of constructor

  // Private methods
  private _getVenues(): void {
    if (this._selectedPost.postProperties) {
      this._selectedPost.postProperties.map(postProperty => {
        this._venues.push({
          id: postProperty.property.propertyId,
          name:
            postProperty.property.propertyName +
            (postProperty.property.stateName ? " - " + postProperty.property.stateName : "")
        });
      });
    }
    //If the post type is question, get the venue/cvb details of the answers and attach to question for view only
    if (this._selectedPost.type === PostType.Question) {
      this._selectedPost.answers.map(answer => {
        answer.answerProperties.map(postProperty => {
          if (!this._venues.find(venue => venue.id === postProperty.property.propertyId)) {
            this._venues.push({
              id: postProperty.property.propertyId,
              name:
                postProperty.property.propertyName +
                (postProperty.property.propertyState ? " - " + postProperty.property.propertyState : "")
            });
          }
        });
      });
    }

    this.postVenues.next(this._venues);
  }

  private _getBrands(): void {
    if (this._selectedPost.postPropertyChains) {
      this._selectedPost.postPropertyChains.map((postPropertyChain, index) => {
        if (postPropertyChain.propertyChain) {
          this._brands.push({
            id: postPropertyChain.propertyChain.propertyChainID,
            name: postPropertyChain.propertyChain.propertyChainName
          });
        }
      });
    }

    //If the post type is question, get the locations of the answers and attach to question for view only
    if (this._selectedPost.type === PostType.Question) {
      this._selectedPost.answers.map(answer => {
        answer.answerPropertyChains.map(postPropertyChain => {
          if (!this._brands.find(brand => brand.id === postPropertyChain.propertyChain.propertyChainID)) {
            this._brands.push({
              id: postPropertyChain.propertyChain.propertyChainID,
              name: postPropertyChain.propertyChain.propertyChainName
            });
          }
        });
      });
    }

    this.postBrands.next(this._brands);
  }

  private _getLocations() {
    if (this._selectedPost.postLocations) {
      this._selectedPost.postLocations.map(location => {
        this._locations.push({
          id: location.location.id,
          name: location.location.name
        });
      });
    }

    //If the post type is question, get the locations of the answers and attach to question for view only
    if (this._selectedPost.type === PostType.Question) {
      this._selectedPost.answers.map(answer => {
        answer.answerLocations.map(location => {
          if (!this._locations.find(loc => loc.id === location.location.id)) {
            this._locations.push({
              id: location.location.id,
              name: location.location.name
            });
          }
        });
      });
    }

    this.postLocations.next(this._locations);
  }

  private _saveComment(res: Observable<any>, comment: Comment, isReply: boolean, parentId?: number) {
    res
      .pipe(
        takeUntil(this._destructor$),
        map(response => {
          if (response.error) {
            this._snackbarService.error("Unable to save " + (isReply ? " reply" : "comment"));
            if (parentId) {
              this._newReply.next(comment);
            } else {
              this._newComment.next(comment);
            }
            return;
          }
          this._snackbarService.success(
            (isReply ? "Reply" : "Comment") +
              " added successfully - " +
              (isReply ? this._pointsReply : this._pointsComment) +
              " points earned",
            SnackbarType.Success
          );

          let updatedUser: User = Object.assign({}, this._user);
          updatedUser.points = +updatedUser.points + +(isReply ? this._pointsReply : this._pointsComment);

          this._identityActions.loadUserIdentity(updatedUser);

          response.associateUser = {
            fullname: `${this._user.firstName} ${this._user.lastName}`,
            photoUrl: this._user.photoUrl
          };

          if (parentId) {
            response.commentid = parentId;
            const index = this._selectedPost.comments.findIndex(comment => comment.id === parentId);
            this._selectedPost.comments[index].replies.push(response);
          } else {
            this._selectedPost.comments.push(response);
            this._comments = this._selectedPost.comments.sort((a, b) => (a.modifiedOn > b.modifiedOn ? 1 : -1));
          }
        }),
        switchMap(() => {
          return this._notificationService.getNotificationIdByEntity(
            this._selectedPost.id,
            this._user.id,
            this._selectedPost.type
          );
        })
      )
      .subscribe(notification => {
        this._selectedPost.notificationId = notification.id;
        this.postSubject.next(Object.assign({}, this._selectedPost));
      });
  }

  private _updateComment(res: Observable<any>, comment: Comment, isReply: boolean, parentId?: number) {
    res.pipe(takeUntil(this._destructor$)).subscribe(response => {
      if (response.error) {
        this._snackbarService.error("Unable to update" + (isReply ? " reply" : "comment"));
        if (parentId) {
          this._newReply.next(comment);
        } else {
          this._newComment.next(comment);
        }
        return;
      }
      this._isCommentEditing = false;
      this._snackbarService.success((isReply ? " Reply" : "Comment") + " updated successfully", SnackbarType.Success);

      if (parentId) {
        const parentIndex = this._comments.findIndex(comment => comment.id === parentId);
        const index = this._comments[parentIndex].replies.findIndex(comment => comment.id === response.id);
        this._comments[parentIndex].replies[index].detail = response.detail;
      } else {
        const index = this._comments.findIndex(comment => comment.id === response.id);
        this._comments[index].detail = response.detail;
      }

      response.associateUser = {
        fullname: `${this._user.firstName} ${this._user.lastName}`,
        photoUrl: this._user.photoUrl
      };
    });
  }
  // End of private methods

  // Public methods
  ngAfterViewInit() {
    this._activatedRoute.fragment.subscribe(fragment => {
      this.goToSection(fragment);
    });
  }
  ngOnInit() {
    this.galleryOptions = [
      {
        width: "600px",
        height: "400px",
        thumbnailsColumns: 4
      },
      { image: false, height: "100px" },
      { breakpoint: 500, width: "100%" }
    ];

    this._activatedRoute.data
      .pipe(
        takeUntil(this._destructor$),
        map(data => {
          this._hasData = true;
          if (data.postData instanceof HttpErrorResponse) {
            setTimeout(() => {
              this._snackbarService.error("Post :" + data.postData.statusText);
            }, 10);
          } else {
            this._selectedPost = data.postData;

            this.postSubject.next(Object.assign({}, this._selectedPost));
            this._comments = this._selectedPost.comments
              ? this._selectedPost.comments.sort((a, b) => (a.modifiedOn > b.modifiedOn ? 1 : -1))
              : [];

            this._isEditable = this._claimsHelper.canEditEntity(this._selectedPost.createdBy);

            this.galleryImages = [];

            let attachments = [];
            this._selectedPost.attachments.map(attachment => {
              if (attachment.isImage) {
                this.galleryImages.push({
                  small: this.filePath + attachment.fileIdentifier,
                  big: this.filePath + attachment.fileIdentifier,
                  medium: this.filePath + attachment.fileIdentifier
                });
              } else {
                attachments.push(attachment);
              }
            });

            this._selectedPost.attachments = attachments;

            this._getVenues();
            this._getBrands();
            this._getLocations();
          }
        }),
        switchMap(() => {
          return this._categoryService.getCategoryById(this._selectedPost.categoryId);
        })
      )
      .subscribe(response => {
        this._selectedCategory = response;
        this._bookmarks$.pipe(distinctUntilChanged()).subscribe(bookmarks => {
          this._bookmarks = bookmarks ? bookmarks : [];
          const index = this._bookmarks.findIndex(
            bookmark => bookmark.entityId === this._selectedPost.entityId || bookmark.entityId === this._selectedPost.id
          );
          if (index === -1 && this._selectedPost.bookmarkId) {
            this._selectedPost.bookmarkId = 0;
          } else if (index !== -1) {
            this._selectedPost.bookmarkId = this._bookmarks[index].id;
          }
          this.postSubject.next(Object.assign({}, this._selectedPost));
        });
      });
  }

  saveComment(comment: Comment, isReply: boolean = false, parentId: number = null) {
    comment.postId = parentId ? 0 : this._selectedPost.id;
    comment.commentid = parentId ? parentId : null;

    if (comment.id) {
      this._updateComment(this._commentService.updateComment(comment), comment, isReply, parentId);
    } else {
      this._saveComment(this._commentService.createComment(comment), comment, isReply, parentId);
    }
  }

  removeComment(commentId: number) {
    let commentIndex = this._selectedPost.comments.findIndex(comment => {
      return comment.id == commentId;
    });
    let dialogRef = this._dialog.open(ModelDialogComponent, {
      width: "500px",
      data: {
        name: "Are you sure you want to delete this comment?",
        okName: "Yes"
      }
    });
    dialogRef
      .afterClosed()
      .pipe(
        takeUntil(this._destructor$),
        filter(result => result),
        switchMap(result => {
          this._comments[commentIndex].active = false;
          return this._commentService.deleteComment(this._comments[commentIndex].id.toString());
        })
      )
      .subscribe(response => {
        if (response && response.error) {
          this._snackbarService.error("Error while deleting");
        } else {
          this._snackbarService.success("Comment deleted");
        }
      });
  }

  goToSection(sectionName: string) {
    let ele;
    switch (sectionName) {
      case "comments":
        this._commentSection.nativeElement.scrollIntoView();
        break;
      case "addAnswer":
        this._addAnswerSection.nativeElement.scrollIntoView();

        this._editor.focus();
        break;
      case "answers":
        this._answerSection.nativeElement.scrollIntoView();
        break;
      case "addComment":
        this._addCommentSection.nativeElement.scrollIntoView();
        ele = this._renderer.selectRootElement("#comment00");
        setTimeout(() => {
          ele.focus();
        }, 10);
        break;
    }
  }

  toggleInfoBar() {
    this.toggleInfoBarStatus = !this.toggleInfoBarStatus;
  }

  addAnswer(event) {
    this._isEditingAnswer = false;
    event.associateUser = {
      fullname: `${this._user.firstName} ${this._user.lastName}`,
      photoUrl: this._user.photoUrl
    };
    const index = this._selectedPost.answers.findIndex(answer => event.answerId === answer.answerId);
    this._answerService
      .getAnswerById(event.answerId)
      .pipe(
        takeUntil(this._destructor$),
        switchMap(answer => {
          if (index === -1) {
            this._selectedPost.answers.push(answer);
          } else {
            this._selectedPost.answers[index] = answer;
          }

          this._venues = [];
          this._getVenues();
          this._brands = [];
          this._getBrands();
          this._locations = [];
          this._getLocations();
          return of(answer);
        }),
        switchMap(answer => {
          if (answer instanceof HttpErrorResponse) {
            return of(new Notification());
          } else {
            return this._notificationService.getNotificationIdByEntity(
              this._selectedPost.id,
              this._user.id,
              this._selectedPost.type
            );
          }
        })
      )
      .subscribe(notification => {
        if (notification && !(notification instanceof HttpErrorResponse)) {
          this._selectedPost.notificationId = notification.id;
          this.postSubject.next(Object.assign({}, this._selectedPost));
        }
      });
  }

  showReplay(parentId: number) {
    this.showReplies.set(parentId, true);
    this._parentId = parentId;
    setTimeout(() => {
      this._renderer.selectRootElement(`#comment${parentId}0`).focus();
    }, 50);
  }

  toggleShowReplies(parentId: number) {
    const currentStatus = this.showReplies.get(parentId);
    this.showReplies.set(parentId, !currentStatus);

    if (!this.showReplies.get(parentId)) {
      this._selectedId = null;
    }
  }

  showHideReplies(parentId: number) {
    return this.showReplies.get(parentId);
  }

  enableEdit(comment: Comment) {
    this._isCommentEditing = true;
    this._selectedId = comment.id;
    setTimeout(() => {
      this._editingComment.next(comment);
    }, 10);
  }

  enableReplyEdit(comment: Comment, parentId: number) {
    this._isCommentEditing = true;
    this._selectedId = comment.id;
    this._parentId = parentId;
    setTimeout(() => {
      this._editingReply.next(comment);
    }, 50);

    setTimeout(() => {
      this._renderer.selectRootElement(`#comment${parentId}${comment.id}`).focus();
    }, 100);
  }

  removeReply(commentId: number, parentId: number) {
    let dialogRef = this._dialog.open(ModelDialogComponent, {
      width: "500px",
      data: {
        name: "Are you sure you want to delete this reply?",
        okName: "Yes"
      }
    });
    let parentIndex = this._comments.findIndex(comment => comment.id === parentId);
    let index = this._comments[parentIndex].replies.findIndex(reply => reply.id === commentId);
    dialogRef
      .afterClosed()
      .pipe(
        takeUntil(this._destructor$),
        filter(result => result),
        switchMap(result => {
          this._comments[parentIndex].replies[index].active = false;

          return this._commentService.deleteComment(this._comments[parentIndex].replies[index].id.toString());
        })
      )
      .subscribe(response => {
        if (response && response.error) {
          this._snackbarService.error("Error while deleting reply");
        } else {
          this._comments[parentIndex].replies.splice(index, 1);
          this._snackbarService.success("Reply deleted");
        }
      });
  }

  canEdit(userId: string): boolean {
    return this._claimsHelper.canEditEntity(userId);
  }

  cancelEdit() {
    this._selectedId = null;
    this._isCommentEditing = false;
  }

  editAnswer(event: number) {
    this._isEditingAnswer = true;
    setTimeout(() => {
      this.goToSection("addAnswer");
    }, 200);

    this._editingAnswer.next(Object.create(this._selectedPost.answers.find(answer => event === answer.answerId)));
  }

  updateAnswerList(answerId: number) {
    const index = this.selectedPost.answers.findIndex(answer => answer.answerId === answerId);
    if (index !== -1) {
      this.selectedPost.answers.splice(index, 1);
    }
  }

  setEditor(editor) {
    this._editor = editor;
  }

  resetAnswerForm() {
    this._isEditingAnswer = false;
  }

  updateNotify() {
    this._notificationService
      .getNotificationIdByEntity(this._selectedPost.id, this._user.id, this._selectedPost.type)
      .pipe(takeUntil(this._destructor$))
      .subscribe(notification => {
        if (notification && !(notification instanceof HttpErrorResponse)) {
          this._selectedPost.notificationId = notification.id;
          this.postSubject.next(Object.assign({}, this._selectedPost));
        }
      });
  }
}
