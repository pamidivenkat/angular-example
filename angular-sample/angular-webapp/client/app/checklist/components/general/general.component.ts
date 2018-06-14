import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { Observable, Subscription } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AeSelectItem } from '../../../atlas-elements/common/models/ae-select-item';
import { whiteSpaceFieldValidator } from '../../../company/nonworkingdaysandbankholidays/common/nonworkingdays-validators';
import { LoadSitesAction } from '../../../shared/actions/company.actions';
import { LoadSectorsAction, WorkSpaceTypeLoadAction } from '../../../shared/actions/lookup.actions';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { mapSiteLookupTableToAeSelectItems } from '../../../shared/helpers/extract-helpers';
import { WorkspaceTypes } from '../../../shared/models/lookup.models';
import { Sector } from '../../../shared/models/sector';
import * as fromRoot from '../../../shared/reducers';
import { Checklist, Site } from '../../models/checklist.model';
import { Workspace } from '../../models/workspace.model';
import { ChecklistService } from '../../services/checklist.service';

@Component({
    moduleId: module.id,
    selector: 'checklist-general',
    templateUrl: './general.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class GeneralComponent extends BaseComponent implements OnInit {
    @Input() context: any;

    private _locations: Immutable.List<AeSelectItem<string>>;
    private _generalTabForm: FormGroup;
    private _submitted: boolean = false;
    private _addNewLocationSiteFlag: boolean = false;
    private _isExampleAddCheckList: boolean = false;
    private _currentCheckListItem: Checklist;
    private _workspaceTypes: Array<Workspace>;
    private _sectors: Array<Sector>;
    private _siteChangeSubscription: Subscription;
    private _allSectorsSubscription: Subscription;
    private _combineDataSubscription: Subscription;
    private _stepSubscription: Subscription;
    private _formStatusChangeSubscription: Subscription;
    private _sitesSubscription: Subscription;
    private _activatedRoutesSubscription: Subscription;
    private _formStatusUpdateChangeSubscription: Subscription;
    private _defaultSiteOption: string = '00000000-0000-0000-0000-000000000000';

    get generalTabForm() {
        return this._generalTabForm;
    }

    get isExampleAddCheckList() {
        return this._isExampleAddCheckList;
    }

    get locations() {
        return this._locations;
    }

    get addNewLocationSiteFlag() {
        return this._addNewLocationSiteFlag;
    }

    get workspaceTypes() {
        return this._workspaceTypes;
    }

    constructor(protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef
        , private _fb: FormBuilder
        , private _claimsHelper: ClaimsHelperService
        , private _checklistService: ChecklistService
        , private _activatedRoute: ActivatedRoute
        , private _store: Store<fromRoot.State>) {
        super(_localeService, _translationService, _cdRef);
    }

    ngOnInit() {
        this._currentCheckListItem = new Checklist();
        this._initializeForm();
        let workspaces$ = this._store.let(fromRoot.getWorkSpaceTypeOptionListData);
        let currentChecklist$ = this._store.let(fromRoot.getCurrentChecklistData);
        let sectors$ = this._store.let(fromRoot.getsectorsData);

        let combineData = Observable.combineLatest(this._activatedRoute.params, workspaces$, sectors$, currentChecklist$, (params, workspaces, sectors, currentChecklist) => {
            let checklistId = params["id"];
            this._isExampleAddCheckList = params['example'] === "example" ? true : false;
            if (isNullOrUndefined(workspaces)) {
                this._store.dispatch(new WorkSpaceTypeLoadAction(true));
            }
            if (isNullOrUndefined(sectors) && this._isExampleAddCheckList) {
                this._store.dispatch(new LoadSectorsAction(true));
            }
            if (!isNullOrUndefined(workspaces)) {
                this._workspaceTypes = workspaces.sort(function (a, b) {
                    if (a.Name < b.Name) return -1;
                    if (a.Name > b.Name) return 1;
                    return 0;
                });
                if (!isNullOrUndefined(sectors)) {
                    this._sectors = sectors;
                }
                if (!isNullOrUndefined(currentChecklist)) {
                    this._currentCheckListItem = currentChecklist;
                    this._initializeForm();
                    this._initWorkSpaceFormGroup(this._currentCheckListItem.WorkspaceTypes);
                    if (this._isExampleAddCheckList) {
                        this._initSectorsFormGroup(this._currentCheckListItem.Sectors);
                    }
                }
                else {
                    this._initWorkSpaceFormGroup([]);
                    if (this._isExampleAddCheckList) {
                        this._initSectorsFormGroup([]);
                    }
                }
            }
        });

        this._combineDataSubscription = combineData.subscribe();


        this._sitesSubscription = this._store.let(fromRoot.getSiteData).subscribe(locations => {
            if (isNullOrUndefined(locations)) {
                this._store.dispatch(new LoadSitesAction(false));
            }
            else {
                var tempLocations = Immutable.List([new AeSelectItem<string>("All sites", "00000000-0000-0000-0000-000000000000", false)]);
                this._locations = Immutable.List<AeSelectItem<string>>(tempLocations.concat(mapSiteLookupTableToAeSelectItems(locations)).concat(Immutable.List([new AeSelectItem<string>("Select New Affected Site Location", "null", false)])));
                this._cdRef.markForCheck();
            }
        });
        this._stepSubscription = this.context.submitEvent.subscribe((val) => {
            if (val) {
                let _formDataToSave: Checklist = Object.assign({}, this._currentCheckListItem, <Checklist>this._generalTabForm.value);
                _formDataToSave.WorkspaceTypes = this._workspaceTypes.filter(x => x.isSelected == true);
                if (this._sectors)
                    _formDataToSave.Sectors = this._sectors.filter(x => x.isSelected == true);

                if (this._isFormDirty(this._generalTabForm)) {
                    if (isNullOrUndefined(_formDataToSave.Id)) {
                        this._checklistService.AddGeneralChecklist(_formDataToSave);
                    }
                    else {
                        _formDataToSave.CheckItems = null;
                        this._checklistService.UpdateChecklist(_formDataToSave);
                    }
                }
            }
        });
    }

    private _isFormDirty(formData: FormGroup): boolean {
        return formData.dirty || formData.get('WorkspaceTypes').dirty || formData.get('Sectors').dirty;
    }
    private _initializeForm() {
        let siteId = this._defaultSiteOption;
        let siteLocation = null;
        if (!isNullOrUndefined(this._currentCheckListItem) && !isNullOrUndefined(this._currentCheckListItem.Id)) {
            siteId = this._currentCheckListItem.SiteId;
        }

        if (!isNullOrUndefined(this._currentCheckListItem) && !isNullOrUndefined(this._currentCheckListItem.SiteLocation)) {
            siteLocation = this._currentCheckListItem.SiteLocation;
        }

        this._generalTabForm = this._fb.group({
            Name: [{ value: isNullOrUndefined(this._currentCheckListItem.Name) ? null : this._currentCheckListItem.Name, disabled: false }, Validators.compose([Validators.required, whiteSpaceFieldValidator])],
            SiteLocation: [{ value: isNullOrUndefined(this._currentCheckListItem.SiteLocation) ? null : this._currentCheckListItem.SiteLocation, disabled: false }],
            SiteName: [{ value: siteId, disabled: false }],
            SelectALL: [{ value: null, disabled: false }],
            IsExample: [{ value: isNullOrUndefined(this._currentCheckListItem.IsExample) ? null : this._currentCheckListItem.IsExample, disabled: false }],
            WorkspaceTypes: this._fb.array([]),
            Sectors: this._fb.array([])
        });
        this._allSectorsSubscription = this._generalTabForm.get("SelectALL").valueChanges.subscribe((value) => {
            for (var i = 0; i < this._sectors.length; i++) {
                this._generalTabForm.get('IsExample').setValue(true);
                if (value)
                    this._sectors[i].isSelected = true;
                else
                    this._sectors[i].isSelected = false;
            }
        });
        this._siteChangeSubscription = this._generalTabForm.get("SiteName").valueChanges.subscribe((value) => {
            if (value === "null") {
                this._generalTabForm.get('SiteLocation').setValidators([Validators.required]);
            }
            else {
                this._generalTabForm.get('SiteLocation').setValidators(null);
                this._generalTabForm.get('SiteLocation').setValue(null);
            }
            this._generalTabForm.get('SiteLocation').updateValueAndValidity();
        });

        if (!isNullOrUndefined(this._currentCheckListItem.Site)) {
            if (this._currentCheckListItem.Site.Name == "Select New Affected Site Location") {
                this._addNewLocationSiteFlag = true;
                this._generalTabForm.get('SiteName').setValue("null");
            }
            else {
                this._addNewLocationSiteFlag = false;
                this._generalTabForm.get('SiteName').setValue(this._currentCheckListItem.Site.Id);
            }
        }
        else {
            if (!isNullOrUndefined(siteLocation)) {
                siteId = "null";
                this._addNewLocationSiteFlag = true;
            }
            else {
                siteId = this._defaultSiteOption;
                this._addNewLocationSiteFlag = false;
            }
            this._generalTabForm.get('SiteName').setValue(siteId);
        }

        if (!this._generalTabForm.dirty && this._currentCheckListItem.Id) {
            this.context.isValidEvent.emit(true);
        }

        this._formStatusUpdateChangeSubscription = this._generalTabForm.statusChanges.subscribe((val) => {
            this.context.isValidEvent.emit((val === 'VALID') ? true : false);
        });

    }

    private _initWorkSpaceFormGroup(_selectedWorkspaces: Workspace[]) {
        if (isNullOrUndefined(this._workspaceTypes)) return;
        this._generalTabForm.controls['WorkspaceTypes'] = this._fb.array([]);
        let formArray = <FormArray>this._generalTabForm.controls['WorkspaceTypes'];
        this._workspaceTypes.forEach(workSpace => {
            let isSelected = false;
            let itemSelected = _selectedWorkspaces.find(x => x.Id === workSpace.Id);
            if (!isNullOrUndefined(itemSelected)) {
                isSelected = true;
            }
            workSpace.isSelected = isSelected;
            formArray.push(this._initWorkSpace(workSpace));
        });
        for (let formGroupIndex in formArray.controls) {
            let formGroup = <FormGroup>formArray.controls[formGroupIndex];
            for (let name in formGroup.controls) {
                let element = formGroup.controls[name];
                element.valueChanges.subscribe((value) => {
                    this._workspaceTypes[formGroupIndex][name] = value;
                    this._generalTabForm.updateValueAndValidity();
                });
            }
        }
    }
    private _initSectorsFormGroup(_selectedSectors: Sector[]) {
        if (isNullOrUndefined(this._sectors)) return;
        this._generalTabForm.controls['Sectors'] = this._fb.array([]);
        let formArray = <FormArray>this._generalTabForm.controls['Sectors'];
        this._sectors.forEach(sector => {
            let isSelected = false;
            let itemSelected = _selectedSectors.find(x => x.Id === sector.Id);
            if (!isNullOrUndefined(itemSelected)) {
                isSelected = true;
            }
            sector.isSelected = isSelected;
            formArray.push(this._initSectors(sector));
        });
        for (let formGroupIndex in formArray.controls) {
            let formGroup = <FormGroup>formArray.controls[formGroupIndex];
            for (let name in formGroup.controls) {
                let element = formGroup.controls[name];
                element.valueChanges.subscribe((value) => {
                    this._sectors[formGroupIndex][name] = value;
                    this._generalTabForm.get('IsExample').setValue(true);
                    this._generalTabForm.updateValueAndValidity();
                });
            }
        }
    }

    private _initWorkSpace(checklistWorkspaceTypes: Workspace) {
        return this._fb.group({
            Id: [{ value: checklistWorkspaceTypes.Id, disabled: false }],
            Name: [{ value: checklistWorkspaceTypes.Name, disabled: false }],
            PictureId: [{ value: checklistWorkspaceTypes.PictureId, disabled: false }],
            isSelected: [{ value: checklistWorkspaceTypes.isSelected, disabled: false }],
        });
    }
    private _initSectors(sector: Sector) {
        return this._fb.group({
            Id: [{ value: sector.Id, disabled: false }],
            Name: [{ value: sector.Name, disabled: false }],
            PictureId: [{ value: sector.PictureId, disabled: false }],
            isSelected: [{ value: sector.isSelected, disabled: false }],
        });
    }
    onSiteLocationChange($event: any) {
        this._currentCheckListItem.Site = new Site()
        this._currentCheckListItem.Site.Id = $event.SelectedItem.Value;
        this._currentCheckListItem.Site.Name = $event.SelectedItem.Text;
        this._currentCheckListItem.SiteId = $event.SelectedItem.Value;
        if ($event.SelectedItem.Text == "Select New Affected Site Location") {
            this._addNewLocationSiteFlag = true;
            this._generalTabForm.get("SiteName").setValidators(Validators.required);
        }
        else {
            this._addNewLocationSiteFlag = false;
            this._generalTabForm.get("SiteName").clearValidators();
        }
    }
    canCreateExampleChecklist(): boolean {
        return this._claimsHelper.canCreateExampleChecklist()
    }
    fieldHasRequiredError(fieldName: string): boolean {
        if (this._generalTabForm.get(fieldName).hasError('required') && (!this._generalTabForm.get(fieldName).pristine || this._submitted)) {
            return true;
        }
        return false;
    }
    imageLink(pictureId): string {
        return "/filedownload?documentId=" + pictureId + "&isSystem=true"
    }
    ngOnDestroy() {

        if (!isNullOrUndefined(this._stepSubscription)) {
            this._stepSubscription.unsubscribe();
        }

        if (!isNullOrUndefined(this._combineDataSubscription)) {
            this._combineDataSubscription.unsubscribe();
        }

        if (!isNullOrUndefined(this._siteChangeSubscription)) {
            this._siteChangeSubscription.unsubscribe();
        }

        if (!isNullOrUndefined(this._allSectorsSubscription)) {
            this._allSectorsSubscription.unsubscribe();
        }

        if (!isNullOrUndefined(this._formStatusChangeSubscription)) {
            this._formStatusChangeSubscription.unsubscribe();
        }

        if (!isNullOrUndefined(this._sitesSubscription)) {
            this._sitesSubscription.unsubscribe();
        }

        if (!isNullOrUndefined(this._activatedRoutesSubscription)) {
            this._activatedRoutesSubscription.unsubscribe();
        }

        if (!isNullOrUndefined(this._formStatusUpdateChangeSubscription)) {
            this._formStatusUpdateChangeSubscription.unsubscribe();
        }
    }
}