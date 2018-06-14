import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, Input, ViewChild, ViewContainerRef, AfterContentInit, ComponentFactory, ComponentFactoryResolver } from '@angular/core';
import { BaseComponent } from "../../../shared/base-component";
import { LocaleService, TranslationService } from "angular-l10n";
import { Store } from "@ngrx/store";
import { CompanyStructure } from "../../models/company-structure";
import { isNullOrUndefined } from "util";
import { CompanySiteView } from "../../models/company-site-view";
import { Router, Params } from "@angular/router";
import { ClaimsHelperService } from "../../../shared/helpers/claims-helper";
import * as fromRoot from '../../../shared/reducers/index';

@Component({
  selector: 'company-structure-item',
  templateUrl: './company-structure-item.component.html',
  styleUrls: ['./company-structure-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompanyStructureItemComponent extends BaseComponent implements OnInit, AfterContentInit {
  //End of Private variables
  private _context: CompanyStructure;
  private _componentFactory: ComponentFactory<CompanyStructureItemComponent>;
  private _companyStructureData: Array<CompanySiteView>;
  private _loggedInUserCompanyId: string;
  //End of Private variables
  //Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _router: Router
    , private _cfr: ComponentFactoryResolver
    , private _claimsHelper: ClaimsHelperService
    , private _store: Store<fromRoot.State>
  ) {
    super(_localeService, _translationService, _cdRef);
    this._componentFactory = this._cfr.resolveComponentFactory(CompanyStructureItemComponent);
    this._loggedInUserCompanyId = this._claimsHelper.getCompanyId().toLowerCase();
  }
  //End of constructor

  //Public properties
  @Input('context')
  get context() {
    return this._context;
  }
  set context(val: CompanyStructure) {
    this._context = val;
  }
  @Input('companyStructureData')
  get companyStructureData() {
    return this._companyStructureData;
  }
  set companyStructureData(val: Array<CompanySiteView>) {
    this._companyStructureData = val;
  }

  get contextData() {
    return this._context;
  }

  //End of public properties

  // View Child Properties
  @ViewChild('childCompany', { read: ViewContainerRef })
  _childCompany: ViewContainerRef;
  //End of View Child Properties

  //Private methods
  private _createChildren() {
    if (!isNullOrUndefined(this._context) && !isNullOrUndefined(this._context.Children) && (this._context.Children.length > 0)) {
      this._context.Children.forEach(child => {
        let childRef = this._childCompany.createComponent(this._componentFactory);
        let children = null;
        if (!isNullOrUndefined(this._companyStructureData)) {
          children = this.companyStructureData.filter(f => f.ParentId === child.Id);
        }
        let childContxet = new CompanyStructure(child.Id, child.Name, children);
        childRef.instance.context = childContxet;
        childRef.instance.companyStructureData = this._companyStructureData;
      });
    }
  }
  //End of private methods

  //Public methods
  hasChildren(): boolean {
    return (!isNullOrUndefined(this._context) && !isNullOrUndefined(this._context.Children) && (this._context.Children.length > 0));
  }
  gotoCompany(companyId: string) {   
    if (this._loggedInUserCompanyId === companyId.toLowerCase()) {
      this._router.navigate(["/company"]);
    } else {
      this._router.navigate(["/company", companyId], { queryParams: { cid: companyId } });
    }

  }
  //End of Public methods

  ngOnInit(): void {
  }

  ngAfterContentInit(): void {
    this._createChildren();
  }

}
