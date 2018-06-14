import { AeIconSize } from '../../../atlas-elements/common/ae-icon-size.enum';
import { isNullOrUndefined } from 'util';
import { AeInformationBarItemType } from '../../../atlas-elements/common/ae-informationbar-itemtype.enum';
import { StatisticsInformation } from '../../models/statistics-information';
import { AeInformationBarItem } from '../../../atlas-elements/common/models/ae-informationbar-item';
import { Observable } from 'rxjs/Rx';
import { ServiceReportingLoadAction } from '../../actions/service-reporting.actions';
import { Store } from '@ngrx/store';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService } from 'angular-l10n';
import { BaseComponent } from '../../../shared/base-component';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import * as fromRoot from './../../../shared/reducers/index';
import * as Immutable from 'immutable';

@Component({
  selector: 'service-reporting',
  templateUrl: './service-reporting.component.html',
  styleUrls: ['./service-reporting.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ServiceReportingComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _informationBarItemType = AeInformationBarItemType;
  private _applyScroll: boolean = true;
  private _maxHeight: string = '14em';
  private _loading$: Observable<boolean>;
  private _elServiceReportInformation: Array<StatisticsInformation<string>> = [];
  private _hsServiceReportInformation: Array<StatisticsInformation<string>>;
  private _elTrainingServiceReportInformation: Array<StatisticsInformation<string>>;
  private _hsTrainingServiceReportInformation: Array<StatisticsInformation<string>>;
  private _iconBig: AeIconSize = AeIconSize.big;
  // End of Private Fields

  // Public properties
  get maxHeight(): string {
    return this._maxHeight;
  }
  get elServiceReportInformation(): Array<StatisticsInformation<string>> {
    return this._elServiceReportInformation;
  }
  get hsServiceReportInformation(): Array<StatisticsInformation<string>> {
    return this._hsServiceReportInformation;
  }
  get applyScroll(): boolean {
    return this._applyScroll;
  }
  get informationBarItemType(): typeof AeInformationBarItemType {
    return this._informationBarItemType;
  }
  get loading$(): Observable<boolean> {
    return this._loading$;
  }

  get hsTrainingServiceReportInformation(): Array<StatisticsInformation<string>> {
    return this._hsTrainingServiceReportInformation;
  }
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ViewContent bindings
  // End of Public ViewContent bidnings

  // constructor
  constructor(
    protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claimsHelper: ClaimsHelperService) {
    super(_localeService, _translationService, _cdRef);
  }
  // End of constructor

  // Private methods

  /**
   * 
   * @private
   * @returns {string} 
   * 
   * @memberof ServiceReportingComponent
   */
  getHSHandbookService(): string {
    return `${this.id}_HSHandbookService`;
  }

  /**
   * 
   * 
   * @private
   * @returns {string} 
   * 
   * @memberof ServiceReportingComponent
   */
  getHSTrainingService(): string {
    return `${this.id}_HSTrainingService`;
  }


  /**
   * 
   * 
   * @private
   * @returns {string} 
   * 
   * @memberof ServiceReportingComponent
   */
  getELHandbookService(): string {
    return `${this.id}_ELHandbookService`;
  }


  /**
   * 
   * 
   * @private
   * @returns {string} 
   * 
   * @memberof ServiceReportingComponent
   */
  getELTrainingService(): string {
    return `${this.id}_ELTrainingService`;
  }


  /**
   * 
   * 
   * @private
   * @param {string} id 
   * @returns {string} 
   * 
   * @memberof ServiceReportingComponent
   */
  onHandbookServiceReportClick(id: string): string {
    return "document/document-details/" + id;
  }

  /**
   * 
   * 
   * @private
   * @param {string} id 
   * @returns {string} 
   * 
   * @memberof ServiceReportingComponent
   */
  onTrainingServiceReportClick(id: string): string {
    return "training/training-course";
  }

  /**
   * 
   * @private
   * @returns {Array<StatisticsInformation<string>>} 
   * 
   * @memberof ServiceReportingComponent
   */
  private _getHSServiceReport(serviceReportInformation: Immutable.List<StatisticsInformation<string>>): Array<StatisticsInformation<string>> {
    if (isNullOrUndefined(serviceReportInformation)) return [];
    let hsServiceReport: Array<StatisticsInformation<string>> = [];
    serviceReportInformation.forEach((staticInfo) => {
      if ((!isNullOrUndefined(staticInfo.Data) && staticInfo.Code === AeInformationBarItemType.HSHandbookService) || (staticInfo.Code === AeInformationBarItemType.HSTrainingService && staticInfo.Count == 0)) {
        hsServiceReport.push(staticInfo);
      }
    });
    return hsServiceReport;
  }

  /**
   * 
   * @private
   * @returns {Array<StatisticsInformation<string>>} 
   * 
   * @memberof ServiceReportingComponent
   */
  private _getHSTrainingServiceReport(serviceReportInformation: Immutable.List<StatisticsInformation<string>>): Array<StatisticsInformation<string>> {
    if (isNullOrUndefined(serviceReportInformation)) return [];
    let hsTrainingServiceReport: Array<StatisticsInformation<string>> = [];
    serviceReportInformation.forEach((staticInfo) => {
      if (staticInfo.Code === AeInformationBarItemType.HSTrainingService && staticInfo.Count == 0) {
        hsTrainingServiceReport.push(staticInfo);
      }
    });
    return hsTrainingServiceReport;
  }


  /**
   * 
   * @private
   * @returns {Array<StatisticsInformation<string>>} 
   * 
   * @memberof ServiceReportingComponent
   */
  private _getELServiceReport(serviceReportInformation: Immutable.List<StatisticsInformation<string>>): Array<StatisticsInformation<string>> {
    if (isNullOrUndefined(serviceReportInformation)) return [];
    let elServiceReport: Array<StatisticsInformation<string>> = [];
    serviceReportInformation.forEach((staticInfo) => {
      if ((!isNullOrUndefined(staticInfo.Data) && staticInfo.Code === AeInformationBarItemType.ELHandbookService) || (staticInfo.Code === AeInformationBarItemType.ELTrainingService && staticInfo.Count == 0)) {
        elServiceReport.push(staticInfo);
      }
    });
    return elServiceReport;
  }

  /**
    * 
    * @private
    * @returns {Array<StatisticsInformation<string>>} 
    * 
    * @memberof ServiceReportingComponent
    */
  private _getELTrainingServiceReport(serviceReportInformation: Immutable.List<StatisticsInformation<string>>): Array<StatisticsInformation<string>> {
    if (isNullOrUndefined(serviceReportInformation)) return [];
    let elTrainingServiceReport: Array<StatisticsInformation<string>> = [];
    serviceReportInformation.forEach((staticInfo) => {
      if (staticInfo.Code === AeInformationBarItemType.ELTrainingService && staticInfo.Count == 0) {
        elTrainingServiceReport.push(staticInfo);
      }
    });
    return elTrainingServiceReport;
  }


  /**
   * 
   * 
   * @private
   * @returns 
   * 
   * @memberof ServiceReportingComponent
   */
  hasELServiceReportItems() {
    return this._elServiceReportInformation.length > 0;
  }


  /**
   * 
   * 
   * @private
   * @returns 
   * 
   * @memberof ServiceReportingComponent
   */
  hasHSServiceReportItems() {
    return this._hsServiceReportInformation ? this._hsServiceReportInformation.length > 0 : false;
  }


  haselTrainingServiceReportItems(): boolean {
    return this._elTrainingServiceReportInformation ? this._elTrainingServiceReportInformation.length > 0 : false;
  }

  hasHSTrainingServiceReportItems(): boolean {
    return this._hsTrainingServiceReportInformation ? this._hsTrainingServiceReportInformation.length > 0 : false;
  }
  isHRManagerOrServiceOwner(): boolean {
    return this._claimsHelper.isHRManagerOrServiceOwner();
  }

  isHSServiceOwnerOrCoordinator(): boolean {
    return this._claimsHelper.isHSServiceOwnerOrCoordinator();
  }

  // End of private methods

  // Public methods
  ngOnInit() {
    let employeeId = this._claimsHelper.getEmpIdOrDefault();
    this._store.let(fromRoot.getServiceReportInformation).subscribe(serviceReportInformation => {
      if (isNullOrUndefined(serviceReportInformation)) {
        this._store.dispatch(new ServiceReportingLoadAction(employeeId));
      }
      else {
        this._elServiceReportInformation = this._getELServiceReport(serviceReportInformation);
        this._hsServiceReportInformation = this._getHSServiceReport(serviceReportInformation);
        this._elTrainingServiceReportInformation = this._getELTrainingServiceReport(serviceReportInformation);
        this._hsTrainingServiceReportInformation = this._getHSTrainingServiceReport(serviceReportInformation);
      }
    });
    this._loading$ = this._store.let(fromRoot.getServiceReportInformationLoading);
  }
  // End of public methods
}