import { RouteParams } from './../../../../shared/services/route-params';
import { EventType, Sensitivity } from '../../../models/timeline';
import { UIField } from '../../models/event-form';
import { EmployeeEvent } from '../../models/emloyee-event';
import { isNullOrUndefined } from 'util';
import { Subscription } from 'rxjs/Rx';
import { DocumentCategoryService } from '../../../../document/services/document-category-service';
import { Store } from '@ngrx/store';
import { ClaimsHelperService } from '../../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../../shared/base-component';
import { Document, EntityReference } from '../../../../document/models/document';

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation
} from '@angular/core';
import * as fromRoot from '../../../../shared/reducers';
import { RestClientService } from "../../../../shared/data/rest-client.service";
import { OtcEntityDataService } from "../../../../document/services/otc-data.service";
import { AeClassStyle } from "../../../../atlas-elements/common/ae-class-style.enum";
@Component({
  selector: 'employee-document-details',
  templateUrl: './employee-document-details.component.html',
  styleUrls: ['./employee-document-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class EmployeeDocumentDetails extends BaseComponent implements OnInit, OnDestroy {
  private _selectedDocument: Document;
  private _selectDocumentSubscription: Subscription;
  private _employeeInfoSubscription: Subscription;
  private _empName: string;

  @Output('onCancel') _onCancel: EventEmitter<string> = new EventEmitter<string>();

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService
    , private _documentCategoryService: DocumentCategoryService
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);

  }
  
  get selectedDocument(): Document {
    return this._selectedDocument;
  }



  ngOnInit() {

    this._selectDocumentSubscription = this._store.let(fromRoot.getCurrentDocument).subscribe(res => {
      this._selectedDocument = res;
      this._cdRef.markForCheck();
    });

    this._employeeInfoSubscription = this._store.let(fromRoot.getEmployeeInformationData).subscribe(employee => {
      if (employee) {
        this._empName = employee.FirstName + ' ' + employee.Surname;
      }
    });
  }

  ngOnDestroy(): void {
    this._selectDocumentSubscription.unsubscribe();
    this._employeeInfoSubscription.unsubscribe();

  }
  getTypeName(): string {
    let sensitivity = this._selectedDocument.Sensitivity;
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


  getEmployeeName(): string {
    return !isNullOrUndefined(this._empName) ? this._empName : '';
  }
  onDetaisCancel(): void {
    this._onCancel.emit('close');
  }
  downloadDocument(docId: string) {
    window.open(this._getDownloadUrl(docId));
  }
  private _getDownloadUrl(docId: string) {
    if (isNullOrUndefined(docId))
      return null;
    return this._routeParamsService.Cid ?  `/filedownload?documentId=${docId}&cid=${this._routeParamsService.Cid}` :  `/filedownload?documentId=${docId}`;
  }

} 
