import { RouteParams } from './../../../../shared/services/route-params';
import {
  Component
  , OnInit
  , OnDestroy
  , ChangeDetectorRef
  , ChangeDetectionStrategy
  , ViewEncapsulation
  , Output
  , EventEmitter
  , ViewChild
  , ElementRef
  , Input
} from '@angular/core';
import { BaseComponent } from './../../../../shared/base-component';
import { LocaleService, TranslationService } from 'angular-l10n';
import { ClaimsHelperService } from './../../../../shared/helpers/claims-helper';
import { Store } from '@ngrx/store';
import * as fromRoot from './../../../../shared/reducers';
import * as Immutable from 'immutable';
import { IncidentLogService } from '../../services/incident-log.service';
import { isNullOrUndefined } from 'util';
import { RIDDOROnlineFormVM } from '../../models/incident-riddor.model';
import { Subscription } from 'rxjs/Subscription';
import { StringHelper } from './../../../../shared/helpers/string-helper';

@Component({
  selector: 'riddor-online-form',
  templateUrl: './riddor-online-form.component.html',
  styleUrls: ['./riddor-online-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class RiddorOnlineFormComponent extends BaseComponent implements OnInit, OnDestroy {
  // private variables
  private _riddorFormVM: RIDDOROnlineFormVM;
  private _previewSubscription: Subscription;
  private _pdfGenSubscription: Subscription;
  private _riddorPrintInfo: {
    Id: string,
    LocalAuthority: string;
    MainIndustryName: string;
  }
  // end private variable declarations

  @Input('riddorPrintInfo')
  public get riddorPrintInfo() {
    return this._riddorPrintInfo;
  }
  public set riddorPrintInfo(val: any) {
    this._riddorPrintInfo = val;
  }

  public get riddorFormVM() {
    return this._riddorFormVM;
  }

  @Output()
  cancelled: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('riddorForm')
  riddorForm: ElementRef;

  // constructor starts
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>
    , private _incidentLogService: IncidentLogService
    , private _routeParamsService: RouteParams
  ) {
    super(_localeService, _translationService, _cdRef);
  }
  // end of constructor starts

  // public methods

  public onPanelClosed(e) {
    this.cancelled.emit(true);
  }

  public generatePDF($event) {
    let riddorElement = (<HTMLElement>this.riddorForm.nativeElement);
    if (!isNullOrUndefined(riddorElement)) {
      let html: string = riddorElement.innerHTML;
      let companyName = this._claimsHelper.getCompanyName();

      this._pdfGenSubscription = this._incidentLogService
        .generateRIDDORPDF(html, riddorElement.getBoundingClientRect().width, this._riddorPrintInfo.Id)
        .subscribe((documentId) => {
          if (!StringHelper.isNullOrUndefinedOrEmpty(documentId)) {
            let url = this._routeParamsService.Cid ? `/filedownload?documentId=${documentId}&cid=${this._routeParamsService.Cid}` : `/filedownload?documentId=${documentId}`;
            window.open(url);
          }
        });
    }
  }

  ngOnInit() {
    this._riddorFormVM = new RIDDOROnlineFormVM();
    this._previewSubscription = this._incidentLogService.getIncidentPreviewInfo(this._riddorPrintInfo.Id).subscribe((data) => {
      this._riddorFormVM = data;
      this._cdRef.markForCheck();
    });
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._previewSubscription)) {
      this._previewSubscription.unsubscribe();
    }

    if (!isNullOrUndefined(this._pdfGenSubscription)) {
      this._pdfGenSubscription.unsubscribe();
    }
  }
  // end of public methods
}
