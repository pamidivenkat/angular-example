// import { addOrUpdateAtlasParamValue } from '../../../root-module/common/extract-helpers';
import { LoadChecklistStatsAction } from './../../actions/checklist.actions';
import { RouteParams } from './../../../shared/services/route-params';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BehaviorSubject, Subject, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AeBannerTheme } from '../../../atlas-elements/common/ae-banner-theme.enum';
import { AeDatasourceType } from '../../../atlas-elements/common/ae-datasource-type';
import { AeAutoCompleteModel } from '../../../atlas-elements/common/models/ae-autocomplete-model';
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';
import { AeSplitButtonOption } from '../../../atlas-elements/common/models/ae-split-button-options';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../shared/reducers';
import { Workspace } from '../../models/workspace.model';
import { ChecklistService } from '../../services/checklist.service';
import { ChecklistSecurityService } from '../../services/cheklist-security.service';
import { ChecklistConstants } from './../../checklist-constants';

@Component({
  selector: 'checklist-container',
  templateUrl: './checklist-container.component.html',
  styleUrls: ['./checklist-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ChecklistContainerComponent extends BaseComponent implements OnInit {
  private _addChecklistCommand = new Subject<boolean>();
  private _addExampleChecklistCommand = new Subject<boolean>();
  private _splitButtonOptions: BehaviorSubject<AeSplitButtonOption<boolean>[]> = new BehaviorSubject<AeSplitButtonOption<boolean>[]>([
    new AeSplitButtonOption<boolean>('Add checklist', this._addChecklistCommand, false),
    new AeSplitButtonOption<boolean>('Add example checklist', this._addExampleChecklistCommand, false),
  ]);
  private _todaysChecklistUrl = ChecklistConstants.Routes.TodaysChecklist;
  private _scheduledUrl = ChecklistConstants.Routes.Scheduled;
  private _archivedUrl = ChecklistConstants.Routes.Archived;
  private _completeIncompleteStatusUrl = ChecklistConstants.Routes.CompleteIncompleteStatus;
  private _companyChecklistsUrl = ChecklistConstants.Routes.CompanyChecklists;
  private _examplesUrl = ChecklistConstants.Routes.Examples;
  private _workspaceListDataSubscription: Subscription;
  private _workSpaceItems: Array<Workspace>;
  private _dataSourceType: AeDatasourceType = AeDatasourceType.Local;
  private _archivedExampleUrl = ChecklistConstants.Routes.ArchivedExample;
  aeBannerTheme = AeBannerTheme.Default;
  private _routeParamsSub: Subscription;
  private _cidExists$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private _statsSubscription: Subscription;
  private _statsChecklist: Array<any>;
  private _statsParams: Array<any>;


  get cidExists$(): BehaviorSubject<boolean> {
    return this._cidExists$;
  }

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Checklist;
  }

  get workSpaceItems() {
    return this._workSpaceItems;
  }

  get dataSourceType() {
    return this._dataSourceType;
  }

  get splitButtonOptions(): BehaviorSubject<AeSplitButtonOption<boolean>[]> {
    return this._splitButtonOptions;
  }


  //constructor start
  /**
   * Creates an instance of ChecklistContainerComponent.
   * @param {LocaleService} _localeService 
   * @param {TranslationService} _translationService 
   * @param {ChangeDetectorRef} _cdRef 
   * 
   * @memberOf ChecklistContainerComponent
   */
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _router: Router
    , private _routerParams: ActivatedRoute
    , private _claimsHelper: ClaimsHelperService
    , private _checklistService: ChecklistService
    , private _store: Store<fromRoot.State>
    , private _checkListSecurityService: ChecklistSecurityService
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);
  }
  //end of constructor
  navigateToAdd() {
    let navigationExt: NavigationExtras = {
      queryParamsHandling: 'merge'
    }
    this._router.navigate(["/checklist/add"], navigationExt);
  }

  navigateToAddExample() {
    this._router.navigate(["/checklist/add/example"]);
  }
  ngOnInit() { 
    this._addChecklistCommand.subscribe(() => {
      this.navigateToAdd();
    });
    this._addExampleChecklistCommand.subscribe(() => {
      this.navigateToAddExample();
    });
    if (this.canCreateChecklist() || this.canCreateExampleChecklist()) {
      this._workspaceListDataSubscription = this._store.let(fromRoot.getWorkSpaceTypeOptionListData).subscribe((res) => {
        if (!isNullOrUndefined(res)) {
          this._workSpaceItems = res;
        } else {
          this._checklistService.LoadWorkSpaceTypes();
        }
      });
    }
    let cid = this._routeParamsService.Cid;
    if (!isNullOrUndefined(cid)) {
      //if cid exists then we should remove the add example check list option from split button options 
      this._cidExists$.next(true);
      this._splitButtonOptions.next([
        new AeSplitButtonOption<boolean>('Add checklist', this._addChecklistCommand, false)
      ])
    }
    this._store.dispatch(new LoadChecklistStatsAction(this._statsParams));
    this._statsSubscription = this._store.let(fromRoot.getChecklistStats).subscribe((res) => {
      if (!isNullOrUndefined(res)){
        this._statsChecklist = res;
        this._cdRef.markForCheck();
      }
    })

  }
  onSplitBtnClick(event: any) {
  }

  ChecklistCount(folder) {
    let folderdata = 0;
    if (!isNullOrUndefined(this._statsChecklist)) {
      let item = this._statsChecklist.find(field => field.Folder === folder);
      if (!isNullOrUndefined(item)) {
        folderdata = this._statsChecklist.find(field => field.Folder === folder).Count;
        //this._cdRef.markForCheck();
      }
    }
    return folderdata;
  }

  getTodaysChecklistUrl(): string {
    return this._todaysChecklistUrl;
  }
  getScheduledUrl(): string {
    return this._scheduledUrl;
  }

  getArchivedUrl(): string {
    return this._archivedUrl;
  }
  getCompleteIncompleteStatusUrl(): string {
    return this._completeIncompleteStatusUrl;
  }
  getCompanyChecklistsUrl(): string {
    return this._companyChecklistsUrl;
  }
  getExamplesUrl(): string {
    return this._examplesUrl;
  }
  canCreateChecklist(): boolean {
    return this._claimsHelper.canCreateChecklist();
  }

  canCreateExampleChecklist(): boolean {
    return this._claimsHelper.canCreateExampleChecklist();
  }
  getArchivedExampleUrl(): string {
    return this._archivedExampleUrl;
  }
  canAddCheckListToClient(): boolean {
    return this._claimsHelper.isHSConsultant();
  }
  onChecklistNameFilterChange($event: any) {
    let object = [];
    if (!isNullOrUndefined(this._statsParams)) {
      let filterParams = this._statsParams.filter(c => {
        return c.hasOwnProperty("globalNameFilterValue");
      });
      if (!isNullOrUndefined(filterParams) && filterParams.length > 0)
        filterParams[0].globalNameFilterValue = $event.event.target.value;
      else {
        this._statsParams.push({ 'globalNameFilterValue': $event.event.target.value });
      }
    } else {
      object.push({ 'globalNameFilterValue': $event.event.target.value });
      this._statsParams = object;
    }
    this._store.dispatch(new LoadChecklistStatsAction(this._statsParams));
    this._checklistService.FilterByChecklistName($event.event.target.value);
  }
  onWorkSpaceSelected(selected: Array<AeAutoCompleteModel<Workspace>>) {
    let workspaceId: string = '';
    if (!isNullOrUndefined(selected)) {
      selected.forEach((workspace, index) => {
        workspaceId += workspace.Value;
        if (index !== (selected.length - 1)) {
          workspaceId += ',';
        }
      });
    }
    let object = [];
    if (!isNullOrUndefined(this._statsParams)) {
      let filterParams = this._statsParams.filter(c => {
        return c.hasOwnProperty("camaListOfSelectedWorkSpaces");
      })
      if (!isNullOrUndefined(filterParams) && filterParams.length > 0)
        filterParams[0].camaListOfSelectedWorkSpaces = workspaceId;
      else {
        this._statsParams.push({ 'camaListOfSelectedWorkSpaces': workspaceId });
      }
    } else {
      object.push({ 'camaListOfSelectedWorkSpaces': workspaceId });
      this._statsParams = object;
    }
    this._store.dispatch(new LoadChecklistStatsAction(this._statsParams));
    this._checklistService.FilterByWorkSpace(workspaceId);
  }
  onClearSelected($event: any) {
    this._checklistService.FilterByWorkSpace('');
  }
  canView(tabName: string) {
    return this._checkListSecurityService.canView(tabName);
  }
  ngOnDestroy() {
    if (this._statsSubscription) {
      this._statsSubscription.unsubscribe();
    }
    if (this._routeParamsSub) {
      this._routeParamsSub.unsubscribe();
    }
    if (this._workspaceListDataSubscription)
      this._workspaceListDataSubscription.unsubscribe();
  }
}