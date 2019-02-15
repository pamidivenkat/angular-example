import { takeUntil } from "rxjs/operators";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";

import { Comment } from "../../core/models/comment";
import { CommentService } from "../../core/services/comment.service";
import { SnackbarService } from "../../core/services/snackbar.service";
import { BaseComponent } from "../../shared/base-component";
import { CommonHelpers } from "../../shared/helpers/common-helper";
import { SnackbarType } from "../../core/models/snackbar-type";

@Component({
  selector: "app-view-comment",
  templateUrl: "./view-comment.component.html",
  styleUrls: ["./view-comment.component.scss"]
})
export class ViewCommentComponent extends BaseComponent implements OnInit {
  // Private Fields
  // End of Private Fields

  // Public properties
  public showDialog: boolean;

  @Input() comment: Comment;
  // End of Public properties

  // Public Output bindings
  @Output() onRemoveComment = new EventEmitter<number>();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(
    private _commentService: CommentService,
    private _router: Router,
    private _snackbarService: SnackbarService
  ) {
    super();
  }
  // End of constructor

  // Private methods
  // End of private methods

  // Public methods
  ngOnInit() {}

  confirmRemove() {
    this.showDialog = true;
  }

  confirmResult(isConfirmed: boolean) {
    this.showDialog = !this.showDialog;
    if (isConfirmed) {
      this._commentService
        .deleteComment(this.comment.id.toString())
        .pipe(takeUntil(this._destructor$))
        .subscribe(response => {
          this._snackbarService.success(
            "Comment successfully deleted",
            SnackbarType.Success
          );
          this.onRemoveComment.emit(this.comment.id);
        });
    }
  }

  editComment() {}

  // End of public methods
}
