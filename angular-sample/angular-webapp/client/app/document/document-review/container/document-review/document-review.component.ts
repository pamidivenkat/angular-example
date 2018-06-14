import { AeLoaderType } from '../../../../atlas-elements/common/ae-loader-type.enum';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { Document } from '../../../models/document';
import { getDocumentPreviousVersion } from '../../reducers/document-review.reducer';
import { DocumentState } from '../../../common/document-state.enum';
import { AeSelectEvent } from '../../../../atlas-elements/common/ae-select.event';
import { DocumentReviewActions } from '../../../common/document-review-actions.enum';
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { Comment, Block } from '../../../models/block';
import { OnDestroy } from '@angular/core/core';
import { Subscription } from 'rxjs/Rx';
import { DocumentReviewService } from '../../services/document-review.service';
import { Artifact } from '../../../models/artifact';
import { LoadReviewDocument, SaveReviewDocument, GetDocumentPreviousVersion } from '../../actions/document-review.actions';
import { isNull, isNullOrUndefined } from 'util';
import { Store } from '@ngrx/store';
import { BaseComponent } from '../../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { Component, OnInit, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import * as fromRoot from '../../../../shared/reducers';
import { ActivatedRoute, Router } from '@angular/router';
import * as Immutable from 'immutable';
import * as fromConstants from '../../../../shared/app.constants';
import { BreadcrumbGroup } from './../../../../atlas-elements/common/models/ae-breadcrumb-group';
import { IBreadcrumb } from './../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from './../../../../atlas-elements/common/services/breadcrumb-service';
@Component({
  selector: 'app-document-review',
  templateUrl: './document-review.component.html',
  styleUrls: ['./document-review.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [DocumentReviewService]
})
export class DocumentReviewComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _artifact: Artifact;
  private _currentSelectBlockId: string;
  private _routeParamSubscription$: Subscription;
  private _documentPreviousVersionSubscription$: Subscription;
  private _reviewDocumentSubscription$: Subscription;
  private _documentId: string;
  private _documentReviewActions: Immutable.List<AeSelectItem<string>>;
  private _documentReviewAction: string;
  private _previousVersionedDocument: Document;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _loaderType: AeLoaderType = AeLoaderType.Bars;
  // End of Private Fields

  // Public properties
  get artifact(): Artifact {
    return this._artifact;
  }

  get previousVersionedDocument(): Document {
    return this._previousVersionedDocument;
  }

  get loaderType(): AeLoaderType {
    return this._loaderType;
  }

  get documentReviewActions(): Immutable.List<AeSelectItem<string>> {
    return this._documentReviewActions;
  }

  get documentReviewAction(): string {
    return this._documentReviewAction;
  }

  get lightClass(): AeClassStyle {
    return this._lightClass;
  }

  get bcGroup() {
    return BreadcrumbGroup.Documents;
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
    , private _store: Store<fromRoot.State>
    , private _route: ActivatedRoute
    , private _router: Router
    , private _documentReviewService: DocumentReviewService
    , private _breadcrumbService: BreadcrumbService
  ) {
    super(_localeService, _translationService, _cdRef);
  }
  // End of constructor

  // Private methods


  /**
   * 
   * 
   * @private
   * @param {Block[]} blocks 
   * @param {Block} currentBlock 
   * @returns 
   * 
   * @memberof DocumentReviewComponent
   */
  private _updateClientComments(blocks: Block[], currentBlock: Block) {
    blocks.forEach(block => {
      if (block.Id === currentBlock.Id) {
        block = currentBlock;
        return;
      }
      if (block.Blocks.length > 0) {
        this._updateClientComments(block.Blocks, currentBlock);
      }
    });
    return;
  }


  // End of private methods

  // Public methods
  currentSelectedBlock(blockId: string) {
    this._currentSelectBlockId = blockId;
  }


  /**
   * 
   * 
   * @public
   * @returns {string} 
   * 
   * @memberof DocumentReviewComponent
   */
  getArtifactTitle(): string {
    if (isNullOrUndefined(this._artifact)) return null;
    return 'Review ' + this._artifact.Title;
  }

  /**
   * 
   * 
   * @public
   * @param {Block} currentBlock 
   * 
   * @memberof DocumentReviewComponent
   */
  actionOnComment(currentBlock: Block) {
    this._updateClientComments(this._artifact.Blocks, currentBlock);
  }

  /**
     * 
     * 
     * @public
     * 
     * @memberof DocumentReviewComponent
     */
  saveReviewedDocument() {
    if (this._documentReviewAction == DocumentReviewActions.Accept.toString()) {
      this._artifact.State = DocumentState.Approved;
    }
    else if (this._documentReviewAction == DocumentReviewActions.Submit.toString()) {
      this._artifact.State = DocumentState.Rejected;
    }
    else if (this._documentReviewAction == DocumentReviewActions.AmendAndAccept.toString()) {
      this._artifact.State = DocumentState.Rejected;
      this._artifact.IsAmendAccept = true;
    }
    this._documentReviewService.saveReviewDocument(this._artifact);
    this._router.navigate(['document/drafts']);
  }

  /**
   * 
   * 
   * @public
   * @param {AeSelectEvent<string>} $event 
   * 
   * @memberof DocumentReviewComponent
   */
  onReviewedDocumentActionsSelection($event: AeSelectEvent<string>) {
    this._documentReviewAction = $event.SelectedValue;
  }

  hasAnyActionNotSelected(): boolean {
    if (this._documentReviewAction) return false;
    return true;
  }

  ngOnInit() {
    let documentId = this._route.params;
    this._documentReviewAction = '';
    this._documentReviewActions = Immutable.List([
      new AeSelectItem<string>('Submit comments - Send the comments back to my consultant and continue working in collaboration on this document', DocumentReviewActions.Submit.toString(), false),
      new AeSelectItem<string>('Amend and accept - Send the comments back to my consultant, once the changes are made I\'\m happy for the document to be finalised', DocumentReviewActions.AmendAndAccept.toString(), false),
      new AeSelectItem<string>('Accept - I\'ve not added any comments, I\'m happy for the document to be finalised', DocumentReviewActions.Accept.toString(), false),
      new AeSelectItem<string>('Save - I\'ve not finished adding my comments, save this for later', DocumentReviewActions.Save.toString(), false)])

    this._reviewDocumentSubscription$ = this._store.let(fromRoot.getReviewDocument).subscribe((artifact) => {
      if (!isNullOrUndefined(artifact)) {
        this._artifact = artifact;
        if (this._artifact.Blocks) {

          // ToDo: Temporary fix to address image URL issues
          this._artifact.Blocks.forEach((b) => {
            if (!isNullOrUndefined(b.Description)) {
              //CID is not needed here
              b.Description = b.Description.replace(fromConstants.v1AppUrl + '/document.atld?id=', '/filedownload?documentId=');
            }
          });
        }

        this._cdRef.markForCheck();
      }
    });

    this._documentPreviousVersionSubscription$ = this._store.let(fromRoot.getDocumentPreviousVersion).subscribe((previousDocument) => {
      if (!isNullOrUndefined(previousDocument)) {
        this._previousVersionedDocument = previousDocument;
        this._cdRef.markForCheck();
      }
    });
    this._routeParamSubscription$ = this._route.params.subscribe(params => {
      this._documentId = params['id'];
      if (!isNullOrUndefined(this._documentId)) {

        let bcItem: IBreadcrumb = {
          isGroupRoot: false,
          group: BreadcrumbGroup.Documents,
          label: 'Review',
          url: '/document/review/' + this._documentId
        };
        this._breadcrumbService.clear(BreadcrumbGroup.Documents);
        this._breadcrumbService.add(bcItem);

        this._documentReviewService.loadReviewDocument(this._documentId);
        this._documentReviewService.getDocumentPreviousVersion(this._documentId);
      }
    });

  }

  ngOnDestroy() {
    this._routeParamSubscription$.unsubscribe();
    this._documentPreviousVersionSubscription$.unsubscribe();
    this._reviewDocumentSubscription$.unsubscribe();
  }
  // End of public methods
}
