import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Inject,
  Input,
  Output,
  Renderer,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { StringHelper } from '../../shared/helpers/string-helper';
import { AeInputComponent } from '../ae-input/ae-input.component';
import { AeIconSize } from '../common/ae-icon-size.enum';
import { AeInputType } from '../common/ae-input-type.enum';
import { FileResult } from '../common/models/file-result';

@Component({
  selector: 'ae-file',
  templateUrl: './ae-file.component.html',
  styleUrls: ['./ae-file.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AeFileComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AeFileComponent extends AeInputComponent<File> {

  /**
   * @Input
   * Title for upload button
   * @private
   * @type {string}
   * @memberOf AeFileComponent
   */
  private _title: string;
  private _icon: string = "icon-paperclip";
  private _showFileName: boolean = true;
  private _showIcon: boolean = true;
  private _clearSelectedFile: boolean = false;
  private _restrictedExtensions: Array<string>;
  private _unIdentifiedFileTypes: Map<string, string>;

  /**
   * Member to allow/disable multi file upload
   * 
   * @private
   * @type {boolean}
   * @memberOf AeFileComponent
   */
  private _multiFileUploadEnabled: boolean;


  /**
   * Member to enable/disable to capture photos using camera
   * 
   * @private
   * @type {boolean}
   * @memberOf AeFileComponent
   */
  private _cameraModeEnabled: boolean;


  /**
   * Member to allow drag and drop files to upload
   *
   * @private
   * @type {boolean}
   * @memberOf AeFileComponent
   */
  private _dragDropEnabled: boolean;


  /**
   * Member to specify acceptable file formats
   *
   * @private
   * @type {string}
   * @memberOf AeFileComponent
   */
  private _accept: string;


  /**
   * Member to hold all allowed file formats
   * Constructed from values specified in input 'accept'
   * @private
   * @type {Array<string>}
   * @memberOf AeFileComponent
   */
  private _acceptedFileFormats: Array<string>;


  /**
   * Member to hold selected files for uploading
   *
   * @private
   * @type {Array<FileResult>}
   * @memberOf AeFileComponent
   */
  private _selectedFiles: Array<FileResult> = [];


  /**
   * Observe to subscribe when file is read for header information to determine file type
   *
   * @private
   * @type {Observable<FileResult>}
   * @memberOf AeFileComponent
   */
  private _fileReaderObservable: Observable<FileResult>;


  /**
   * Member to hold index of  file
   *
   * @private
   * @type {number}
   * @memberOf AeFileComponent
   */
  private _index: number;

  private _invalidFileMessage: string;

  private _iconSize: AeIconSize = AeIconSize.small;
  private _iconColor: string = 'black';

  get selectedFiles(): Array<FileResult> {
    return this._selectedFiles;
  }

  get invalidFileMessage(): string {
    return this._invalidFileMessage;
  }
  /**
   * @Input
   * Title for upload button
   * @readonly
   *
   * @memberOf AeFileComponent
   */
  @Input('title')
  get title() {
    return this._title;
  }
  set title(val: string) {
    this._title = val;
  }

  @Input('iconSize')
  get iconSize() {
    return this._iconSize;
  }
  set iconSize(val: AeIconSize) {
    this._iconSize = val;
  }

  @Input('iconColor')
  get iconColor() {
    return this._iconColor;
  }
  set iconColor(val: string) {
    this._iconColor = val;
  }
  /**
   * @Input
   * Icon for upload button
   * @readonly
   *
   * @memberOf AeFileComponent
   */
  @Input('icon')
  get icon() {
    return this._icon;
  }
  set icon(val: string) {
    this._icon = val;
  }

  /**
   * @Input
   * Input to accept  to allow/disable multi file upload
   * @readonly
   *
   * @memberOf AeFileComponent
   */
  @Input('multiple')
  get multiple() {
    return this._multiFileUploadEnabled;
  }
  set multiple(val: boolean) {
    this._multiFileUploadEnabled = val;
  }


  /**
   * @Input
   * Input to capture  to enable/disable camera to take photos
   * @readonly
   *
   * @memberOf AeFileComponent
   */
  @Input('cameraMode')
  get cameraMode() {
    return this._cameraModeEnabled;
  }
  set cameraMode(val: boolean) {
    this._cameraModeEnabled = val;
  }


  /**
   * @Input
   * Member to allow/disable drop files to upload
   * @readonly
   *
   * @memberOf AeFileComponent
   */
  @Input('droppable')
  get droppable() {
    return this._dragDropEnabled;
  }
  set droppable(val: boolean) {
    this._dragDropEnabled = val;
  }


  /**
   * @Input
   * Member to specify acceptable file formats for upload
   * @readonly
   *
   * @memberOf AeFileComponent
   */
  @Input('accept')
  get accept() {
    return this._accept;
  }
  set accept(val: string) {
    if (!StringHelper.isNullOrUndefinedOrEmpty(val)) {
      this._accept = val;
      this._acceptedFileFormats = val.split(',');
    }
  }


  /**
   * @Input
   * Icon for upload button
   * @readonly
   *
   * @memberOf AeFileComponent
   */
  @Input('showFileName')
  get showFileName() {
    return this._showFileName;
  }
  set showFileName(val: boolean) {
    this._showFileName = val;
  }

  /**
   * @Input
   * Icon for upload button
   * @readonly
   *
   * @memberOf AeFileComponent
   */
  @Input('showIcon')
  get showIcon() {
    return this._showIcon;
  }
  set showIcon(val: boolean) {
    this._showIcon = val;
  }


  @Input('clearSelectedFile')
  get ClearSelectedFile(): boolean {
    return this._clearSelectedFile;
  }
  set ClearSelectedFile(val: boolean) {
    this._clearSelectedFile = val;
    if (!isNullOrUndefined(this._clearSelectedFile) && this._clearSelectedFile && this.hasFiles) {
      this._selectedFiles = [];//clear the selected files
      this.inputFileHtmlElement.nativeElement.value = "";
      this.onFilesCleared.emit(true);
    }
  }

  // View Child Properties
  @ViewChild('inputFileSelector')
  inputFileHtmlElement: ElementRef;
  // End of View Child Properties

  /**
   * @Output
   * Event to emit upon file selection
   * @type {EventEmitter<any>}
   * @memberOf AeFileComponent
   */
  @Output()
  onFilesSelected: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  onFilesCleared: EventEmitter<any> = new EventEmitter<any>();

  constructor( @Inject(ElementRef) _elementRef: ElementRef,
    _renderer: Renderer, protected cdr: ChangeDetectorRef) {
    super(_elementRef, _renderer, cdr);
    this.type = AeInputType.file;
    this._title = 'Upload a file';
    this.value = null;
    this._cameraModeEnabled = false;
    this._dragDropEnabled = false;
    this._multiFileUploadEnabled = false;
    this._acceptedFileFormats = [];
    this._accept = '*';
    this._restrictedExtensions = ['application/x-x509-ca-cert'
      , 'application/x-msdownload'
      , 'application/bat'
      , 'application/x-bat'
      , 'application/x-javascript'
      , 'text/html'];

    // Below we should add file types based on file extensions for the extensions
    // which we will get file type as empty but it should be allowed to upload
    this._unIdentifiedFileTypes = new Map<string, string>();
    this._unIdentifiedFileTypes.set('msg', 'application/vnd.ms-outlook');
  }


  /**
   * @Method
   * method to determine camera is allowed or not
   * @private
   *
   * @memberOf AeFileComponent
   */
  isCaptureModeEnabled = () => this._cameraModeEnabled;


  /**
   * @Method
   * method to determine multi file upload supported or not.
   * @private
   *
   * @memberOf AeFileComponent
   */
  isMultiFileUpload = () => this._multiFileUploadEnabled;



  /**
   * @Method
   * Method to check drag and drop feature is supported or not
   * @private
   *
   * @memberOf AeFileComponent
   */
  isDropSupported = () => this._dragDropEnabled;


  /**
   * @Method
   * Method to get icon size for file upload icon
   * @private
   *
   * @memberOf AeFileComponent
   */
  private _getIconSize = () => AeIconSize.small;


  /**
   * @Method
   * Method to check files uploaded or not
   * @private
   *
   * @memberOf AeFileComponent
   */
  hasFiles = (): boolean => (this._selectedFiles.length > 0);
  private _isAllowedFormat = (fileType: string, isImage?: boolean): boolean => {
    let isAcceptedType = this._acceptedFileFormats.find(x => x === fileType);
    if (!Array.isArray(this._acceptedFileFormats)
      || this._acceptedFileFormats.length === 0
      || !StringHelper.isNullOrUndefinedOrEmpty(isAcceptedType)) {
      return true;
    }
    if (isImage) {
      let isAcceptedImageType = this._acceptedFileFormats.find(x => x === 'image/*' || (x.indexOf(fileType.replace('.', '')) > -1));
      return !StringHelper.isNullOrUndefinedOrEmpty(isAcceptedImageType) ? true : false;
    }
    return false;
  }



  /**
   * Private method to read file header and to determine file type
   * @Input {FileResult}
   * @Returns {string}
   * @private
   * @memberOf AeFileComponent
   */
  private _getFileHeader = (fileResult: FileResult) => {
    if (FileReader.prototype.readAsBinaryString === undefined) {
      FileReader.prototype.readAsBinaryString = function (fileData) {
        let binary = "";
        let pt = this;
        let reader = new FileReader();
        reader.onload = function (e) {
          let bytes = new Uint8Array(reader.result);
          let length = bytes.byteLength;
          for (let i = 0; i < length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          pt.content = binary;
          pt.onload();
        }
        reader.readAsArrayBuffer(fileData);
      }
    }
    this._fileReaderObservable = Observable.create(observer => {
      let reader = new FileReader();
      reader.onload = (e) => {
        let header = '';
        let fileContent;
        if (!e) {
          fileContent = reader['content'];
        } else {
          fileContent = e.target['result'];
        }
        let bytes = new Uint8Array(4);
        for (let i = 0; i < bytes.length; i++) {
          bytes[i] = fileContent.charCodeAt(i);
        }
        for (let i = 0; i < bytes.length; i++) {
          header += bytes[i].toString(16);
        }
        fileResult.header = header;
        observer.next(fileResult);
      };
      reader.readAsBinaryString(fileResult.file);
    });
  }


  /**
   * @Method
   * Method to validate file type
   * @private
   *
   * @memberOf AeFileComponent
   */
  private _validateFileType = (fileResult: FileResult) => {
    this._getFileHeader(fileResult);
    this._fileReaderObservable.subscribe(fileResult => {
      this._index += 1;
      fileResult.isValid = this._checkFileType(fileResult);
      if (fileResult.isValid === false) {
        if (this._acceptedFileFormats.toString() == '*') {
          this._invalidFileMessage = ' This file type is restricted by Atlas. Please upload a valid file.';
        } else {
          this._invalidFileMessage = ' This file type is not accepted. Accepted file formats are: ' + this._acceptedFileFormats.toString();
        }
      }
      if (this._index === this._selectedFiles.length) {
        let validFiles = this._selectedFiles.filter(f => f.isValid === true);
        this.cdr.detectChanges();
        // emit the selected files only when they are not null and has at least one element
        if (!isNullOrUndefined(validFiles) && validFiles.length > 0) {
          this.onFilesSelected.emit(validFiles);
        }
      }
    });
  }

  private _getFileType(file: File): string {
    let fileName = !isNullOrUndefined(file) && !isNullOrUndefined(file.name) ? file.name : '';
    let dotIndex = fileName.lastIndexOf('.');
    let fileExtension = dotIndex > -1 ? fileName.substring(dotIndex + 1, fileName.length) : '';
    let unIdentifiedFileType = this._unIdentifiedFileTypes.get(fileExtension);
    return unIdentifiedFileType ? unIdentifiedFileType : '';
  }
  /**
   * Method to check file type based on head information of the file
   * @Method
   * @private
   *
   * @memberOf AeFileComponent
   */
  private _checkFileType = (fileResult: FileResult): boolean => {
    let isValid = false;
    let allowAllFileTypes = this._accept === '*';

    if (allowAllFileTypes === true) {
      // APB-21460 we should allow .msg extensions but fileResult.file.type is giving empty for these kind of files
      // so depending on some allowed extensions to allow the upload of the files, 
      // and if they matched with allowed extensions we no need to verify against restricted extensions
      let unKnownFileType = StringHelper.isNullOrUndefinedOrEmpty(fileResult.file.type) ? this._getFileType(fileResult.file) : '';
      if (StringHelper.isNullOrUndefinedOrEmpty(fileResult.file.type)
        && !StringHelper.isNullOrUndefinedOrEmpty(unKnownFileType)
        && !isNullOrUndefined(this._restrictedExtensions.find(x => x == unKnownFileType))
      ) {
        fileResult.isValid = false;
        return false;
      }
      else if (((StringHelper.isNullOrUndefinedOrEmpty(unKnownFileType)) && StringHelper.isNullOrUndefinedOrEmpty(fileResult.file.type))
        || this._restrictedExtensions.find(x => x == fileResult.file.type)
      ) {
        fileResult.isValid = false;
        return false;
      } else {
        return true;
      }
    }

    switch (fileResult.header.toUpperCase()) {
      case '89504E47':
        isValid = this._isAllowedFormat('.png', true);
        break;
      case '47494638':
        isValid = this._isAllowedFormat('.gif', true);
        break;
      case 'FFD8FFE0':
      case 'FFD8FFE1':
      case 'FFD8FFE2':
        isValid = this._isAllowedFormat('.jpeg', true);
        break;
      case '25504446':
        isValid = this._isAllowedFormat('.pdf');
        break;
      case 'D0CF11E0':
        isValid = this._isAllowedFormat('.doc') || this._isAllowedFormat('.xls');
        break;
      case '504B0304':
        isValid = this._isAllowedFormat('.docx') || this._isAllowedFormat('.xlsx');
        break;
      case '504B34':
        isValid = this._isAllowedFormat('.xlsm');
        break;
      case '46697374':
        isValid = this._isAllowedFormat('.txt');
        break;

    }
    return isValid;

  }


  /**
   * @Method
   * Method called on file selection
   * @private
   * @param {*} event
   *
   * @memberOf AeFileComponent
   */
  onFileSelect(event: any) {
    let files;

    if (event.type === 'change') {
      files = event.target.files;

    }

    if (event.type === 'drop') {
      if (event.dataTransfer) {
        files = event.dataTransfer.files;
      }
    }

    if (files.length > 0) {
      this._selectedFiles = [];
      for (let file of files) {
        let fileResult = new FileResult(file);
        this._selectedFiles.push(fileResult);
        this._index = 0;
        this._validateFileType(fileResult);
      }
    }
  }



  @HostListener('dragover', ['$event'])
  ondragover(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('dragleave', ['$event'])
  ondragleave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('drop', ['$event'])
  ondrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.onFileSelect(event);
  }
}
