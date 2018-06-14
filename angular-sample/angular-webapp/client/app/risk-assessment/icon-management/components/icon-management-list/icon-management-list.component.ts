import { LoadIconAction, UpdateIconAction } from '../../actions/icon-add-update.actions';
import { IconType } from '../../models/icon-type.enum';
import { Icon } from '../../models/icon';
import { Control } from '../../../models/control';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation, OnDestroy, EventEmitter, Output } from '@angular/core';
import { HazardCategory } from "../../../common/hazard-category-enum";
import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import * as Immutable from 'immutable';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { AtlasApiRequestWithParams, AtlasApiRequest, AtlasParams } from '../../../../shared/models/atlas-api-response';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../../../shared/reducers';
import { AeDataTableAction } from '../../../../atlas-elements/common/models/ae-data-table-action';
import { Subscription, Subject, BehaviorSubject } from 'rxjs';
import { LoadHazardsOrControlsListAction, RemoveIconItemAction, BulkRemoveIconItemAction, } from '../../../../risk-assessment/icon-management/actions/icon-management-actions';
import { SortDirection } from '../../../../atlas-elements/common/models/ae-sort-model';
import { addOrUpdateAtlasParamValue } from '../../../../root-module/common/extract-helpers';
import { Hazard } from '../../../../risk-assessment/models/hazard';
import { isNullOrUndefined } from 'util';
import { getCategoryText, getControlCategoryText } from '../../../../risk-assessment/common/extract-helper';
import { IconManagementConstants } from '../../../../risk-assessment/icon-management/icon-management-constants';
import { ActivatedRoute, Router } from '@angular/router';
import { ControlsCategory } from '../../../../risk-assessment/common/controls-category-enum';
import { IconItem, BulkIcons } from '../../../../risk-assessment/icon-management/models/remove-icon-item';
import { getAeSelectItemsFromEnum } from '../../../../shared/helpers/extract-helpers';
import { ControlIconCategory } from '../../../../risk-assessment/icon-management/models/control-icon-category.enum';
import { HazardIconCategory } from '../../../../risk-assessment/icon-management/models/hazard-icon-category.enum';

@Component({
  selector: 'icon-management-list',
  templateUrl: './icon-management-list.component.html',
  styleUrls: ['./icon-management-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class IconManagementListComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private MINIMUM_ITEMS_SELECTION: number = 1;
  private _actions: Immutable.List<AeDataTableAction>;
  private _hazardOrControlsCategoryList: Immutable.List<AeSelectItem<number>> = Immutable.List([]);
  private _hazardFilterForm: FormGroup;
  private _hazardsOrControlsDataTableOptions$: Observable<DataTableOptions>;
  private _hazardsOrControlsListTotalCount$: Observable<number>;
  private _hazardsOrControlsListLoaded$: Observable<boolean>;
  private _hazardsOrControlsList$: Observable<Immutable.List<Hazard>>;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _hazardsOrControlsListLoadedSubscription: Subscription;
  private _viewDocumentCommand = new Subject();
  private _viewDocumentCommandSub: Subscription;
  private _removeActionCommand = new Subject();
  private _removeActionCommandSubscription: Subscription;
  private _selectedDocument: any;
  private _updateIconActionCommand = new Subject();
  private _updateIconActionCommandSub: Subscription;
  private _isInititialLoad: boolean = true;
  private _showRemoveIconDialog: boolean = false;
  private _buttonYesText: string = "";
  private _buttonNoText: string = "";
  private _dialogHeaderText: string = "";
  private _dialogBodyText: string = "";
  private _currentSelectedIcon: any;
  private _clearCheckboxSelection: BehaviorSubject<boolean>;
  private _checkedIcons: Array<string>;
  private _showBulkRemoveIconDialog: boolean = false;
  private _removeIconSubscription: Subscription;
  private _bulkRemoveIconsSubscription: Subscription;
  private _deleteActionCommand = new Subject();
  private _deleteActionCommandSub: Subscription;
  private _routePath: string;
  private _folder: any;
  private _showDetails: boolean;
  private _keys = Immutable.List(['Id', 'Name', 'PictureId', 'Description', 'Category', 'CreatedBy', 'IsExample']);
  private _apiRequest: AtlasApiRequestWithParams;
  private _showIconUpdateSlideOut: boolean;
  private _selectedIcon: Icon;
  private _iconAction: string;
  private _iconType: IconType;
  private _allowInputPropageChange: boolean = false;
  private _selectedIconSubscription: Subscription;
  private _iconAddUpdateCompleteSubscription: Subscription;
  // End of Private Fields

  // Public properties

  get allowInputPropageChange(): boolean {
    return this._allowInputPropageChange;
  }
  
  get hazardOrControlsCategoryList() {
    return this._hazardOrControlsCategoryList;
  }

  get lightClass() {
    return this._lightClass;
  }
  
  get hazardFilterForm(): FormGroup {
    return this._hazardFilterForm;
  }

  get hazardOrControlsData$(): Observable<Immutable.List<any>> {
    return this._hazardsOrControlsList$;
  }
  get actions(): Immutable.List<AeDataTableAction> {
    return this._actions;
  }
  get hazardsOrControlsTotalCount$(): Observable<number> {
    return this._hazardsOrControlsListTotalCount$;
  }
  get hazardsOrControlsTableOptions$(): Observable<DataTableOptions> {
    return this._hazardsOrControlsDataTableOptions$;
  }
  get hazardsOrControlsLoaded$(): Observable<boolean> {
    return this._hazardsOrControlsListLoaded$;
  }
  get keys(): Immutable.List<string> {
    return this._keys;
  }

  get selectedIcon(): Icon {
    return this._selectedIcon;
  }
  get iconAction(): string {
    return this._iconAction;
  }
  get showRemoveIconDialog(): boolean {
    return this._showRemoveIconDialog;
  }

  get buttonNoText() {
    return this._buttonNoText;
  }

  get buttonYesText() {
    return this._buttonYesText;
  }

  get dialogHeaderText() {
    return this._dialogHeaderText;
  }

  get dialogBodyText() {
    return this._dialogBodyText;
  }

  get clearCheckboxSelection() {
    return this._clearCheckboxSelection;
  }

  get showBulkRemoveIconDialog() {
    return this._showBulkRemoveIconDialog;
  }

  get iconsApiRequest(): AtlasApiRequestWithParams {
    return this._apiRequest;
  }

  get selectedDocument() {
    return this._selectedDocument;
  }
  get viewDocumentCommand() {
    return this._viewDocumentCommand;
  }
  get showDetails() {
    return this._showDetails;
  }

  get iconType(): IconType {
    return this._iconType;
  }
  // End of Public properties


  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _fb: FormBuilder
    , private _store: Store<fromRoot.State>
    , private _router: Router
    , private _route: ActivatedRoute
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
    this.id = "icon-management-list";
    this.name = "icon-management-list";

  }

  // End Of constructor

  ngOnInit() {
    this._routePath = this._route.snapshot.url[0].path;
    this._folder = this._getFolderByRoutePath(this._routePath);
    this._prepareFiltersData();
    this._initForm();
    this._clearCheckboxSelection = new BehaviorSubject<boolean>(false);
    this._hazardsOrControlsListLoaded$ = this._store.let(fromRoot.getHazardsOrControlsListLoadingState);
    this._hazardsOrControlsList$ = this._store.let(fromRoot.getHazardsOrControlsData);
    this._hazardsOrControlsListTotalCount$ = this._store.let(fromRoot.getHazardsOrControlsListTotalCountData);
    this._hazardsOrControlsDataTableOptions$ = this._store.let(fromRoot.getHazardsOrControlsListDataTableOptionsData);

    this._hazardsOrControlsListLoadedSubscription = this._store.let(fromRoot.getHazardsOrControlsApiRequestData).subscribe(apiRequest => {
      if (this._isInititialLoad) {
        this._isInititialLoad = false;
        this.initialLoad();
      }
    });

    this._setActions();

    this._hazardFilterForm.valueChanges.subscribe(data => {
      this.IconsLoadWithFilters(data);
    });

    this._removeActionCommandSubscription = this._removeActionCommand.subscribe((iconItem) => {
      this.setCurrentSelectedIconItem(iconItem);
      this.setDialogContent("ICON_MANAGEMENT.REMOVE_ICON", iconItem);
      this.setRemoveIconDialogStatus(true);
    });

    this._removeIconSubscription = this._store.let(fromRoot.getRemoveActionStatus).subscribe((removedItem) => {
      if (removedItem) {
        this._reloadListOnIconRemove();
      }
    });

    this._bulkRemoveIconsSubscription = this._store.let(fromRoot.getBulkRemoveActionStatus).subscribe((bulkRemove) => {
      if (bulkRemove) {
        this._reloadListOnIconRemove();
      }
    });
    this._viewDocumentCommandSub = this._viewDocumentCommand.subscribe(doc => {
      this._selectedDocument = doc;
      this.selectedDocument.CategoryText = this.getCategoryText(this._selectedDocument.Category);
      this._selectedDocument.CategoryType = this._folder;
      this._showDetails = true;
    });
    this._updateIconActionCommandSub = this._updateIconActionCommand.subscribe((rowData: Hazard) => {
      this._iconAction = 'Update';
      this._iconType = this._getIconType();
      this._showIconUpdateSlideOut = true;
      this._store.dispatch(new LoadIconAction({ id: rowData.Id, type: this._iconType }));
    });

    this._selectedIconSubscription = this._store.let(fromRoot.getSelectedIcon).subscribe((icon: Icon) => {
      if (!isNullOrUndefined(icon)) {
        this._selectedIcon = icon;
      }
    });
    this._iconAddUpdateCompleteSubscription = this._store.let(fromRoot.getIconAddUpdateCompleteStatus).subscribe(status => {
      if (status && !isNullOrUndefined(this._hazardFilterForm)) {
        this._hazardFilterForm.reset();
      }
    });
  }

  ngOnDestroy() {
    this._hazardsOrControlsListLoadedSubscription.unsubscribe();
    this._removeActionCommandSubscription.unsubscribe();
    this._removeIconSubscription.unsubscribe();
    this._bulkRemoveIconsSubscription.unsubscribe();
    this._updateIconActionCommand.unsubscribe();
    this._selectedIconSubscription.unsubscribe();
    this._hazardsOrControlsListLoadedSubscription.unsubscribe();
  }

  // Public methods

  public onGridPaging($event) {
    this._apiRequest.PageNumber = $event.pageNumber;
    this._apiRequest.PageSize = $event.noOfRows;
    this._store.dispatch(new LoadHazardsOrControlsListAction(this._apiRequest));
  }
  public onGridSorting($event) {
    this._apiRequest.SortBy.SortField = $event.SortField;
    this._apiRequest.SortBy.Direction = $event.Direction;
    this._store.dispatch(new LoadHazardsOrControlsListAction(this._apiRequest));
  }

  public noneRowsChecked() {
    if (isNullOrUndefined(this._checkedIcons)
      || this._checkedIcons.length < this.MINIMUM_ITEMS_SELECTION)
      return true;
  }

  public onSelectedRows(selectedIcons: Array<string>) {
    this._checkedIcons = selectedIcons;
  }

  public removeIconAction() {
    if (this.isControlsTab()) {
      this.dispatchRemoveControlIcon();
    }
    else if (this.isHazardsTab()) {
      this.dispatchRemoveHazardIcon();
    }
  }

  public bulkRowsRemoveClick() {
    this.setBulkRemoveIconDialogStatus(true);
    let data = {};
    this.setDialogContent("ICON_MANAGEMENT.BULK_REMOVE_ICON", data);
  }

  public bulkmodalClose(event: any) {
    this.setBulkRemoveIconDialogStatus(false);
    this._checkedIcons = null;
    this._clearCheckboxSelection.next(true);
  }

  public modalClose($event: any) {
    this.setRemoveIconDialogStatus(false);
  }

  public removeIcon($event: any) {
    this.setRemoveIconDialogStatus(false);
    this.removeIconAction();
  }



  public bulkRemoveIcons() {
    this.setBulkRemoveIconDialogStatus(false);
    this.dispatchBulkRemoveIcons();
  }

  public getPictureUrl(pictureId: string, isExample: boolean): string {
    if (!isNullOrUndefined(pictureId)) {
      let baseURL = window.location.protocol + "//" + window.location.host;

      if (isExample) {
        return baseURL + "/filedownload?documentId=" + pictureId + "&isSystem=true";
      }
    }
    else {
      return '/assets/images/hazard-default.png';
    }

  }

  public getCategoryText(status): string {
    if (this._routePath == IconManagementConstants.Routes.Hazards) {
      return getCategoryText(status);
    }
    else {
      return getControlCategoryText(status);
    }
  }

  public searchFilterPlaceHolder() {
    if (this._routePath == IconManagementConstants.Routes.Hazards) {
      return "ICON_MANAGEMENT.SEARCH_HAZARD_TEXT";
    }
    else {
      return "ICON_MANAGEMENT.SEARCH_CONTROLS_TEXT";
    }
  }
  public showIconUpdateSlideOut(): boolean {
    return this._showIconUpdateSlideOut;
  }
  public cancelUpdateIcon() {
    this._showIconUpdateSlideOut = false;
    this._selectedIcon = null;
  }
  public updateIconSubmit(icon: Icon) {
    this._showIconUpdateSlideOut = false;
    this._selectedIcon = null;
    this._hazardFilterForm.reset();
    this._store.dispatch(new UpdateIconAction({ icon: icon, type: this._iconType }));
  }

  public getSlideoutState(): string {
    return this._showDetails ? 'expanded' : 'collapsed';
  }
  public getIconUpdateSlideOutState(): string {
    return this._showIconUpdateSlideOut ? 'expanded' : 'collapsed';
  }
  public getSlideoutAnimateState() {
    return this._showDetails;
  }
  public onDetailsCancel(e) {
    this._showDetails = false;
  }
  public showDocumentDetailsSlideOut() {
    return this._showDetails;
  }
  // End Public methods

  // Private methods

  private _setActions() {
    this._actions = Immutable.List([
      new AeDataTableAction("View", this._viewDocumentCommand, false),
      new AeDataTableAction("Update", this._updateIconActionCommand, false),
      new AeDataTableAction("Remove", this._removeActionCommand, false)
    ]);
  }

  private _prepareFiltersData() {

    this._hazardOrControlsCategoryList = getAeSelectItemsFromEnum(this._routePath != IconManagementConstants.Routes.Hazards ? ControlIconCategory : HazardIconCategory);

  }

  private _getIconType(): IconType {
    return (this._routePath == IconManagementConstants.Routes.Hazards) ? IconType.Hazard : IconType.Control;
  }


  private _initForm() {
    this._hazardFilterForm = this._fb.group({
      category: [{ value: '', disabled: false }],
      name: [{ value: '', disabled: false }]
    });
  }

  private _getFolderByRoutePath(routePath: string) {
    let folder: string;
    switch (routePath) {
      case IconManagementConstants.Routes.Hazards:
        folder = "hazard";
        break;
      case IconManagementConstants.Routes.Controls:
        folder = "control";
        break;
      default:
        folder = "hazard";
        break;
    }
    return folder;
  }


  private _reloadListOnIconRemove() {
    this._checkedIcons = null;
    this._clearCheckboxSelection.next(true);
    this._apiRequest.PageNumber = 1;
    this._store.dispatch(new LoadHazardsOrControlsListAction(this._apiRequest));
  }

  private IconsLoadWithFilters(data: any) {
    this._checkedIcons = null;
    this._clearCheckboxSelection.next(true);
    this._apiRequest.PageNumber = 1;
    this._apiRequest.Params = addOrUpdateAtlasParamValue(this._apiRequest.Params, 'folder', this._folder);
    this._apiRequest.Params = addOrUpdateAtlasParamValue(this._apiRequest.Params, 'category', data.category);
    this._apiRequest.Params = addOrUpdateAtlasParamValue(this._apiRequest.Params, 'searchText', data.name);
    this._store.dispatch(new LoadHazardsOrControlsListAction(this._apiRequest));
  }

  private initialLoad() {
    let params: AtlasParams[] = new Array();
    this._apiRequest = new AtlasApiRequestWithParams(1, 10, 'Name', SortDirection.Ascending, params);
    this._apiRequest.Params = addOrUpdateAtlasParamValue(this._apiRequest.Params, 'folder', this._folder);
    this._apiRequest.Params = addOrUpdateAtlasParamValue(this._apiRequest.Params, 'category', '');
    this._apiRequest.Params = addOrUpdateAtlasParamValue(this._apiRequest.Params, 'searchText', '');
    this._store.dispatch(new LoadHazardsOrControlsListAction(this._apiRequest));
  }

  private isControlsTab() {
    if (isNullOrUndefined(this._folder)) return false;
    return this._folder.toLowerCase() === "control";
  }

  private isHazardsTab() {
    if (isNullOrUndefined(this._folder)) return false;
    return this._folder.toLowerCase() === "hazard";
  }

  private setCurrentSelectedIconItem(iconItem: any) {
    this._currentSelectedIcon = iconItem;
  }

  private setRemoveIconDialogStatus(removeIonDialogStatus: boolean) {
    this._showRemoveIconDialog = removeIonDialogStatus;
  }

  private setBulkRemoveIconDialogStatus(bulkRemoveIconDialogStatus: boolean) {
    this._showBulkRemoveIconDialog = bulkRemoveIconDialogStatus;
  }

  private setDialogContent(dialogType: string, icon: any) {
    this._dialogHeaderText = this._translationService.translate(dialogType + '.Heading_text', { iconType: this._folder });
    this._dialogBodyText = this._translationService.translate(dialogType + '.Info', { iconName: icon.Name });
    this._buttonYesText = this._translationService.translate(dialogType + '.Btn_Yes');
    this._buttonNoText = this._translationService.translate(dialogType + '.Btn_No');
  }

  private dispatchRemoveControlIcon() {
    let iconItem = new IconItem<Control>();
    iconItem.Type = this._folder;
    iconItem.Entity = this._currentSelectedIcon;
    this._store.dispatch(new RemoveIconItemAction(iconItem));
  }

  private dispatchRemoveHazardIcon() {
    let iconItem = new IconItem<Hazard>();
    iconItem.Type = this._folder;
    iconItem.Entity = this._currentSelectedIcon;
    this._store.dispatch(new RemoveIconItemAction(iconItem));
  }

  private dispatchBulkRemoveIcons() {
    let bulkIcons = new BulkIcons();
    bulkIcons.Type = this._folder;
    bulkIcons.Icons = this._checkedIcons;
    this._store.dispatch(new BulkRemoveIconItemAction(bulkIcons));
  }
  // End of private methods

}
