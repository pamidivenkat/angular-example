import { AeLoaderType } from '../../../../atlas-elements/common/ae-loader-type.enum';
import { AeFormComponent } from '../../../../atlas-elements/ae-form/ae-form.component';
import { FileUploadService } from '../../../../shared/services/file-upload.service';
import { FileResult } from '../../../../atlas-elements/common/Models/file-result';
import { isNullOrUndefined } from 'util';
import { IFormBuilderVM } from '../../../../shared/models/iform-builder-vm';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FormBuilderService } from '../../../../shared/services/form-builder.service';
import { IconForm, IconFormFieldWrapper } from '../../models/icon-form';
import { StringHelper } from '../../../../shared/helpers/string-helper';
import { Icon } from '../../models/icon';
import { IconType } from '../../models/icon-type.enum';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Document } from '../../../../document/models/document';
import * as fromConstants from '../../../../shared/app.constants';
@Component({
  selector: 'icon-add-update',
  templateUrl: './icon-add-update.component.html',
  styleUrls: ['./icon-add-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconAddUpdateComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _action: string;
  private _iconType: IconType;
  private _icon: Icon;
  private _iconFormVM: IFormBuilderVM;
  private _fields: Array<IconFormFieldWrapper<any>>;
  private _iconForm: FormGroup;
  private _showPreview: boolean;
  private _selectedIcon: FileResult;
  private _pictureId: string;
  private _iconPreviewUrl: string;
  private _loaderType = AeLoaderType.Bars;
  private _showloader: boolean;
  private _clearSelectedFile: boolean = false;
  // End of Private Fields

  // Public properties
  get iconFormVM(): IFormBuilderVM {
    return this._iconFormVM;
  }

  get iconForm(): FormGroup {
    return this._iconForm;
  }
  get showPreview(): boolean {
    return this._showPreview;
  }
  get loaderType() {
    return this._loaderType;
  }
  get showloader() {
    return this._showloader;
  }
  @Input('type')
  set type(val: IconType) {
    this._iconType = val;
  }
  get type() {
    return this._iconType;
  }


  @Input('action')
  set action(val: string) {
    this._action = val;
  }
  get action() {
    return this._action;
  }


  @Input('icon')
  set icon(val: Icon) {
    if (!isNullOrUndefined(val)) {
      this._icon = val;
      this._showloader = false;
      this._setFormValues();
    }

  }
  get icon() {
    return this._icon;
  }

  get clearSelectedFile() {
    return this._clearSelectedFile;
  }
  // End of Public properties

  // Public Output bindings
  @Output('onSubmit')
  onSubmit: EventEmitter<Icon> = new EventEmitter<Icon>();

  @Output('onCancel')
  onCancel: EventEmitter<string> = new EventEmitter<string>();
  // End of Public Output bindings

  // Public ViewChild bindings
  @ViewChild(AeFormComponent)
  aeForm: AeFormComponent;
  // End of Public ViewChild bindings

  // Public ViewContent bindings
  // End of Public ViewContent bidnings

  // constructor

  constructor(
    protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
    , private _fb: FormBuilderService
    , private _fileUploadService: FileUploadService
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
  }
  // End of constructor

  ngOnInit() {
    if (this._action == 'Update') {
      this._showloader = true;
    }
    this._iconFormVM = new IconForm('add-update-icon', this._iconType);
    this._fields = this._iconFormVM.init();
  }
  // Private methods
  private uploadIcon() {
    let _iconDocument: Document = Object.assign({}, new Document());
    _iconDocument.Category = 0;
    _iconDocument.FileName = this._selectedIcon.file.name;
    _iconDocument.FileNameAndTitle = this._selectedIcon.file.name;
    _iconDocument.Usage = 2;
    _iconDocument.CompanyId = fromConstants.SystemTenantId;
    this._showloader = true;
    this._fileUploadService.Upload(_iconDocument, this._selectedIcon.file).then((response: Document) => {
      this._pictureId = response.Id;
      this._showloader = false;
      this._iconForm.get('PictureId').setValue(this._pictureId);
      this._showPreview = true;
      this._iconPreviewUrl = this.getPictureUrl(this._pictureId);
      this._cdRef.markForCheck();
    });
  }

  private _setFormValues() {
    if (isNullOrUndefined(this._iconForm) || isNullOrUndefined(this._icon)) return;
    this._iconForm.patchValue({
      PictureId: this._icon.PictureId,
      Category: this._icon.Category,
      Name: this._icon.Name,
      Description: this._icon.Description
    });
    if (!isNullOrUndefined(this._icon.PictureId)) {
      this._showPreview = true;
      this._pictureId = this._icon.PictureId;
      this._iconPreviewUrl = this.getPictureUrl(this._pictureId);
    }
  }
  // End of private methods

  // Public methods
  onFormInit(fg: FormGroup) {
    this._iconForm = fg;
    this._setFormValues();
  }
  onFormCancel(event: any) {
    this.onCancel.emit('close');
  }
  onFormSubmit(event: any) {
    if (this._iconForm.valid) {
      if (isNullOrUndefined(this._icon)) {
        this._icon = new Icon();
      }
      this._icon = Object.assign({}, this._icon, <Icon>this._iconForm.value);
      if (this._action == 'Add') {
        this._icon.CompanyId = fromConstants.SystemTenantId;
        this._icon.IsExample = true;
      } else {
        this._icon = Object.assign({}, this._icon, { Author: null, Modifier: null });
      }

      this.onSubmit.emit(this._icon);
    }
  }
  getFooterButtonText() {
    let btnText = 'Add';
    if (!StringHelper.isNullOrUndefinedOrEmpty(this._action)) {
      btnText = this._action;
    }
    return { Submit: btnText, Cancel: 'Close' };
  }

  getTitle(): string {
    if (!isNullOrUndefined(this._action)) {
      return ((this._action === 'Add' ? 'Add' : 'Update') + ' ' + 'icon');
    }
    return '';
  }
  PreviewUrl(): string {
    return this._iconPreviewUrl;
  }
  public getPictureUrl(pictureId: string): string {
    return '/filedownload?documentId=' + pictureId + '&isSystem=true';
  }
  clearImage() {
    this._selectedIcon = null;
    this._clearSelectedFile = true;
    this._pictureId = '';
    this._showPreview = false;
    this._iconPreviewUrl = '';
    this._iconForm.get('PictureId').setValue(null);
  }
  onFilesSelected($event: FileResult[]) {
    this._selectedIcon = $event[0];
    this._clearSelectedFile = false;;
    if (!isNullOrUndefined(this._selectedIcon) && this._selectedIcon.isValid) {
      this.uploadIcon();
    }
  }

  fieldHasRequiredError(fieldName: string): boolean {
    if (this._iconForm.get(fieldName)
      && this._iconForm.get(fieldName).hasError('required')
      && this.aeForm.submitted
    ) {
      return true;
    }
    return false;
  }
  // End of public methods
}
