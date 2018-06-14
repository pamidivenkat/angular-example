import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { UpdateDocumentBlock } from '../../../contract-personalisation/actions/contract-personalisation.actions';
import { SelectCurrentBlock } from '../../../document-review/actions/document-review.actions';
import { DocumentReviewService } from '../../../document-review/services/document-review.service';
import { SafeHtml } from '@angular/platform-browser/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';
import { StringHelper } from '../../../../shared/helpers/string-helper';
import { OnDestroy } from '@angular/core/core';
import { Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { Block } from '../../../models/block';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { Store } from "@ngrx/store";
import * as fromRoot from '../../../../shared/reducers';
@Component({
  selector: 'document-content-review',
  templateUrl: './document-content-review.component.html',
  styleUrls: ['./document-content-review.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DocumentContentReviewComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _block: Block;
  private _currentSelectBlock: Block;
  private _currentBlockSubscription$: Subscription;
  private _isEditing: boolean = false;
  private _canEdit: boolean = false;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _isEmployeeContract: boolean = false;
  private _currentEditContent: string;
  // End of Private Fields

  // Public properties
  get currentEditContent(): string {
    return this._currentEditContent;
  }

  get lightClass(): AeClassStyle {
    return this._lightClass;
  }

  get isEditing(): boolean {
    return this._isEditing;
  }

  @Input('canEdit')
  set canEdit(val: boolean) {
    this._canEdit = val;
  }

  get canEdit(): boolean {
    return this._canEdit;
  }

  @Input('block')
  set block(block: Block) {
    this._block = block;
  }
  get block() {
    return this._block;
  }

  @Input('isEmployeeContract')
  set isEmployeeContract(isEmployeeContract: boolean) {
    this._isEmployeeContract = isEmployeeContract;
  }
  get isEmployeeContract() {
    return this._isEmployeeContract;
  }
  // End of Public properties

  // Public Output bindings

  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ViewContent bindings
  // End of Public ViewContent bidnings

  // constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private sanitizer: DomSanitizer
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
   * @param {Block} block 
   * @returns {boolean} 
   * 
   * @memberof DocumentReviewContentComponent
   */
  private _childBlocksExists(block: Block): boolean {
    return block.Blocks && block.Blocks.length > 0;
  }

  /**
   * 
   * 
   * @private
   * @param {Block} block 
   * @returns {boolean} 
   * 
   * @memberof DocumentReviewContentComponent
   */
  isCurrrentSelectedBlock(block: Block): boolean {
    if (isNullOrUndefined(this._currentSelectBlock)) return false;
    return block.Id === this._currentSelectBlock.Id;
  }

  /**
   * 
   * 
   * @private
   * @param {Block} block 
   * 
   * @memberof DocumentReviewContentComponent
   */
  currentSelectedBlock(block: Block) {
    this._store.dispatch(new SelectCurrentBlock(block));
  }


  /**
   * 
   * @private
   * @param {Block} block 
   * @returns 
   * 
   * @memberof DocumentReviewContentComponent
   */
  getBlockDescription(block: Block): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(block.Description);
  }

  blockDescription(block: Block): string {
    return block.Description;
  }

  /**
   * 
   * 
   * @private
   * @param {Block} block 
   * @returns {boolean} 
   * 
   * @memberof DocumentReviewContentComponent
   */
  getScrollIntoView(block: Block): boolean {
    if (isNullOrUndefined(this._currentSelectBlock) || isNullOrUndefined(block)) return false;
    return block.Id === this._currentSelectBlock.Id;
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this._currentBlockSubscription$ = this._store.let(fromRoot.getCurrentSelectedBlock).subscribe((currentBlock) => {
      if (!isNullOrUndefined(currentBlock)) {
        this._currentSelectBlock = currentBlock;
        this._cdRef.markForCheck();
      }
    });

  }

  ngOnDestroy() {
    this._currentBlockSubscription$.unsubscribe();
  }

  editButtonText(): string {
    if (this._isEditing) return "update";
    else return "edit";
  }

  onModelConentChange(description: string, _block: Block) {
    this._currentEditContent = description;
  }
  onEditClick(_block: Block) {
    if (this._isEditing) {
      this._block.Description=this._currentEditContent;
      let block = Object.assign({}, this._block);
      this._store.dispatch(new UpdateDocumentBlock(block));
    }
    else{
      this._currentEditContent = this._block.Description;
    }
    this._isEditing = !this._isEditing;
  }

  onCancelClick() {
    this._isEditing = false;
  }

  getBlockContent(_currentBlock: Block) {
    if (isNullOrUndefined(_currentBlock)) return "";
    let block = Object.assign({}, _currentBlock);
    this._currentEditContent = block.Description;

  }
  // End of public methods

}
