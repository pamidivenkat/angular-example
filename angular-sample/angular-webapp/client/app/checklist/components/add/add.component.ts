import { RouteParams } from './../../../shared/services/route-params';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OnDestroy } from '@angular/core/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { Subscription } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AeBannerTheme } from '../../../atlas-elements/common/ae-banner-theme.enum';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { BreadcrumbGroup } from '../../../atlas-elements/common/models/ae-breadcrumb-group';
import { AeWizardStep } from '../../../atlas-elements/common/models/ae-wizard-step';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../shared/reducers';
import { Checklist, Site } from '../../models/checklist.model';
import { ChecklistService } from '../../services/checklist.service';
import { BreadcrumbService } from './../../../atlas-elements/common/services/breadcrumb-service';
import { IBreadcrumb } from '../../../atlas-elements/common/models/ae-ibreadcrumb.model';

@Component({
  selector: 'checklist-add',
  templateUrl: './add.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AddCheckListComponent extends BaseComponent implements OnInit, OnDestroy {
  private _checkListSteps$: BehaviorSubject<Immutable.List<AeWizardStep>>;
  private _copySlideOut: boolean = false;
  private _checklistCopyModel: Checklist;
  private _removeConfirmation: boolean = false;
  private _archiveConfirmation: boolean = false;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _isExampleCheckList: boolean = false;
  private _isEditChecklist: boolean = false;
  private _currentCheckListItem: Checklist;
  private _activatedRoutesSubscription$: Subscription;
  private _currentChecklistSubscription$: Subscription;
  private _showComplete: boolean = false;
  private _navigationExtras: NavigationExtras;
  private _checklistTitle: string = 'Add checklist';
  aeBannerTheme = AeBannerTheme.Default;

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Checklist;
  }
  get isEditChecklist() {
    return this._isEditChecklist;
  }

  get archiveConfirmation() {
    return this._archiveConfirmation;
  }

  get removeConfirmation() {
    return this._removeConfirmation;
  }

  get checkListSteps$() {
    return this._checkListSteps$;
  }

  get showComplete() {
    return this._showComplete;
  }

  get currentCheckListItem() {
    return this._currentCheckListItem;
  }

  get copySlideOut() {
    return this._copySlideOut;
  }

  get currentCheckListItemName() {
    return this._currentCheckListItem.Name;
  }

  get lightClass() {
    return this._lightClass;
  }

  get checklistCopyModel(): Checklist {
    return this._checklistCopyModel;
  }

  get checklistTitle(): string {
    return this._checklistTitle;
  }

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , protected _checklistService: ChecklistService
    , private _activatedRoute: ActivatedRoute
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _router: Router
    , private _breadcrumbService: BreadcrumbService
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);


  }

  ngOnInit() {
    this._navigationExtras = {
      queryParamsHandling: 'merge'
    };
    this._activatedRoutesSubscription$ = this._activatedRoute.params.subscribe((params) => {
      let checklistId = params["id"];
      this._isEditChecklist = !isNullOrUndefined(checklistId) ? true : false;
      this._isExampleCheckList = params['example'] === "example" ? true : false;
      let isEdit = false;
      if (!isNullOrUndefined(checklistId)) {
        isEdit = true;
        this._checklistService.LoadChecklist({ id: checklistId, example: this._isExampleCheckList });

      }
      else {
        const bcItem: IBreadcrumb = new IBreadcrumb('Add', '/checklist/add', BreadcrumbGroup.Checklist);
        this._breadcrumbService.add(bcItem);
        this._checklistService.SetInitialState();
      }
      this._checkListSteps$ = new BehaviorSubject<Immutable.List<AeWizardStep>>(Immutable.List([
        new AeWizardStep('General', '', 'step1'),
        new AeWizardStep('Check Items', '', 'step2', true),
        new AeWizardStep('Preview', '', 'step3', true, isEdit)
      ]));
    });

    this._currentCheckListItem = new Checklist();
    let currentChecklist$ = this._store.let(fromRoot.getCurrentChecklistData);
    this._currentChecklistSubscription$ = this._store.let(fromRoot.getCurrentChecklistData).subscribe((checklist) => {
      if (!isNullOrUndefined(checklist)) {
        this._currentCheckListItem = checklist;
        this._checklistTitle = checklist.Name;
        const bcItem: IBreadcrumb = new IBreadcrumb(checklist.Name, '/checklist/edit/' + checklist.Id, BreadcrumbGroup.Checklist);
        this._breadcrumbService.add(bcItem);
      }
    });
  }

  openRemoveCheckListModal(_checkList) {
    this._removeConfirmation = true;
  }

  public onPreviousClick(e) {
    this._router.navigate(['/checklist'], this._navigationExtras);
  }

  openCopyCheckListSlide(_isExample) {
    this._checklistCopyModel = Object.assign({}, this._currentCheckListItem);
    this._checklistCopyModel.IsExample = this._isExampleCheckList && this._isClientViewingExample() ? _isExample : false;
    this._checklistCopyModel.CompanyId = this._checklistCopyModel.IsExample ? this._claimsHelper.getParentCompanyId() : this._claimsHelper.getCompanyId();
    this._checklistCopyModel.Name = null;
    this._checklistCopyModel.IsArchived = false;
    if (this._checklistCopyModel.IsExample) {
      this._checklistCopyModel.SiteId = null;
      this._checklistCopyModel.Site = null;
    } else {
      this._checklistCopyModel.SiteId = "00000000-0000-0000-0000-000000000000";
      this._checklistCopyModel.Site = { Id: "00000000-0000-0000-0000-000000000000", Name: "All sites" } as Site;
    }
    this._checklistCopyModel.SiteLocation = null;
    this._copySlideOut = true;
  }

  openArchiveCheckListModal(_checkList) {
    this._archiveConfirmation = true;
  }

  getSlideoutState(): string {
    return this._copySlideOut ? 'expanded' : 'collapsed';
  }

  closeSlideOut(e) {
    this._copySlideOut = false;
  }

  copyCheckList(_copyCLInfo) {
    this._checklistCopyModel.Name = _copyCLInfo.Name;
    if (!isNullOrUndefined(_copyCLInfo.Site))
      this._checklistCopyModel.SiteId = _copyCLInfo.Site;
    if (!isNullOrUndefined(_copyCLInfo.SiteLocation))
      this._checklistCopyModel.SiteLocation = _copyCLInfo.SiteLocation;
    if (this._routeParamsService.Cid && this._checklistCopyModel.IsExample) {
      this._checklistCopyModel.IsExample = false;
    }
    this._checklistService.CopyChecklist({ checklist: this._checklistCopyModel, isExample: this._currentCheckListItem.IsExample });
    this._copySlideOut = false;
    this._router.navigate(["/checklist"], this._navigationExtras);
  }

  removeConfirmModalClosed(event: any) {
    this._removeConfirmation = false;
  }

  removeChecklist(event: any) {
    this._checklistService.RemoveChecklist(this._currentCheckListItem);
    this._removeConfirmation = false;
    this._router.navigate(["/checklist"], this._navigationExtras);
  }

  archiveConfirmModalClosed(event: any) {
    this._archiveConfirmation = false;
  }

  archiveChecklist(event: any) {
    this._currentCheckListItem.IsArchived = true;
    this._checklistService.ArchiveOrReinstateChecklist(this._currentCheckListItem);
    this._archiveConfirmation = false;
    this._router.navigate(["/checklist"], this._navigationExtras);
  }

  private _isClientViewingExample(): boolean {
    return this._isExampleCheckList && this._claimsHelper.IsCitationUser;
  }

  private _isUsingCidAndConsultant(): boolean {
    return this._claimsHelper.getCompanyId() !== this._claimsHelper.getCompanyIdOrCid() && this._claimsHelper.canCreateExampleChecklist();
  }

  canRemoveChecklist(): boolean {
    if (this._isExampleCheckList && !this._claimsHelper.canCreateExampleChecklist()) {
      return false;
    } else if (this._isExampleCheckList) {
      return !this._isUsingCidAndConsultant();
    } else {
      return (this._claimsHelper.canCreateChecklist() || (this._routeParamsService.Cid && this._claimsHelper.isHSConsultant()));
    }
  }

  canArchiveChecklist(): boolean {
    if (this._isExampleCheckList) {
      return !this._currentCheckListItem.IsArchived && this._isClientViewingExample() && !this._isUsingCidAndConsultant();
    } else {
      return !this._currentCheckListItem.IsArchived && !this._isClientViewingExample()
    }
  }

  canCopyToLibraryChecklist(): boolean {
    return this._isClientViewingExample() && this._claimsHelper.canCreateChecklist() && !this._isUsingCidAndConsultant();
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._activatedRoutesSubscription$)) {
      this._activatedRoutesSubscription$.unsubscribe();
    }
    if (!isNullOrUndefined(this._currentChecklistSubscription$)) {
      this._currentChecklistSubscription$.unsubscribe();
    }
  }
}
