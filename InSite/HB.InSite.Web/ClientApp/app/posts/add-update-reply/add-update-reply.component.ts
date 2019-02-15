import { select } from "@angular-redux/store";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Observable, Subject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";

import { Reply } from "../../core/models/answer";
import { AssociateUser, User } from "../../core/models/user";
import { IdentityActions } from "../../core/redux/actions/identity.actions";
import { AnswerService } from "../../core/services/answer.service";
import { SnackbarService } from "../../core/services/snackbar.service";
import { BaseComponent } from "../../shared/base-component";

@Component({
  selector: "app-add-update-reply",
  templateUrl: "./add-update-reply.component.html",
  styleUrls: ["./add-update-reply.component.scss"]
})
export class AddUpdateReplyComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _replyId: number = 0;
  private _selectedReply: Reply;
  private _pointsEarned: number;
  private _user: any;
  // End of Private Fields

  // Public properties
  public replyForm: FormGroup;
  get replyId(): number {
    return this._replyId;
  }

  @select(["settings", "values"])
  private _settings$: Observable<Array<any>>;

  @select(["identity", "user"])
  private _user$: Observable<any>;

  @Input()
  answerId: number = null;
  @Input()
  selectedReply: Subject<Reply> = new Subject<Reply>();
  // End of Public properties

  // Public Output bindings
  @Output()
  onReplySave: EventEmitter<Reply> = new EventEmitter<Reply>();
  @Output()
  onReplayReset: EventEmitter<boolean> = new EventEmitter<boolean>();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(
    private _fb: FormBuilder,
    private _answerService: AnswerService,
    private _snackbar: SnackbarService,
    private _identityActions: IdentityActions
  ) {
    super();

    this._settings$
      .pipe(
        takeUntil(this._destructor$),
        filter(setting => setting !== null)
      )
      .subscribe(settings => {
        this._pointsEarned = settings.find(setting => setting.name.toLowerCase() === "points:answerreply").value;
      });
  }
  // End of constructor

  // Private methods
  private _initForm() {
    this.replyForm = this._fb.group({
      details: "",
      expirationDate: ""
    });
  }

  private _setValues() {
    this.replyForm.get("details").setValue(this._selectedReply.detail);
    this.replyForm.markAsDirty();
  }

  private _createReply(response: Observable<any>, replyText: string, isUpdate: boolean = false) {
    response.pipe(takeUntil(this._destructor$)).subscribe(reply => {
      if (reply instanceof HttpErrorResponse) {
        this._snackbar.error(`Unable to ${isUpdate ? "update" : "create"} reply`);
        this.replyForm.get("details").setValue(replyText);
        return;
      }

      this._snackbar.success(
        `Reply ${isUpdate ? "update" : "create"}d ${isUpdate ? "" : " - " + this._pointsEarned + " points earned"}`
      );

      if (!isUpdate) {
        let updatedUser: User = Object.assign({}, this._user);
        updatedUser.points = +updatedUser.points + +this._pointsEarned;
        this._identityActions.loadUserIdentity(updatedUser);
      }

      this.reset(isUpdate);
      this.onReplySave.emit(reply);
    });
  }

  // End of private methods

  // Public methods
  ngOnInit() {
    this._initForm();
    this.selectedReply.pipe(takeUntil(this._destructor$)).subscribe(reply => {
      this._selectedReply = reply;
      this._replyId = reply.id;
      this._setValues();
    });
    this._user$.pipe(takeUntil(this._destructor$)).subscribe(u => (this._user = u));
  }

  onSubmit() {
    if (this.replyForm.get("details").value.trim() === "") {
      this.replyForm.reset();
      this.replyForm.markAsPristine();
      return;
    }

    if (this.replyForm.valid) {
      let reply = new Reply();

      reply.associateId = 0;
      reply.detail = this.replyForm.get("details").value;
      this.replyForm.get("details").reset();
      reply.active = true;
      reply.archive = false;
      let associatedUser = new AssociateUser();
      reply.associateUser = associatedUser;
      reply.answerid = this.answerId;

      if (this._selectedReply) {
        reply.id = this._selectedReply.id;
        this._createReply(this._answerService.updateReply(reply), reply.detail, true);
      } else {
        reply.id = 0;
        this._createReply(this._answerService.saveReply(reply), reply.detail);
      }
    }
  }

  reset(isUpdate: boolean = true) {
    this.replyForm.reset();
    this.replyForm.markAsPristine();

    if (this._selectedReply && isUpdate) {
      this.onReplayReset.emit(true);
    }
  }
}
