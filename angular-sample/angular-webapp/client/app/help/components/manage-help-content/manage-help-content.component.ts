import { ChangeDetectorRef, Component, OnDestroy, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from "../../../shared/helpers/claims-helper";
import { MessengerService } from "../../../shared/services/messenger.service";
import { Store } from "@ngrx/store";
import * as fromRoot from '../../../shared/reducers';
import * as Immutable from 'immutable';
import { AeDataTableAction } from "../../../atlas-elements/common/models/ae-data-table-action";
import { Subject, Observable } from "rxjs/Rx";
import { Subscription } from "rxjs/Subscription";
import { AtlasApiRequestWithParams, AtlasParams } from "../../../shared/models/atlas-api-response";
import { isNullOrUndefined } from "util";
import { SortDirection, AeSortModel } from "../../../atlas-elements/common/models/ae-sort-model";
import { HelpContent } from "../../../help/models/helpArea";
import { LoadAllHelpContentsAction, AddHelpContentAction, UpdateHelpContentAction, RemoveHelpContentAction } from "../../../help/actions/help.actions";
import { DataTableOptions } from "../../../atlas-elements/common/models/ae-datatable-options";
import { AePageChangeEventModel } from "../../../atlas-elements/common/models/ae-page-change-event-model";
import { AeDataActionTypes } from "../../../employee/models/action-types.enum";
import { AeClassStyle } from "../../../atlas-elements/common/ae-class-style.enum";
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';
import { IBreadcrumb } from "../../../atlas-elements/common/models/ae-ibreadcrumb.model";
import { BreadcrumbService } from "../../../atlas-elements/common/services/breadcrumb-service";


@Component({
  selector: 'manage-help-content',
  templateUrl: './manage-help-content.component.html',
  styleUrls: ['./manage-help-content.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManageHelpContentComponent extends BaseComponent implements OnInit, OnDestroy {
  private _actions: Immutable.List<AeDataTableAction>;
  private _updateHelpContentCommand = new Subject();
  private _removeHelpContentCommand = new Subject();
  private _updateHelpContentSubscription: Subscription;
  private _removeHelpContentSubscription: Subscription;
  private _helpContentsApiRequest: AtlasApiRequestWithParams;
  private _totalRecords: Observable<number>;
  private _helpContents: Observable<Immutable.List<HelpContent>>;
  private _selectedHelpContent: HelpContent;
  private _dataTableOptions$: Observable<DataTableOptions>;
  private _keys = Immutable.List(['Title', 'PublishDate']);
  private _slideOut: boolean = false;
  private _actionType: string;
  private _helpContentRemoveConfirmPopup: boolean = false;
  private _helpContentsListLoaded: Observable<boolean>;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Help;
  }
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _messenger: MessengerService
    , private _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>
    , private _breadcrumbService: BreadcrumbService
  ) {
    super(_localeService, _translationService, _cdRef);

    this._actions = Immutable.List([
      new AeDataTableAction("Update", this._updateHelpContentCommand, false),
      new AeDataTableAction("Remove", this._removeHelpContentCommand, false)
    ]);
    let bcItem = new IBreadcrumb('Manage help contents', '/help/managehelpcontent', BreadcrumbGroup.Help);
    this._breadcrumbService.add(bcItem);

  }

  get helpContents(): Observable<Immutable.List<HelpContent>> {
    return this._helpContents;
  }
  get totalRecords(): Observable<number> {
    return this._totalRecords;
  }
  get dataTableOptions(): Observable<DataTableOptions> {
    return this._dataTableOptions$;
  }
  get actions(): Immutable.List<AeDataTableAction> {
    return this._actions;
  }
  get keys(): any {
    return this._keys;
  }
  get slideOut(): boolean {
    return this._slideOut;
  }
  get actionType(): string {
    return this._actionType;
  }
  get selectedHelpContent(): HelpContent {
    return this._selectedHelpContent;
  }
  get helpContentsListLoaded(): Observable<boolean> {
    return this._helpContentsListLoaded;
  }

  getSlideoutState(): string {
    return this._slideOut ? 'expanded' : 'collapsed';
  }

  closeSlideOut(e) {
    this._slideOut = false;
  }
  addHelpContent() {
    this._actionType = AeDataActionTypes.Add;
    this._slideOut = true;
  }


  ngOnInit() {
    if (isNullOrUndefined(this._helpContentsApiRequest))
      this._helpContentsApiRequest = <AtlasApiRequestWithParams>{};
    let params: AtlasParams[] = new Array();
    this._helpContentsApiRequest = new AtlasApiRequestWithParams(1, 10, 'PublishDate', SortDirection.Descending, params);
    this._helpContents = this._store.let(fromRoot.getAllHelpContents);
    this._helpContents.takeUntil(this._destructor$).subscribe((val) => {
      if (isNullOrUndefined(val)) {
        this._store.dispatch(new LoadAllHelpContentsAction(this._helpContentsApiRequest));
      }
    })
    this._totalRecords = this._store.let(fromRoot.getAllHelpContentsCount);
    this._dataTableOptions$ = this._store.let(fromRoot.getAllHelpContentsTableOptions);
    this._helpContentsListLoaded = this._store.let(fromRoot.getAllHelpContentsLoadStatus);

    //Subscription for update Help Content
    this._updateHelpContentSubscription = this._updateHelpContentCommand.subscribe(helpContent => {
      this._selectedHelpContent = helpContent as HelpContent;
      this._actionType = AeDataActionTypes.Update;
      this._slideOut = true;
    });

    //Subscription for Removing Doc
    this._removeHelpContentSubscription = this._removeHelpContentCommand.subscribe(helpContent => {
      if (!isNullOrUndefined(document)) {
        this._selectedHelpContent = helpContent as HelpContent;
        this._removeHelpContentRemoveConfirmPopup(true)
      }
    });

  }

  onAddUpdateHelpContentSubmit(helpContent: HelpContent) {
    this._slideOut = false;
    if (this._actionType === AeDataActionTypes.Add) {
      this._store.dispatch(new AddHelpContentAction(helpContent));
    }
    else if (this._actionType === AeDataActionTypes.Update) {
      if (!isNullOrUndefined(this._selectedHelpContent))
        helpContent.Id = this._selectedHelpContent.Id;
      helpContent.CreatedOn = this._selectedHelpContent.CreatedOn;
      this._store.dispatch(new UpdateHelpContentAction(helpContent));

    }
  }
  removeHelpContent() {
    let helpContent: HelpContent = this._selectedHelpContent;
    if (!isNullOrUndefined(helpContent)) {
      this._store.dispatch(new RemoveHelpContentAction(helpContent.Id));
    }

  }
  getHelpContentRemoveConfirmPopup() {
    return this._helpContentRemoveConfirmPopup;
  }
  private _removeHelpContentRemoveConfirmPopup(event) {
    this._helpContentRemoveConfirmPopup = true;
  }

  modalClosed() {
    this._helpContentRemoveConfirmPopup = false;
  }

  onPageChange(pagingInfo: AePageChangeEventModel) {
    this._helpContentsApiRequest.PageNumber = pagingInfo.pageNumber;
    this._helpContentsApiRequest.PageSize = pagingInfo.noOfRows;
    this._store.dispatch(new LoadAllHelpContentsAction(this._helpContentsApiRequest));
  }

  onSort(sortModel: AeSortModel) {
    this._helpContentsApiRequest.SortBy = sortModel;
    this._store.dispatch(new LoadAllHelpContentsAction(this._helpContentsApiRequest));
  }
  ngOnDestroy() {

    if (this._updateHelpContentSubscription)
      this._updateHelpContentSubscription.unsubscribe();
    if (this._removeHelpContentSubscription)
      this._removeHelpContentSubscription.unsubscribe();
    super.ngOnDestroy();
  }


}
