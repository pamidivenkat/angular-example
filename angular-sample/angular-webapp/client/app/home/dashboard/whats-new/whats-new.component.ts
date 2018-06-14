import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { replaceDocumentIdWithFileDownload } from '../../common/extract-helpers';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { LocaleService, TranslationService } from 'angular-l10n';
import * as Immutable from 'immutable';
import { isNullOrUndefined } from 'util';

import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { BaseComponent } from '../../../shared/base-component';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import * as fromRoot from '../../../shared/reducers/index';
import {
  CreateUpdateWhatsNewUsermapAction,
  LoadWhatsNewItemsAction,
  UpdateWhatsNewAsReadAction,
  UpdateWhatsNewAsReadCompleteAction,
} from '../../actions/whats-new.actions';
import { WhatsNew, WhatsNewUserMap } from '../../models/whats-new';

@Component({
  selector: 'whats-new',
  templateUrl: './whats-new.component.html',
  styleUrls: ['./whats-new.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WhatsNewComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _newItems: Immutable.List<WhatsNew>;
  private _newItemsCount: number;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _showModel: boolean;
  private _usermaps: WhatsNewUserMap[];
  private _canShowPopup: boolean;
  // End of Private Fields

  // Public properties
  get lightClass(): AeClassStyle {
    return this._lightClass;
  }

  get newItems(): Immutable.List<WhatsNew> {
    return this._newItems;
  }
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _claims: ClaimsHelperService
    , private sanitizer: DomSanitizer
  ) {
    super(_localeService, _translationService, _cdRef);
    this._newItemsCount = 0;
    this._showModel = false;
    this._canShowPopup = false;
  }
  // End of constructor

  // Private methods
  // End of private methods

  // Public methods
  showWhatsNew(): boolean {
    return this._showModel && (this._newItems && this._newItems.count() > 0);
  }

  closeModal() {
    this._showModel = false;
  }

  markAsRead() {
    if (this._usermaps && this._usermaps.length > 0) {
      this._store.dispatch(new UpdateWhatsNewAsReadAction(this._usermaps))
    }

    this._showModel = false;
    this._cdRef.markForCheck();
  }

  updateImageUrl(body: string): SafeHtml {
    return replaceDocumentIdWithFileDownload(body, this.sanitizer, true);
  }

  ngOnInit() {
    this._store.let(fromRoot.getWhatsNewPopupStatus).takeUntil(this._destructor$).subscribe((data) => {
      this._canShowPopup = data;
      if (this._canShowPopup) {
        this._store.dispatch(new LoadWhatsNewItemsAction(true));
        this._showModel = true;
      }
    })
    this._store.let(fromRoot.getWhatsNewItems).takeUntil(this._destructor$).subscribe((data) => {
      if (!isNullOrUndefined(data)) {
        this._newItems = data;
        this._newItemsCount = this._newItems.count();

        if (this._newItemsCount > 0) {
          let userMaps: WhatsNewUserMap[] = [];
          this._newItems.forEach((item: WhatsNew) => {
            if (item.WhatsNewUserMap.length > 0) {
              let userMap = item.WhatsNewUserMap[0];
              userMap.ReminderCount += 1;
              userMaps.push(userMap);
            } else {
              let userMap = new WhatsNewUserMap();
              userMap.UserId = this._claims.getUserId();
              userMap.WhatsNewId = item.Id;
              userMap.IsRead = false;
              userMap.ReminderCount = 0;
              userMap.CompanyId = this._claims.getCompanyId();
              userMaps.push(userMap);
            }
          })
          if (isNullOrUndefined(this._usermaps)) {
            this._store.dispatch(new CreateUpdateWhatsNewUsermapAction(userMaps));
          }

        } else {
          this._showModel = false;
        }
        this._cdRef.markForCheck();
      }
    })

    this._store.let(fromRoot.getWhatsNewUserMaps).takeUntil(this._destructor$).subscribe((data) => {
      this._usermaps = data;
    })
  }

  ngOnDestroy() {
    super.ngOnDestroy()
  }

  // End of public methods

}
