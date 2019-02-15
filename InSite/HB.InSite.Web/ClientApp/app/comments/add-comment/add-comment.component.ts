import { select } from "@angular-redux/store";
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation
} from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Observable, Subject } from "rxjs";
import { distinctUntilChanged, filter, takeUntil } from "rxjs/operators";

import { Comment } from "../../core/models/comment";
import { AssociateUser, User } from "../../core/models/user";
import { BaseComponent } from "../../shared/base-component";

@Component({
  selector: "app-add-comment",
  templateUrl: "./add-comment.component.html",
  styleUrls: ["./add-comment.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class AddCommentComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _user: User;
  private _commentId: number = 0;
  // End of Private Fields

  // Public properties
  public commentForm: FormGroup;
  public editorOptions: any;
  @select(["identity", "user"])
  User$: Observable<User>;

  @Input()
  placeholder: string = "Comment";
  @Input()
  comment: Subject<Comment>;
  @Input()
  maxLength: number;
  @Input()
  parentId: number;

  get commentId(): number {
    return this._commentId;
  }

  // End of Public properties

  // Public Output bindings
  @Output()
  onCommentSave = new EventEmitter<Comment>();
  @Output()
  onCommentCancel = new EventEmitter<boolean>();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(private _fb: FormBuilder) {
    super();
    this.comment = new Subject<Comment>();
    this.User$.pipe(
      distinctUntilChanged(),
      filter(u => u != null)
    ).subscribe(u => (this._user = u));
    this.maxLength = 1000;
    this.parentId = 0;
  }

  // End of constructor

  // Private methods
  private _initForm() {
    this.commentForm = this._fb.group({
      details: "",
      expirationDate: ""
    });
  }

  // End of private methods

  // Public methods
  ngOnInit() {
    this._initForm();
    this.comment.pipe(takeUntil(this._destructor$)).subscribe(comment => {
      this.commentForm.get("details").setValue(comment.detail);
      this._commentId = comment.id;
      this.commentForm.markAsDirty();
    });
  }

  onSubmit() {
    if (this.commentForm.get("details").value.trim() === "") {
      this.commentForm.reset();
      this.commentForm.markAsPristine();
      return;
    }
    if (this.commentForm.valid) {
      let comment = new Comment();

      if (this._commentId) {
        comment.id = this._commentId;
      } else {
        comment.id = 0;
      }
      comment.associateId = 0;
      comment.detail = this.commentForm.get("details").value;
      comment.expirationDate = this.commentForm.get("expirationDate").value
        ? this.commentForm.get("expirationDate").value
        : new Date();
      comment.active = true;
      comment.archive = false;
      let associatedUser = new AssociateUser();
      associatedUser.firstName = "";
      associatedUser.lastName = "";
      associatedUser.fullname = "";
      comment.associateUser = associatedUser;
      this.commentForm.reset();
      this.onCommentSave.emit(comment);
    }
  }
  cancel() {
    this.commentForm.reset();
    this.comment.next(new Comment());
    this.onCommentCancel.emit(true);
    this.commentForm.markAsPristine();
  }

  // End of public methods
}
