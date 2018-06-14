import { EmployeeSecurityService } from './../../../services/employee-security-service';
import { AeClassStyle } from '../../../../atlas-elements/common/ae-class-style.enum';
import { DataTableOptions } from '../../../../atlas-elements/common/models/ae-datatable-options';
import { Tristate } from '../../../../atlas-elements/common/tristate.enum';
import { AeDataTableAction } from '../../../../atlas-elements/common/models/ae-data-table-action';
import { EmployeeEvent } from '../../models/emloyee-event';
import {
  EmployeeLoadTimelineLoadAction,
  LoadEmployeeEvent,
  LoadEmployeeTimelineOnFiltersChange,
  LoadEmployeeTimelineOnPageChangeAction,
  LoadEmployeeTimelineOnSortAction
} from '../../../actions/employee.actions';
import { AeSplitButtonOption } from '../../../../atlas-elements/common/models/ae-split-button-options';
import { AeIconSize } from '../../../../atlas-elements/common/ae-icon-size.enum';
import { isNull, isNullOrUndefined } from 'util';
import { EventType, Sensitivity, Timeline } from '../../../models/timeline';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs/Rx';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  Output,
  EventEmitter
} from '@angular/core';
import * as fromRoot from '../../../../shared/reducers';
import * as Immutable from 'immutable';
import { CommonHelpers } from '../../../../shared/helpers/common-helpers';

import { AeSelectItem } from '../../../../atlas-elements/common/models/ae-select-item';
import { EnumHelper } from '../../../../shared/helpers/enum-helper';
import { extractDocumentCategorySelectItems } from '../../../../document/common/document-subcategory-extract-helper';
import { DocumentCategoryService } from '../../../../document/services/document-category-service';
import { DocumentService } from '../../../../document/services/document-service';
import { DocumentArea } from '../../../../document/models/document-area';
import { EmployeeTimelineEventTypesLoad } from '../../../../shared/actions/lookup.actions';
import { extractEventTypeSelectItems, getTimelineViewTypeOptionsForAdvance, getTimelineViewTypeOptionsForBasic } from "../../../common/extract-helpers";
import { DocumentCategory } from '../../../../document/models/document-category';
import { ObjectHelper } from '../../../../shared/helpers/object-helper';
import { Document } from '../../../../document/models/document';
import { EventTypeCode } from '../../models/event-type-code';
@Component({
  selector: 'employee-timeline',
  templateUrl: './employee-timeline.component.html',
  styleUrls: ['./employee-timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class EmployeeTimelineComponent extends BaseComponent implements OnInit, OnDestroy {
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _timelineData$: Observable<Immutable.List<Timeline>>;
  private _totalRecords$: Observable<number>;
  private _defaultDataTableOptions$: Observable<DataTableOptions>;
  private _timelineDataLoaded$: Observable<boolean>;
  private _timelineDataSubscription: Subscription;
  private _keys = ['Id', 'CategoryCode', 'Category', 'CategoryName', 'Title', 'Sensitivity', 'EmployeeId', 'ItemType', 'HasDocuments', 'CreatedOn', 'FileName', 'CreatedBy', 'ExpiryDate', 'ReminderInDays'];
  private _iconSize: AeIconSize = AeIconSize.tiny;
  private _splitButtonOptions: Array<AeSplitButtonOption<any>>;
  private _eventTypes: Array<EventType>;
  private _selectedEvent: EventType;
  private _filters: Map<string, string>;
  private _viewTypeValue = '';
  private _viewTypeOptions: Immutable.List<AeSelectItem<number>>;
  private _selectedCategory = '';
  private _categoryOptions: Immutable.List<AeSelectItem<string>>;
  private _categoryOptionsSubscription: Subscription;
  private _documentGroup: AeSelectItem<string>;
  private _eventTypeOptionsSubscription: Subscription;
  private _eventTypeGroup: AeSelectItem<string>;
  private _canSeeSensitive: boolean;
  private _canSeeAdvance: boolean;
  private _canManageDeptEmployees: boolean;
  private _actions: Immutable.List<AeDataTableAction>;
  private _editEventAction: Subject<Timeline> = new Subject<Timeline>();
  private _editEventActionSubscription: Subscription;
  private _removeEventAction: Subject<Timeline> = new Subject<Timeline>();
  private _removeEventActionSubscription: Subscription;
  private _loadSelectedEventSubscription: Subscription;
  private _loggedInUserId: string;
  private _filterCategoryOptions: Array<AeSelectItem<string>>;
  private _filterOptionsSubscription: Subscription;
  private _defaultViewOption: Immutable.List<AeSelectItem<number>>;
  private _timelineViewTypeOptions: Immutable.List<AeSelectItem<number>>;
  private _employeeId: string;
  private _employeeIdSub: Subscription;
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _documentCategoryService: DocumentCategoryService
    , private _employeeSecurityService: EmployeeSecurityService
  ) {
    super(_localeService, _translationService, _cdRef);
    this._splitButtonOptions = [];
    this._filters = new Map<string, string>();
    this._canSeeSensitive = this._claimsHelper.canManageEmployeeSensitiveDetails();
    this._canSeeAdvance = this._claimsHelper.CanManageEmployeeAdvanceeDetails();
    this._canManageDeptEmployees = this._claimsHelper.canManageDeptEmps();
    this._loggedInUserId = this._claimsHelper.getUserId();
    this._filterCategoryOptions = new Array<AeSelectItem<string>>();
    this._defaultViewOption = Immutable.List([
      new AeSelectItem<number>('All types', null, false)
    ]);
  }


  //Public Output bindings
  @Output('onAddClick') _addNewClick: EventEmitter<any> = new EventEmitter<any>();
  @Output('onUpdateClick') _updateClick: EventEmitter<any> = new EventEmitter<any>();
  @Output('onRemoveClick') _removeClick: EventEmitter<any> = new EventEmitter<any>();
  @Output('onDetailsClick') _detailsClick: EventEmitter<any> = new EventEmitter<any>();
  //End of Public Output bindings

  get lightClass() {
    return this._lightClass;
  }

  get categoryOptions(): Immutable.List<AeSelectItem<string>> {
    return this._categoryOptions;
  }
  get selectedCategory() {
    return this._selectedCategory;
  }
  get timelineViewTypeOptions(): Immutable.List<AeSelectItem<number>> {
    return this._timelineViewTypeOptions;
  }
  get viewTypeValue() {
    return this._viewTypeValue;
  }
  get splitButtonOptions(): Array<AeSplitButtonOption<any>> {
    return this._splitButtonOptions;
  }
  get timelineData$(): Observable<Immutable.List<Timeline>> {
    return this._timelineData$;
  }
  get totalRecords$(): Observable<number> {
    return this._totalRecords$;
  }
  get defaultDataTableOptions$(): Observable<DataTableOptions> {
    return this._defaultDataTableOptions$;
  }
  get timelineDataLoaded$(): Observable<boolean> {
    return this._timelineDataLoaded$;
  }
  get actions(): Immutable.List<AeDataTableAction> {
    return this._actions;
  }
  get keys() {
    return this._keys;
  }
  get iconSize(): AeIconSize {
    return this._iconSize;
  }

  getSensitivityName(sensitivity: Sensitivity): string {
    switch (sensitivity) {
      case Sensitivity.Basic:
        return 'Basic';
      case Sensitivity.Advance:
        return 'Advanced';
      case Sensitivity.Sensitive:
        return 'Sensitive';
    }
    return '';
  }

  getTitle(title: string, fileName: string): string {
    if (!isNullOrUndefined(title))
      return title;
    if (!isNullOrUndefined(fileName))
      return fileName.split('.')[0];

    return '';
  }

  private _commandSelector(item: Timeline): Tristate {
    let canEditPersonalDocument = false;
    let canManage = false;
    if (item.ItemType === 1 && (item.CategoryCode === 9008 || item.CategoryCode === 65543) && (item.CreatedBy != this._loggedInUserId)) {
      canEditPersonalDocument = false;
    } else if (item.ItemType === 2) {
      canEditPersonalDocument = true;
    } else {
      canEditPersonalDocument = true;
    }

    if (this._canSeeSensitive && canEditPersonalDocument) {
      canManage = true;
    } else if ((this._canSeeAdvance || this._canManageDeptEmployees) && (item.Sensitivity === Sensitivity.Basic || item.Sensitivity === Sensitivity.Advance) && canEditPersonalDocument) {
      canManage = true;
    } else {
      canManage = false;
    }
    return canManage ? Tristate.True : Tristate.False;
  }
  public canManageTimeLine() {
    return this._employeeSecurityService.CanUpdateTimeline(this._employeeId);
  }
  ngOnInit() {
    this._actions = Immutable.List([
      new AeDataTableAction("Update", this._editEventAction, false, (item) => { return this._commandSelector(item) }),
      new AeDataTableAction("Remove", this._removeEventAction, false, (item) => { return this._commandSelector(item) })
    ]);

    if (this._canSeeSensitive) {
      this._viewTypeOptions = ObjectHelper.generatAeselectItemsForSensitivityFromEnum(Sensitivity);
    }
    else if (this._canSeeAdvance || this._canManageDeptEmployees) {
      this._viewTypeOptions = getTimelineViewTypeOptionsForAdvance(Sensitivity);
    }
    else {
      this._viewTypeOptions = getTimelineViewTypeOptionsForBasic(Sensitivity);
    }
    this._timelineViewTypeOptions = Immutable.List(this._defaultViewOption.toArray().concat(this._viewTypeOptions.toArray()));
    this._timelineDataLoaded$ = this._store.let(fromRoot.getTimelineLoadStatus);
    this._store.dispatch(new EmployeeLoadTimelineLoadAction(true));

    this._employeeIdSub = this._store.let(fromRoot.getEmployeePersonalData).subscribe((val) => {
      if (val) {
        this._employeeId = val.Id;
      }
    });

    this._timelineData$ = this._store.let(fromRoot.getTimelineData);
    this._totalRecords$ = this._store.let(fromRoot.getEmployeeTimelineTotalCount);
    this._defaultDataTableOptions$ = this._store.let(fromRoot.getEmployeeTimelineDataTableOption);

    // Options for catergory dropdown - start
    this._documentCategoryService.loadDocumentCategories();
    this._store.dispatch(new EmployeeTimelineEventTypesLoad(true));
    let dc = this._store.let(fromRoot.getDocumentCategoriesData).skipWhile(val => isNullOrUndefined(val));
    let et = this._store.let(fromRoot.getEmployeeTimelineEventTypeList).skipWhile(val => isNullOrUndefined(val));

    let combineDocumentCategoriesWithEventTypes = Observable.combineLatest(dc, et, (documentCategories, eventTypes) => {
      if (!isNullOrUndefined(documentCategories)) {
        let categorylist = this._documentCategoryService.getDocumentCategoriesByArea(<Array<DocumentCategory>>documentCategories, DocumentArea.EmployeeDocuments);
        this._documentGroup = new AeSelectItem<string>('Document', '', false);
        this._documentGroup.Childrens = extractDocumentCategorySelectItems(categorylist);
      }
      if (!isNullOrUndefined(eventTypes)) {
        this._eventTypes = <EventType[]>eventTypes;
        this._splitButtonOptions = [];
        this._eventTypeGroup = new AeSelectItem<string>('Event', '', false);
        this._eventTypeGroup.Childrens = extractEventTypeSelectItems(<EventType[]>eventTypes);
        this._splitButtonOptions.push(new AeSplitButtonOption('Document', this._getOption(this._addNewEvent), false));
        this._eventTypes.forEach(eventType => {
          if (!this._canSeeSensitive && (eventType.Title === 'Leaver' || eventType.Title === 'Grievance')) {
            //Leaver and Grievance only available for users who has canManageEmployeeSensitiveDetails permission;
          } else {
            this._splitButtonOptions.push(new AeSplitButtonOption(eventType.Title, this._getOption(this._addNewEvent), false));
          }

        });
      }
      if (!isNullOrUndefined(documentCategories) && !isNullOrUndefined(eventTypes)) {
        this._categoryOptions = Immutable.List([this._documentGroup, this._eventTypeGroup]);
      }
    });
    this._filterOptionsSubscription = combineDocumentCategoriesWithEventTypes.subscribe();
    // Options for catergory dropdown - end

    this._editEventActionSubscription = this._editEventAction.subscribe((item: Timeline) => {
      if (item.ItemType !== 1) {
        this._selectedEvent = this._eventTypes.find(e => e.Id.toLowerCase() === item.Category.toLowerCase());
      }
      this._updateClick.emit({ selectedItem: item, selectedEvent: this._selectedEvent });

    });

    this._removeEventActionSubscription = this._removeEventAction.subscribe((item: Timeline) => {
      this._removeClick.emit({ selectedItem: item });
    });

  }

  ngOnDestroy(): void {
    if(this._employeeIdSub){
      this._employeeIdSub.unsubscribe();
    }
    if (this._editEventActionSubscription)
      this._editEventActionSubscription.unsubscribe();
    if (this._removeEventActionSubscription)
      this._removeEventActionSubscription.unsubscribe();
    if (this._filterOptionsSubscription) {
      this._filterOptionsSubscription.unsubscribe;
    }
  }

  private _addNewEvent(option: any) {
    if (option.Text !== 'Document')
      this._selectedEvent = this._eventTypes.find(e => e.Title === option.Text);
    this._addNewClick.emit({ type: option.Text !== 'Document' ? 'event' : 'document', selectedEvent: this._selectedEvent });
  }
  private _getOption(fn: Function) {
    let sub = new Subject();
    sub.subscribe((v) => {
      fn.call(this, v);
    })
    return sub;
  }

  onGridPageChange($event: any) {
    this._store.dispatch(new LoadEmployeeTimelineOnPageChangeAction({ pageNumber: $event.pageNumber, noOfRows: $event.noOfRows }));
  }

  onSortChange($event: any) {
    this._store.dispatch(new LoadEmployeeTimelineOnSortAction({ SortField: $event.SortField, Direction: $event.Direction }));
  }

  private _setFilters(key: string, value: string) {
    if (this._filters === null) {
      this._filters = new Map<string, string>();
    }
    if (this._filters.has(key)) {
      this._filters.delete(key);
    }
    this._filters.set(key, value);
    this._store.dispatch(new LoadEmployeeTimelineOnFiltersChange(this._filters));
  }

  onViewTypeChange($event: any) {
    if (!isNullOrUndefined($event.SelectedValue) && $event.SelectedValue !== "") {
      this._setFilters('employeeTimelineViewBySensitivity', $event.SelectedValue.toString());
    } else {
      this._filters.delete('employeeTimelineViewBySensitivity');
      this._store.dispatch(new LoadEmployeeTimelineOnFiltersChange(this._filters));
    }
  }

  onCategoryChange($event: any) {
    if (!isNullOrUndefined($event.SelectedValue) && $event.SelectedValue !== "") {
      this._setFilters('employeeTimelineViewByCategory', $event.SelectedValue.toString());
    } else {
      this._filters.delete('employeeTimelineViewByCategory');
      this._store.dispatch(new LoadEmployeeTimelineOnFiltersChange(this._filters));
    }
  }

  onDetailsClick(item: Timeline) {
    if (item.ItemType === 2) {
      this._selectedEvent = this._eventTypes.find(e => e.Id.toLowerCase() === item.Category.toLowerCase());
    }
    this._detailsClick.emit({ selectedItem: item, selectedEvent: this._selectedEvent });
  }
}