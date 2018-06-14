import { StringHelper } from './../../../shared/helpers/string-helper';
import { AtlasApiRequestWithParams, AtlasParams } from './../../../shared/models/atlas-api-response';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { LocaleService, TranslationService } from 'angular-l10n';
import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { LoadSearchResultsAction } from './../../actions/search.actions';
import { AeIconSize } from '../../../atlas-elements/common/ae-icon-size.enum';
import { BaseComponent } from '../../../shared/base-component';
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';
import * as fromRoot from '../../../shared/reducers';
import { isNullOrUndefined } from "util";

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SearchComponent extends BaseComponent implements OnInit {
  //private variables
  private _iconDefault: AeIconSize = AeIconSize.none;
  private _searchFormGroup: FormGroup;
  private _showSearch: boolean;
  //end of private variables
  //public properties
  get iconDefault(): AeIconSize {
    return this._iconDefault;
  }
  get searchFormGroup(): FormGroup {
    return this._searchFormGroup;
  }
  get showSearch(): boolean {
    return this._showSearch;
  }
  //end of public properties
  //output bindings
  @Output('onSearch') _onSearch: EventEmitter<boolean> = new EventEmitter<boolean>();
  //end of output bindings
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _route: Router
    , private _fb: FormBuilder
    , private _store: Store<fromRoot.State>
  ) {
    super(_localeService, _translationService, _cdRef);
  }


  @Input('closeSearchBox')
  get closeSearchBox(): boolean {
    return this._showSearch;
  }
  set closeSearchBox(value: boolean) {
    this._showSearch = !value;
  }

  //public methods
  public getSearchStyle(): string {
    if (this._showSearch) {
      return "header__search-input--active";
    }
  }

  public showHideSearch() {
    this._showSearch = !this._showSearch;
    this._onSearch.emit(true);
  }
  public search($event) {
    if (!StringHelper.isNullOrUndefinedOrEmpty(this._searchFormGroup.controls['searchTerm'].value)) {   
      let navigationExtras: NavigationExtras = {
        queryParamsHandling: 'merge'
      };
      let url = 'search/results/' + this._searchFormGroup.controls['searchTerm'].value;
      this.clearSearch($event);
      this._route.navigate([url], navigationExtras);
    }
  }

  public submitWhenEnter($event) {
    if ($event.which == 13 || $event.keyCode == 13) {
      this.search($event);
    }
  }
  public clearSearch($event) {
    this._searchFormGroup.controls['searchTerm'].setValue('');
     this._showSearch = !this._showSearch;
    this._onSearch.emit(true);
  }
  ngOnInit() {
    this._searchFormGroup = this._fb.group(
      { searchTerm: [{ value: null, disabled: false }, null] }
    );
  }

}
