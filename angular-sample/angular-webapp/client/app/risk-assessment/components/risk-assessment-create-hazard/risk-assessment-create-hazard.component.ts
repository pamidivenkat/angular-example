import { RouteParams } from './../../../shared/services/route-params';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter, Input } from '@angular/core';
import { BaseComponent } from "../../../shared/base-component";
import { LocaleService, TranslationService } from "angular-l10n";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Store } from "@ngrx/store";
import { RiskAssessmentService } from "../../services/risk-assessment-service";
import * as fromRoot from '../../../shared/reducers';
import { Hazard } from "../../models/hazard";
import { FormBuilderService } from "../../../shared/services/form-builder.service";
import { CreateHazardForm } from "../../models/create-hazard-form";
import { AeDatasourceType } from "../../../atlas-elements/common/ae-datasource-type";
import { isNullOrUndefined } from "util";
import { WhoIsAffected } from "../../common/who-is-effected-enum";
import { HazardCategory } from "../../common/hazard-category-enum";
import { RiskAssessmentHazard } from "../../models/risk-assessment-hazard";
import { Document } from '../../../document/models/document';
import { FileResult } from "../../../atlas-elements/common/models/file-result";
import { FileUploadService } from "../../../shared/services/file-upload.service";
import { StringHelper } from "../../../shared/helpers/string-helper";
import * as fromConstants from '../../../shared/app.constants';
@Component({
  selector: 'risk-assessment-create-hazard',
  templateUrl: './risk-assessment-create-hazard.component.html',
  styleUrls: ['./risk-assessment-create-hazard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RiskAssessmentCreateHazardComponent extends BaseComponent implements OnInit {
  private _createHazardForm: FormGroup;
  private _affectedPeople: Array<any>;
  private _dataSourceType: AeDatasourceType;
  private _isSubmitted: boolean;
  private _standardHazardIcons: Array<any>;
  private _selectedFile: FileResult;
  private _pictureId: string;
  private _showPreview: boolean;
  private _imagePreviewUrl: string;
  private _iconUrl: string;
  private _iconViewExpand: boolean;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  //End of Private Fields
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }


  constructor(
    protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _fb: FormBuilderService
    , private _activatedRoute: ActivatedRoute
    , private _store: Store<fromRoot.State>
    , private _riskAssessmentService: RiskAssessmentService
    , private _fileUploadService: FileUploadService
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);
    this._dataSourceType = AeDatasourceType.Local;
    this._showPreview = false;
    this._iconViewExpand = false;
  }

  @Input('affectedPeople')
  get affectedPeople() {
    return this._affectedPeople;
  }
  set affectedPeople(val: any) {
    this._affectedPeople = val;
  }
  @Input('standardHazardIcons')
  set standardHazardIcons(val: Array<Document>) {
    this._standardHazardIcons;
    if (isNullOrUndefined(this._standardHazardIcons)) {
      this._standardHazardIcons = new Array();
      this._standardHazardIcons.push({ Id: fromConstants.defaultStandardPictureId });
      this._pictureId = this._standardHazardIcons[0].Id;
      this._showPreview = true;
      this._imagePreviewUrl = this.getPictureUrl(this._pictureId, true);
      this._iconUrl = this.getPictureUrl(this._pictureId, true);
    }
  }
  get standardHazardIcons() {
    return this._standardHazardIcons;
  }
  

  get createHazardForm() {
    return this._createHazardForm;
  }

  get affectedPeopleOptions() {
    return this._affectedPeople;
  }
  get dataSourceType() {
    return this._dataSourceType;
  }

  get standardHazardIconOptions() {
    return this._standardHazardIcons;
  }

  get showPreview() {
    return this._showPreview;
  }

  get iconUrl() {
    return this._iconUrl;
  }

  PreviewUrl() {
    return this._imagePreviewUrl;
  }

  get iconViewExpand() {
    return this._iconViewExpand;
  }

  toggleIconView() {
    this._iconViewExpand = !this._iconViewExpand;
  }

  public getPictureUrl(pictureId: string, isShared: boolean): string {
    if (isShared) {
      return "/filedownload?documentId=" + pictureId + "&isSystem=true";
    } else {
      return this._routeParamsService.Cid ? "/filedownload?documentId=" + pictureId + "$cid=" + this._routeParamsService.Cid : "/filedownload?documentId=" + pictureId;
    }

  }

  getHazardName(): string {
    if (!isNullOrUndefined(this._createHazardForm) && !isNullOrUndefined(this._createHazardForm.get('Name'))) {
      return this._createHazardForm.get('Name').value;
    }
    return '';
  }
  clearImage() {
    this._pictureId = '';
    this._showPreview = false;
    this._imagePreviewUrl = '';
  }
  onIconSelect(pictureId: string) {
    this._iconViewExpand = !this._iconViewExpand;
    this._showPreview = true;
    this._pictureId = pictureId;
    if (StringHelper.isNullOrUndefinedOrEmpty(pictureId)) {
      this._pictureId = fromConstants.defaultStandardPictureId;
    }
    this._imagePreviewUrl = this.getPictureUrl(this._pictureId, true);
    this._iconUrl = this.getPictureUrl(this._pictureId, true);
  }
  onFilesSelected($event: FileResult[]) {
    this._selectedFile = $event[0];
    if (!isNullOrUndefined(this._selectedFile) && this._selectedFile.isValid) {
      let _documentToSave: Document = Object.assign({}, new Document());
      _documentToSave.Category = 0;
      _documentToSave.FileName = this._selectedFile.file.name;
      _documentToSave.FileNameAndTitle = this._selectedFile.file.name;
      _documentToSave.Usage = 2;
      this._fileUploadService.Upload(_documentToSave, this._selectedFile.file).then((response: Document) => {
        this._pictureId = response.Id;
        this._showPreview = true;
        this._imagePreviewUrl = this.getPictureUrl(this._pictureId, false);
        this._cdRef.markForCheck();
      })

    }

  }

  @Output('onCreateHazard')
  private _createHazardSubmit: EventEmitter<any> = new EventEmitter<Hazard>();

  @Output('slideOutClose')
  private _slideOutClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  onCreateHazardCancel() {
    this._slideOutClose.emit(true);
  }
  onAddFormSubmit() {
    this._isSubmitted = true;
    if (this.createHazardForm.valid) {
      let formData: RiskAssessmentHazard = <RiskAssessmentHazard>this.createHazardForm.value;
      formData.PictureId = this._pictureId;
      this._createHazardSubmit.emit(formData);
    }
  }
  fieldHasRequiredError(fieldName: string): boolean {
    if (!isNullOrUndefined(this._createHazardForm)) {
      let field = this.createHazardForm.get(fieldName);
      if (!isNullOrUndefined(field)) {
        return field.hasError('required') && this._isSubmitted === true;
      }

    }
    return false;
  }
  toggleOthersAffectedFieldVisibility(): boolean {
    if (!isNullOrUndefined(this._createHazardForm) && !isNullOrUndefined(this._createHazardForm.get('WhoAffecteds'))) {
      let whoAffecteds = this._createHazardForm.get('WhoAffecteds').value;
      if (!isNullOrUndefined(whoAffecteds) && whoAffecteds !== '') {
        let otherOption = whoAffecteds.find(val => val === WhoIsAffected.Other);
        if (!isNullOrUndefined(otherOption)) {
          return true;
        }
      }
    }

    return false;
  }

  private _setOrClearValidators(fieldName: string, required: boolean) {
    if (this._createHazardForm.get(fieldName)) {
      required ? this._createHazardForm.get(fieldName).setValidators(Validators.required) : this._createHazardForm.get(fieldName).clearValidators();
    }
  }
  ngOnInit() {
    this._createHazardForm = this._fb.build(new CreateHazardForm('createhazardform'));
    this._createHazardForm.get('WhoAffecteds').valueChanges.subscribe((value) => {
      if (!isNullOrUndefined(value) && value !== '') {
        let otherOption = value.find(val => val === WhoIsAffected.Other);
        if (!isNullOrUndefined(otherOption)) {
          this._setOrClearValidators('OthersAffected', true);

        } else {
          this._setOrClearValidators('OthersAffected', false);
        }
      } else {
        this._setOrClearValidators('OthersAffected', false);
      }
    });
  }

}
