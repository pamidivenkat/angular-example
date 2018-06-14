import { isNullOrUndefined } from 'util';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { FormGroup, FormBuilder } from '@angular/forms';
import { User } from '../../../../shared/models/user';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { OnDestroy } from '@angular/core/core';
import { Subscription } from 'rxjs/Rx';
import { Block, Comment } from '../../../models/block';
import { DocumentReviewService } from '../../services/document-review.service';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import * as fromRoot from '../../../../shared/reducers';
import { Store } from "@ngrx/store";

@Component({
  selector: 'document-review-comments',
  templateUrl: './document-review-comments.component.html',
  styleUrls: ['./document-review-comments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DocumentReviewCommentsComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _currentBlock: Block;
  private _currentBlockSubscription$: Subscription;
  private _clientComment: Comment;
  private _replyComment: Comment;
  private _userId: string;
  private _addCommentForm: FormGroup;
  private _saveCommentForm: FormGroup;
  private lightClass: AeClassStyle = AeClassStyle.Light;
  private _documentVersion: string;
  // End of Private Fields

  // Public properties
  @Input('documentVersion')
  set DocumentVersion(documentVersion: string) {
    this._documentVersion = documentVersion;
  }
  get DocumentVersion(): string {
    return this._documentVersion;
  }

  get currentBlock(): Block {
    return this._currentBlock;
  }

  get addCommentForm(): FormGroup {
    return this._addCommentForm;
  }

  get saveCommentForm(): FormGroup {
    return this._saveCommentForm;
  }
  // End of Public properties

  // Public Output bindings
  @Output() actionOnComment: EventEmitter<Block> = new EventEmitter();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ViewContent bindings
  // End of Public ViewContent bidnings

  // constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _documentReviewService: DocumentReviewService
    , private _claimsHelper: ClaimsHelperService
    , private _formBuilder: FormBuilder
    , private _store: Store<fromRoot.State>
  ) {
    super(_localeService, _translationService, _cdRef);
  }
  // End of constructor

  // Private methods

  /**
   * 
   * 
   * @private
   * 
   * @memberof DocumentReviewCommentsComponent
   */
  private _initForm(): void {
    this._addCommentForm = this._formBuilder.group({
      Message: [{ value: this._clientComment.Message, disabled: false }]
    });

    this._saveCommentForm = this._formBuilder.group({
      Message: [{ value: this._replyComment.Message, disabled: false }]
    });

    for (let name in this._addCommentForm.controls) {
      if (this._addCommentForm.controls.hasOwnProperty(name)) {
        let control = this._addCommentForm.controls[name];
        control.valueChanges.subscribe(v => {
          this._clientComment[name] = v;
        });
      }
    }

    for (let name in this._saveCommentForm.controls) {
      if (this._saveCommentForm.controls.hasOwnProperty(name)) {
        let control = this._saveCommentForm.controls[name];
        control.valueChanges.subscribe(v => {
          this._replyComment[name] = v;
        });
      }
    }

  }

  /**
   * 
   * 
   * @private
   * 
   * @memberof DocumentReviewCommentsComponent
   */
  private _resetAddFormValues() {
    this._addCommentForm.patchValue({ 'Message': "" });
  }

  private _resetSaveFormValues() {
    this._saveCommentForm.patchValue({ 'Message': "" });
  }

  // End of private methods

  // Public methods

  /**
   * 
   * 
   * @public
   * @param {any} $event 
   * 
   * @memberof DocumentReviewCommentsComponent
   */
  addComment($event) {
    if (this._addCommentForm.valid) {
      this._clientComment.ObjectId = this._currentBlock.Id;
      this._clientComment.Version = this._documentVersion;
      this._clientComment.CreatedBy = this._userId;
      this._clientComment.CreatedOn = new Date();
      this._clientComment.Author = new User();
      this._clientComment.Author.FirstName = this._claimsHelper.getUserFirstName();
      this._clientComment.Author.LastName = this._claimsHelper.getUserLastName();
      let clientComment = Object.assign({}, this._clientComment);
      this._currentBlock.ClientComments.push(clientComment);
      this.actionOnComment.emit(this._currentBlock);
      this._resetAddFormValues();
    }
  }

  /**
   * 
   * 
   * @public
   * @param {Comment} comment 
   * 
   * @memberof DocumentReviewCommentsComponent
   */
  saveComment(comment: Comment) {
    if (this._saveCommentForm.valid) {
      this._replyComment.ObjectId = this._currentBlock.Id;
      this._replyComment.Version = this._documentVersion;
      this._replyComment.CreatedBy = this._userId;
      this._replyComment.CreatedOn = new Date();
      this._replyComment.Author = new User();
      this._replyComment.Author.FirstName = this._claimsHelper.getUserFirstName();
      this._replyComment.Author.LastName = this._claimsHelper.getUserLastName();
      let replyComment = Object.assign({}, this._replyComment);
      if (isNullOrUndefined(comment.ReplyComments)) {
        comment.ReplyComments = new Array<Comment>();
      }
      comment.ReplyComments.push(replyComment);
      this.actionOnComment.emit(this._currentBlock);
      this._resetSaveFormValues();
    }
  }

  /**
   * 
   * 
   * @public
   * @param {Comment[]} clientComments 
   * @param {Comment} comment 
   * 
   * @memberof DocumentReviewCommentsComponent
   */
  removeCurrentComment(clientComments: Comment[], comment: Comment) {
    //should be able to delete only comments owned by him
    if (this.isOwnComment(comment)) {
      let index: number = clientComments.indexOf(comment)
      if (index !== -1) {
        clientComments.splice(index, 1);
      }
      this.actionOnComment.emit(this._currentBlock);
    }
  }

  /**
   * 
   * 
   * @public
   * @param {Comment[]} replyComments 
   * @param {Comment} replyComment 
   * 
   * @memberof DocumentReviewCommentsComponent
   */
  removeReplyComment(replyComments: Comment[], replyComment: Comment) {
    //should be able to delete only comments owned by him
    if (this.isOwnComment(replyComment)) {
      let index: number = replyComments.indexOf(replyComment)
      if (index !== -1) {
        replyComments.splice(index, 1);
      }
      this.actionOnComment.emit(this._currentBlock);
    }
  }

  /**
   * 
   * 
   * @public
   * @param {Comment} comment 
   * @returns {boolean} 
   * 
   * @memberof DocumentReviewCommentsComponent
   */
  isOwnComment(comment: Comment): boolean {
    return comment.CreatedBy == this._userId;
  }

  ngOnInit() {
    this._clientComment = new Comment();
    this._replyComment = new Comment();
    this._userId = this._claimsHelper.getUserId();
    this._initForm();
    this._currentBlockSubscription$ = this._store.let(fromRoot.getCurrentSelectedBlock).subscribe((currentBlock) => {
      if (!isNullOrUndefined(currentBlock)) {
        this._currentBlock = currentBlock;
        if (!isNullOrUndefined(currentBlock.ClientComments)) {
          this._currentBlock.ClientComments = currentBlock.ClientComments.sort(((a, b) => a.CreatedOn < b.CreatedOn ? 1 : -1));
        }
        this._cdRef.markForCheck();
      }
    });

  }

  ngOnDestroy() {
    this._currentBlockSubscription$.unsubscribe();
  }
  // End of public methods

}
