import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { Document } from '../../../models/document';
import { OnDestroy } from '@angular/core/core';
import { Subscription } from 'rxjs/Rx';
import { DocumentReviewService } from '../../services/document-review.service';
import { isNullOrUndefined } from 'util';
import { Block } from '../../../models/block';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { Store } from "@ngrx/store";
import * as fromRoot from '../../../../shared/reducers';
@Component({
  selector: 'document-review-structure',
  templateUrl: './document-review-structure.component.html',
  styleUrls: ['./document-review-structure.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class DocumentReviewStructureComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _block: Block;
  private _currentSelectBlock: Block;
  private _currentBlockSubscription$: Subscription;
  private _previousVersionedDocument: Document;
  private _currentDocumentVersion: string;
  // End of Private Fields

  // Public properties
  @Input('block')
  set block(block: Block) {
    this._block = block;
  }
  get block() {
    return this._block;
  }

  @Input('documentVersion')
  set DocumentVersion(documentVersion: string) {
    this._currentDocumentVersion = documentVersion;
  }
  get DocumentVersion(): string {
    return this._currentDocumentVersion;
  }

  @Input('previousVersionedDocument')
  set PreviousVersionedDocument(previousVersionedDocument: Document) {
    this._previousVersionedDocument = previousVersionedDocument;
  }
  get PreviousVersionedDocument(): Document {
    return this._previousVersionedDocument;
  }

  get currentDocumentVersion(): string {
    return this._currentDocumentVersion;
  }

  get previousVersionedDocument(): Document {
    return this._previousVersionedDocument;
  }

  // End of Public properties

  // Public Output bindings
  @Output() onCurrentBlockSelect: EventEmitter<string> = new EventEmitter();
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
   * @memberof DocumentReviewStructureComponent
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
   * @memberof DocumentReviewStructureComponent
   */
  private _isCurrentSelectedBlock(block: Block): boolean {
    if (isNullOrUndefined(this._currentSelectBlock)) return false;
    return this._currentSelectBlock.Id == block.Id;
  }

  /**
   * 
   * 
   * @private
   * @param {Block} block 
   * @returns {boolean} 
   * 
   * @memberof DocumentReviewStructureComponent
   */
  private _hasNewComments(block: Block): boolean {
    if (block.ClientComments.length === 0 || isNullOrUndefined(this._previousVersionedDocument)) return false;
    let newComments = block.ClientComments.filter(x => x.Version === this._currentDocumentVersion || x.Version === this._previousVersionedDocument.Version)
    if (newComments.length > 0) return true;
    return false;
  }

  /**
   * 
   * 
   * @private
   * @param {Block} block 
   * @returns {boolean} 
   * 
   * @memberof DocumentReviewStructureComponent
   */
  private _hasOldComments(block: Block): boolean {
    if (block.ClientComments.length === 0 || isNullOrUndefined(this._previousVersionedDocument)) return false;
    let newComments = block.ClientComments.filter(x => x.Version === this._currentDocumentVersion || x.Version === this._previousVersionedDocument.Version)
    if (newComments.length == 0 && block.ClientComments.length > 0) return true;
    return false;
  }

  /**
   * 
   * 
   * @private
   * @param {Block} block 
   * @returns {AeClassStyle} 
   * 
   * @memberof DocumentReviewStructureComponent
   */
  getCurrentBlockStyle(block: Block): AeClassStyle {
    if (this._isCurrentSelectedBlock(block)) return AeClassStyle.Active;
    else if (this._hasNewComments(block)) return AeClassStyle.Light;
    else if (this._hasOldComments(block)) return AeClassStyle.Dark;
    else return AeClassStyle.Default;
  }

  // End of private methods

  // Public methods

  /**
   * 
   * 
   * @public
   * @param {Block} block 
   * @returns {boolean} 
   * 
   * @memberof DocumentReviewStructureComponent
   */
  isChildBlock(block: Block): boolean {
    return !isNullOrUndefined(block.ParentBlockId);
  }

  /**
   * 
   * 
   * @public
   * @param {Block} block 
   * 
   * @memberof DocumentReviewStructureComponent
   */
  selectCurrentBlock(block: Block) {
    this._documentReviewService.onCurrentSelectedBlock(block);
  }

  /**
     * 
     * 
     * @public
     * @param {Block} block 
     * @returns {boolean} 
     * 
     * @memberof DocumentReviewContentComponent
     */
  getScrollIntoView(block: Block): boolean {
    if (isNullOrUndefined(this._currentSelectBlock) || isNullOrUndefined(block)) return false;
    return block.Id === this._currentSelectBlock.Id;
  }

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
  // End of public methods
}
