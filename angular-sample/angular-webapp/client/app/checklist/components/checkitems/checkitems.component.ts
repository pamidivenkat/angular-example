import { AePageChangeEventModel } from '../../../atlas-elements/common/models/ae-page-change-event-model';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { RouteParams } from '../../../shared/services/route-params';
import { AeDataActionTypes } from '../../../employee/models/action-types.enum';
import { DataTableOptions } from '../../../atlas-elements/common/models/ae-datatable-options';
import { Store } from '@ngrx/store';
import { AeSortModel, SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import { CheckItem } from '../../models/checkitem.model';
import { isNullOrUndefined } from 'util';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import { AeDataTableAction } from '../../../atlas-elements/common/models/ae-data-table-action';
import { ChecklistService } from '../../services/checklist.service';
import { Input, ViewEncapsulation } from '@angular/core';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import * as Immutable from 'immutable';
import * as fromRoot from '../../../shared/reducers';

@Component({
    selector: 'checklist-checkItems',
    templateUrl: './checkitems.component.html',
    styleUrls: ['./checkitems.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})

export class CheckItemsComponent extends BaseComponent implements OnInit, OnDestroy {
    private _checkItems$: BehaviorSubject<Immutable.List<CheckItem>>;
    private _totalCount$: Observable<number>;
    private _checkItemsDataTableOptions$: Observable<DataTableOptions>;
    private _checkItemsLoading$: Observable<boolean>;
    private _actions: Immutable.List<AeDataTableAction>;
    private _updateActionCommand = new Subject();
    private _removeActionCommand = new Subject();
    private _currentChecklistSubscription$: Subscription;
    private _updateActionCommandSubscription$: Subscription;
    private _removeActionCommandSubscription$: Subscription;
    private _checkItemsListSybscription$: Subscription;
    private _checkItemsApiRequestParams: AtlasApiRequestWithParams;
    private _slideOut: boolean = false;
    private _actionType: string;
    private _selectedCheckItem: CheckItem;
    private _removeConfirmation: boolean;
    private _lightClass: AeClassStyle = AeClassStyle.Light;
    private _currentChecklistId: string;
    private _keys = ['Id', 'ItemText', 'YesNoAnswer', 'CorrectiveActionText'];

    @Input() context: any;

    get checkItems$() {
        return this._checkItems$;
    }

    get totalCount$() {
        return this._totalCount$;
    }

    get actions() {
        return this._actions;
    }

    get keys() {
        return this._keys;
    }

    get actionType() {
        return this._actionType;
    }

    get removeConfirmation() {
        return this._removeConfirmation;
    }

    get selectedCheckItem() {
        return this._selectedCheckItem;
    }

    get slideOut() {
        return this._slideOut;
    }

    get checkItemsDataTableOptions$() {
        return this._checkItemsDataTableOptions$;
    }

    get checkItemsLoading$() {
        return this._checkItemsLoading$;
    }

    get selectedCheckItemText() {
        return this._selectedCheckItem.ItemText
    }

    get lightClass() {
        return this._lightClass;
    }


    constructor(protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef
        , private _store: Store<fromRoot.State>
        , private _routeParams: RouteParams
        , protected _checklistService: ChecklistService) {
        super(_localeService, _translationService, _cdRef);
    }

    ngOnInit() {
        //Action buttons
        this._actions = Immutable.List([
            new AeDataTableAction("Update", this._updateActionCommand, false),
            new AeDataTableAction("Remove", this._removeActionCommand, false)
        ]);
        //End of action buttons
        this._checkItems$ = new BehaviorSubject(Immutable.List([]));
        this._currentChecklistSubscription$ = this._store.let(fromRoot.getCurrentChecklistData).subscribe((currentChecklistItem) => {
            if (!isNullOrUndefined(currentChecklistItem)) {
                this._currentChecklistId = currentChecklistItem.Id;
            }
        });

        this._checkItemsListSybscription$ = this._store.let(fromRoot.getCheckItemsData).subscribe((res) => {
            if (isNullOrUndefined(res)) {
                this._initialLoadCheckItems();
            }
            else {
                this._checkItems$.next(Immutable.List<CheckItem>(res));
                this._slideOut = false;
                this._removeConfirmation = false;
                this._cdRef.markForCheck();
            }
        });

        this._totalCount$ = this._store.let(fromRoot.getCheckItemsTotalCount);
        this._checkItemsDataTableOptions$ = this._store.let(fromRoot.getCheckItemsPageInformation);
        this._checkItemsLoading$ = this._store.let(fromRoot.getCheckItemsLoadingStatus);

        this._updateActionCommandSubscription$ = this._updateActionCommand.subscribe(res => {
            this._selectedCheckItem = res as CheckItem;
            this._actionType = AeDataActionTypes.Update;
            this._slideOut = true;
        })

        this._removeActionCommandSubscription$ = this._removeActionCommand.subscribe(res => {
            this._selectedCheckItem = res as CheckItem;
            this._removeConfirmation = true;
        })
    }

    ngOnDestroy() {
        if (!isNullOrUndefined(this._updateActionCommandSubscription$)) {
            this._updateActionCommandSubscription$.unsubscribe();
        }
        if (!isNullOrUndefined(this._removeActionCommandSubscription$)) {
            this._removeActionCommandSubscription$.unsubscribe();
        }

        if (!isNullOrUndefined(this._currentChecklistSubscription$)) {
            this._currentChecklistSubscription$.unsubscribe();
        }

        if (!isNullOrUndefined(this._checkItemsListSybscription$)) {
            this._checkItemsListSybscription$.unsubscribe();
        }
    }

    private _initialLoadCheckItems() {
        if (isNullOrUndefined(this._checkItemsApiRequestParams))
            this._checkItemsApiRequestParams = <AtlasApiRequestWithParams>{};
        this._checkItemsApiRequestParams.PageNumber = 1;
        this._checkItemsApiRequestParams.PageSize = 10;
        this._checkItemsApiRequestParams.SortBy = <AeSortModel>{};
        this._checkItemsApiRequestParams.SortBy.Direction = SortDirection.Ascending;
        this._checkItemsApiRequestParams.SortBy.SortField = 'CreatedOn';
        this._checklistService.LoadCheckItemsList(this._checkItemsApiRequestParams);
    }

    onPageChange(pagingInfo: AePageChangeEventModel) {
        if (isNullOrUndefined(this._checkItemsApiRequestParams))
            this._checkItemsApiRequestParams = <AtlasApiRequestWithParams>{};
        this._checkItemsApiRequestParams.PageNumber = pagingInfo.pageNumber;
        this._checkItemsApiRequestParams.PageSize = pagingInfo.noOfRows;
        if (isNullOrUndefined(this._checkItemsApiRequestParams.SortBy)) {
            this._checkItemsApiRequestParams.SortBy = <AeSortModel>{};
            this._checkItemsApiRequestParams.SortBy.Direction = this._checkItemsApiRequestParams.SortBy.Direction || SortDirection.Ascending;
            this._checkItemsApiRequestParams.SortBy.SortField = this._checkItemsApiRequestParams.SortBy.SortField || 'CreatedOn';
        }
        this._checklistService.LoadCheckItemsList(this._checkItemsApiRequestParams);
    }

    onSort(sortModel: AeSortModel) {
        if (isNullOrUndefined(this._checkItemsApiRequestParams))
            this._checkItemsApiRequestParams = <AtlasApiRequestWithParams>{};
        this._checkItemsApiRequestParams.SortBy = <AeSortModel>{};
        this._checkItemsApiRequestParams.SortBy = sortModel;
        this._checkItemsApiRequestParams.PageNumber = this._checkItemsApiRequestParams.PageNumber || 1;
        this._checkItemsApiRequestParams.PageSize = this._checkItemsApiRequestParams.PageSize || 10;
        this._checklistService.LoadCheckItemsList(this._checkItemsApiRequestParams);
    }

    getSlideoutState(): string {
        return this._slideOut ? 'expanded' : 'collapsed';
    }

    closeSlideOut(e) {
        this._slideOut = false;
    }

    addCheckItem() {
        this._actionType = AeDataActionTypes.Add;
        this._slideOut = true;
    }

    submitCheckItemFormData(_checkItem) {
        let _checkItemDetails: CheckItem = _checkItem
        if (this._actionType == AeDataActionTypes.Add) {
            _checkItemDetails.Id = null;
            _checkItemDetails.CheckListId = this._currentChecklistId;
            this._checklistService.AddCheckItem(_checkItemDetails);
        } else if (this._actionType == AeDataActionTypes.Update) {
            this._checklistService.UpdateCheckItem(_checkItemDetails);
        }
    }

    removeConfirmModalClosed(event: any) {
        this._removeConfirmation = false;
    }

    removeCheckItem(event: any) {
        this._checklistService.RemoveCheckItem(this._selectedCheckItem);
    }
}