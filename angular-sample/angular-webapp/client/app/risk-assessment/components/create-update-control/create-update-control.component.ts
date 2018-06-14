import { RouteParams } from './../../../shared/services/route-params';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import { isNullOrUndefined } from 'util';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { FileResult } from '../../../atlas-elements/common/models/file-result';
import { Document } from '../../../document/models/document';
import { AeDataActionTypes } from '../../../employee/models/action-types.enum';
import { LoadStandardControlIconsAction } from '../../../shared/actions/lookup.actions';
import * as fromConstants from '../../../shared/app.constants';
import { BaseComponent } from '../../../shared/base-component';
import { StringHelper } from '../../../shared/helpers/string-helper';
import * as fromRoot from '../../../shared/reducers';
import { FileUploadService } from '../../../shared/services/file-upload.service';
import { FormBuilderService } from '../../../shared/services/form-builder.service';
import { getPictureUrl } from '../../common/helper';
import { CreateControlForm } from '../../models/create-control-form';
import { RiskAssessmentControl } from '../../models/risk-assessment-control';


@Component({
  selector: 'create-update-control',
  templateUrl: './create-update-control.component.html',
  styleUrls: ['./create-update-control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateUpdateControlComponent extends BaseComponent implements OnInit, OnDestroy {

  // Private Fields
  private _controlForm: FormGroup;
  private _showPreview: boolean;
  private _selectedFile: FileResult;
  private _pictureId: string;
  private _imagePreviewUrl: string;
  private _isSubmitted: boolean;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _iconUrl: string;
  private _standardControlIcons: Array<any>;
  private _iconViewExpand: boolean;
  private _selectedControl: RiskAssessmentControl;
  private _action: string;
  private _buttonName: string;
  private _formHeader: string;
  // End of Private Fields

  // Public properties
  get formHeader(): string {
    return this._formHeader;
  }
  get controlForm(): FormGroup {
    return this._controlForm;
  }

  get showPreview(): boolean {
    return this._showPreview;
  }

  get lightClass(): AeClassStyle {
    return this._lightClass
  }

  get iconUrl(): string {
    return this._iconUrl
  }

  get iconViewExpand(): boolean {
    return this._iconViewExpand;
  }

  get imagePreviewUrl(): string {
    return this._imagePreviewUrl;
  }

  get buttonName(): string {
    return this._buttonName;
  }

  get action(): string {
    return this._action;
  }

  get standardControlIcons() {
    return this._standardControlIcons;
  }
  // End of Public properties

  // Public Output bindings  
  @Input('selectedControl')
  get selectedControl(): RiskAssessmentControl {
    return this._selectedControl;
  }

  set selectedControl(control: RiskAssessmentControl) {
    this._selectedControl = control;
    if (!isNullOrUndefined(this._selectedControl))
      this._imagePreviewUrl = this.getPictureUrl(this._selectedControl.PictureId, true);
  }

  @Output('onCreateControl')
  private _createControlSubmit: EventEmitter<any> = new EventEmitter<RiskAssessmentControl>();

  @Output('slideOutClose')
  private _slideOutClose: EventEmitter<boolean> = new EventEmitter<boolean>();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContnetChild bindings
  // End of Public ContnetChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _formBuilderService: FormBuilderService
    , private _fileUploadService: FileUploadService
    , private _store: Store<fromRoot.State>
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);
    this._showPreview = true;
  }
  // End of constructor

  // Private methods
  // End of private methods

  // Public methods
  fieldHasRequiredError(fieldName: string): boolean {
    if (!isNullOrUndefined(this._controlForm)) {
      let field = this._controlForm.get(fieldName);
      if (!isNullOrUndefined(field)) {
        return field.hasError('required') && this._isSubmitted === true;
      }

    }
    return false;
  }
  getControlName(): string {
    return this._controlForm.get('Name').value;
  }

  onCreateControlCancel() {
    this._slideOutClose.emit(true)
  }
  onCreateControlSubmit() {
    this._isSubmitted = true;
    if (this.controlForm.valid) {
      if (this._action === AeDataActionTypes.Add) {
        let controlToSave: RiskAssessmentControl = <RiskAssessmentControl>this.controlForm.value;
        controlToSave.PictureId = this._pictureId;
        this._createControlSubmit.emit(controlToSave);
      } else {
        this._selectedControl.Name = this.controlForm.get('Name').value;
        this._selectedControl.Description = this.controlForm.get('Description').value;
        this._selectedControl.PictureId = this._pictureId;
        this._createControlSubmit.emit(this._selectedControl);
      }
    }
  }
  getPictureUrl(pictureId: string, isSystemDocument: boolean): string {
    return getPictureUrl(pictureId, this._routeParamsService.Cid, isSystemDocument, false);
  }
  onFilesSelected($event) {
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
  clearImage() {
    this._pictureId = '';
    this._showPreview = false;
    this._imagePreviewUrl = '';
  }
  toggleIconView() {
    this._iconViewExpand = !this._iconViewExpand;
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
  ngOnInit() {
    this._controlForm = this._formBuilderService.build(new CreateControlForm('controlForm'));

    this._action = isNullOrUndefined(this._selectedControl) ? AeDataActionTypes.Add : AeDataActionTypes.Update;

    this._buttonName = 'BUTTONS.ADD | translate: lang';
    this._formHeader = 'ADD_CONTROL';
    if (this._action === AeDataActionTypes.Update) {
      this._formHeader = 'UPDATE_CONTROL';
      this._showPreview = true;
      this._buttonName = 'BUTTON.UPDATE | translate: lang';
      this._controlForm.get('Name').setValue(this._selectedControl.Name);
      this._pictureId = this._selectedControl.PictureId;
      this._imagePreviewUrl = this.getPictureUrl(this._pictureId, this._selectedControl.IsSharedPrototype);
      this._controlForm.get('Description').setValue(this._selectedControl.Description);
    }

    this._store.let(fromRoot.getStandardControlIcons).takeUntil(this._destructor$).subscribe((controlIcons) => {
      if (isNullOrUndefined(controlIcons)) {
        this._store.dispatch(new LoadStandardControlIconsAction(true));
      } else {
        this._standardControlIcons = controlIcons;
        if (this._standardControlIcons.length >= 1) {
          if (this._action === AeDataActionTypes.Add) {
            this._pictureId = this._standardControlIcons[0].Id;
          }
          this._iconUrl = this.getPictureUrl(this._standardControlIcons[0].Id, true);
          if (this._action != AeDataActionTypes.Update) {
            this._imagePreviewUrl = this._iconUrl;
          }
          this._cdRef.markForCheck();
        } else {
          this._iconUrl = '/assets/images/default-icon-32x32.png';
          let controlDefault = { Id: '00000000-0000-0000-0000-000000000000' };
          this._standardControlIcons.push(controlDefault);
          this._cdRef.markForCheck();
        }
      }
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
  // End of public methods

}
