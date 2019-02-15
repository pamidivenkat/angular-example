import { select } from "@angular-redux/store";
import { Component, EventEmitter, Input, OnInit, Output, Renderer2, ViewEncapsulation } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Observable, Subject } from "rxjs";
import { filter, switchMap, takeUntil } from "rxjs/operators";

import { AssociateUser, User } from "../../core/models/user";
import { AnswerService } from "../../core/services/answer.service";
import { ClaimsHelperService } from "../../core/services/claims-helper.service";
import { SnackbarService } from "../../core/services/snackbar.service";
import { BaseComponent } from "../../shared/base-component";
import { ModelDialogComponent } from "../../shared/components/model-dialog/model-dialog.component";
import { Answer, Reply } from "./../../core/models/answer";
import { accordionAnimation } from "./../../shared/helpers/animations";
import { NgxGalleryOptions, NgxGalleryImage } from "ngx-gallery";

@Component({
  selector: "app-answer",
  templateUrl: "./answer.component.html",
  styleUrls: ["./answer.component.scss"],
  animations: [accordionAnimation],
  encapsulation: ViewEncapsulation.None
})
export class AnswerComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _showReplies: boolean = false;
  private _venues: Array<any> = [];
  private _brands: Array<any> = [];
  private _locations: Array<any> = [];
  private _user: User;
  private _isEditingReply: boolean = false;
  private _selectedReplyId: number = null;
  private _isEditingAnswer: boolean = false;

  @select(["settings", "values"])
  private _settings$: Observable<Array<any>>;
  @select(["identity", "user"])
  private _user$: Observable<User>;
  // End of Private Fields

  // Public properties
  public toggleInfoBarStatus: boolean;
  public filePath: string;
  public selectedReply: Subject<Reply> = new Subject<Reply>();
  public selectedAnswerId: number;
  public galleryOptions: NgxGalleryOptions[];
  public galleryImages: NgxGalleryImage[];
  public attachments: Array<any> = [];

  @Input()
  answer: Answer;

  @Input("editMode")
  set editMode(value) {
    this._isEditingAnswer = value;
  }
  get editMode(): boolean {
    return this._isEditingAnswer;
  }

  get showReplies(): boolean {
    return this._showReplies;
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
  get isEditingReply(): boolean {
    return this._isEditingReply;
  }
  get selectedReplyId(): number {
    return this._selectedReplyId;
  }
  // End of Public properties

  // Public Output bindings
  @Output()
  onEdit: EventEmitter<number> = new EventEmitter<number>();
  @Output()
  onDelete: EventEmitter<number> = new EventEmitter<number>();
  @Output()
  onAddUpdateReply: EventEmitter<any> = new EventEmitter();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(
    private _claimsHelper: ClaimsHelperService,
    private _dialog: MatDialog,
    private _answerService: AnswerService,
    private _snackbarService: SnackbarService,
    private _renderer: Renderer2
  ) {
    super();
  } // End of constructor
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
      { image: false, height: "100px" },
      { breakpoint: 500, width: "100%" }
    ];

    this._user$.pipe(takeUntil(this._destructor$)).subscribe(user => (this._user = user));

    this._settings$.pipe(takeUntil(this._destructor$)).subscribe(settings => {
      if (settings) {
        this.filePath =
          settings.find(setting => setting.name === "BlobStorage:Path").value +
          "/" +
          settings.find(setting => setting.name === "BlobStorage:Container").value +
          "/";
      }
    });

    this.galleryImages = [];

    let attachments = [];
    this.answer.attachments.map(attachment => {
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

    this.attachments = attachments;
  }
  toggleInfoBar() {
    this.toggleInfoBarStatus = !this.toggleInfoBarStatus;
  }
  toggleShowReplies(parentId: number) {
    this._showReplies = !this._showReplies;
    this.selectedAnswerId = parentId;
    if (!this._showReplies) {
      this._selectedReplyId = null;
    }
  }
  editAnswer() {
    this.onEdit.emit(this.answer.answerId);
  }
  addUpdateReply(reply: Reply) {
    const index = this.answer.replies.findIndex(r => r.id === reply.id);
    reply.associateUser = new AssociateUser();
    reply.associateUser.fullname = `${this._user.firstName} ${this._user.lastName}`;
    reply.associateUser.photoUrl = this._user.photoUrl;
    if (index === -1) {
      this.answer.replies.push(reply);
    } else {
      this.answer.replies[index] = reply;
    }
    this.onAddUpdateReply.emit();
  }
  canEdit(userId: string) {
    return this._claimsHelper.canEditEntity(userId) && !this._isEditingAnswer;
  }
  removeAnswer() {
    let dialogRef = this._dialog.open(ModelDialogComponent, {
      width: "500px",
      data: {
        name: "Are you sure you want to delete this answer?",
        okName: "Yes"
      }
    });
    dialogRef
      .afterClosed()
      .pipe(
        takeUntil(this._destructor$),
        filter(result => result),
        switchMap(() => {
          return this._answerService.deleteAnswer(this.answer.answerId);
        })
      )
      .subscribe(response => {
        if (response && response.error) {
          this._snackbarService.error("Error while deleting answer");
        } else {
          this._snackbarService.success("Answer deleted");
          this.onDelete.emit(this.answer.answerId);
        }
      });
  }
  editReply(reply: Reply) {
    this._isEditingReply = true;
    this._selectedReplyId = reply.id;
    setTimeout(() => {
      this.selectedReply.next(reply);
    }, 10);
  }
  hideEdit() {
    this._isEditingReply = false;
    this._selectedReplyId = null;
  }
  deleteReplay(replayId: number) {
    let dialogRef = this._dialog.open(ModelDialogComponent, {
      width: "500px",
      data: {
        name: "Are you sure you want to delete this reply?",
        okName: "Yes"
      }
    });
    dialogRef
      .afterClosed()
      .pipe(
        takeUntil(this._destructor$),
        filter(result => result),
        switchMap(() => {
          return this._answerService.deleteReply(replayId);
        })
      )
      .subscribe(response => {
        if (response && response.error) {
          this._snackbarService.error("Error while deleting answer");
        } else {
          this._snackbarService.success("Reply deleted");
          const index = this.answer.replies.findIndex(reply => replayId === reply.id);
          this.answer.replies.splice(index, 1);
        }
      });
  }

  showReplay(parentId: number) {
    this._showReplies = true;
    this.selectedAnswerId = parentId;

    setTimeout(() => {
      let replyElement = this._renderer.selectRootElement(`#reply${parentId}0`);
      replyElement.focus();
    }, 50);
  }

  // End of public methods
}
