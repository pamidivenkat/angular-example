import { CompanyLoadAction } from '../../../../company/actions/company.actions';
import { Company } from '../../../../company/models/company';
import { IBreadcrumb } from '../../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../../../../atlas-elements/common/services/breadcrumb-service';
import { RouteParams } from '../../../../shared/services/route-params';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { BaseComponent } from "../../../../shared/base-component";
import { LocaleService, TranslationService } from "angular-l10n";
import { ClaimsHelperService } from "../../../../shared/helpers/claims-helper";
import * as fromRoot from '../../../../shared/reducers';
import { Store } from "@ngrx/store";
import { Observable } from "rxjs/Observable";
import { EmployeeImportDescriptionLoadAction, EmployeeImportSetImportParamsAction } from "../../actions/employee-import.actions";
import { FileResult } from "../../../../atlas-elements/common/models/file-result";
import { AeClassStyle } from "../../../../atlas-elements/common/ae-class-style.enum";
import { AePosition } from "../../../../atlas-elements/common/ae-position.enum";
import { Router, NavigationExtras } from "@angular/router";
import { isNullOrUndefined } from "util";
import { MessageType } from "../../../../atlas-elements/common/ae-message.enum";
import { Document } from '../../../../document/models/document';
import { DatePipe } from "@angular/common";
import { FileUploadService } from "../../../../shared/services/file-upload.service";
import { ObjectHelper } from "../../../../shared/helpers/object-helper";
import { MessengerService } from "../../../../shared/services/messenger.service";
import { EmployeeImportParams } from "../../models/employee-import-params";
import { BreadcrumbGroup } from '../../../../atlas-elements/common/models/ae-breadcrumb-group';
@Component({
  selector: 'employee-import',
  templateUrl: './employee-import.component.html',
  styleUrls: ['./employee-import.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class EmployeeImportComponent extends BaseComponent implements OnInit {

  private _importDescription$: Observable<string>;
  private _uploadedFile: FileResult;
  private btnClass: AeClassStyle = AeClassStyle.Light;
  private btnIconPosition: AePosition = AePosition.Right;
  private _showWarningMessage: boolean;
  private _messagetType = MessageType.Error;
  private _showImportConfirmDialog: boolean;
  private _companyImport: boolean = false;
  private _importConfirmform: FormGroup;
  private _companyName: string;

  //Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _router: Router
    , private _datePipe: DatePipe
    , private _fileUploadService: FileUploadService
    , private _fb: FormBuilder
    , private _routeParams: RouteParams
    , private _messenger: MessengerService
    , private _breadcrumbService: BreadcrumbService) {
    super(_localeService, _translationService, _cdRef);
    let bcItem = new IBreadcrumb('Import employees', '/employee/import', BreadcrumbGroup.Employees);
    this._breadcrumbService.add(bcItem);
  }

  //End of Constructor

  //Public properties
  get CompanyName() {
    return this._companyName
  }
  get messagetType() {
    return this._messagetType;
  }

  get importDescription$() {
    return this._importDescription$;
  }

  get showImportConfirmDialog() {
    return this._showImportConfirmDialog;
  }

  get importConfirmform() {
    return this._importConfirmform;
  }

  get companyImport() {
    return this._companyImport;
  }

  get bcGroup(): BreadcrumbGroup {
    return BreadcrumbGroup.Employees;
  }
  //End of public properties

  //Private methods
  private _initForm() {
    this._importConfirmform = this._fb.group({
      companyImport: [this._companyImport]
    });
  }

  private _importTask() {

    if (isNullOrUndefined(this._uploadedFile)) {
      this._showWarningMessage = true;
    }
    else {
      this._showWarningMessage = false;
      let document = new Document();
      document.CompanyId = this._claimsHelper.getCompanyId();
      document.LastModifiedDateTime = this._datePipe.transform(this._uploadedFile.file.lastModifiedDate, 'medium');
      document.FileName = this._uploadedFile.file.name;
      document.Category = 0;
      document.Usage = 2;
      let vm = ObjectHelper.createInsertInProgressSnackbarMessage('Document', this._uploadedFile.file.name);
      this._messenger.publish('snackbar', vm);
      this._fileUploadService.Upload(document, this._uploadedFile.file).then((response: any) => {
        vm = ObjectHelper.createInsertCompleteSnackbarMessage('Document', this._uploadedFile.file.name);
        this._messenger.publish('snackbar', vm);
        let uploadedFile = <Document>response;
        if(uploadedFile)
        this._store.dispatch(new EmployeeImportSetImportParamsAction(new EmployeeImportParams(uploadedFile.FileName, uploadedFile.FileStorageIdentifier)));
        let navigationExtras: NavigationExtras = {
          queryParamsHandling: 'merge'
        };
        this._router.navigate(['employee/import/preview'], navigationExtras);
      }, (error) => { });

      //Navigate to import employees preview screen;
    }
  }

  //End of Private methods

  //Public methods
  showMessage(): boolean {
    return this._showWarningMessage === true;
  }

  import() {
    let cid: string = this._routeParams.Cid;
    if (this._claimsHelper.isAdministrator() && this._uploadedFile && cid) {
      this._store.let(fromRoot.getCurrentCompanyDetails).subscribe(companyDetails => {
        if (isNullOrUndefined(companyDetails)) {
          this._store.dispatch(new CompanyLoadAction(cid ? cid : this._claimsHelper.getCompanyId()));
        }
        else {
          this._companyName = companyDetails.CompanyName;
          this._showImportConfirmDialog = true;
        }
      });
    }
    else
      this._importTask()
  }
  viewImportHistory() {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    };
    this._router.navigate(['employee/import/history'], navigationExtras);
  }

  downloadTemplate() {
    window.open('assets/templates/import/EmployeesData_2.0.xlsm');
  }

  onFilesSelected($event: FileResult[]) {
    this._showWarningMessage = false;
    let fileUploded: FileResult = $event[0];
    if (!isNullOrUndefined(fileUploded)) {
      if (fileUploded.isValid) {
        this._uploadedFile = fileUploded;
      }
      else {
        this._uploadedFile = null;
      }
    }
  }


  confirmImportedEmployeeClosed(event: any) {
    this._showImportConfirmDialog = false;
  }


  OnChange(e) {
    this._companyImport = e;
  }

  confirmImportedEmployeeConfirmed(event: any) {
    this._showImportConfirmDialog = false;
    this._importTask()
  }

  //End of public methods


  ngOnInit() {
    this._initForm();
    this._store.dispatch(new EmployeeImportDescriptionLoadAction(true));
    this._importDescription$ = this._store.let(fromRoot.getEmployeeImportDescription);

  }

}
