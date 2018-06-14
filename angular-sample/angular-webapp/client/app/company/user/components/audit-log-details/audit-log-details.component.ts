import { isNullOrUndefined } from 'util';
import { LogVersion } from '../../models/log-version.model';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Rx';
import { Permission } from '../../models/permission-model';
import { AuditLog } from '../../models/audit-log.model';
import { LocaleDatePipe, LocaleService, TranslationService } from 'angular-l10n';
import * as fromRoot from '../../../../shared/reducers/index';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { BaseComponent } from '../../../../shared/base-component';

@Component({
  selector: 'audit-log-details',
  templateUrl: './audit-log-details.component.html',
  styleUrls: ['./audit-log-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class AuditLogDetailsComponent extends BaseComponent implements OnInit, OnDestroy {
  private _selectedLog: AuditLog;
  private _permissionsList: Permission[];
  private _permissionsListSubscription$: Subscription;

  @Input('selectedLog')
  set selectedLog(val: AuditLog) {
    this._selectedLog = val;
  }
  get selectedLog(): AuditLog {
    return this._selectedLog;
  }
  

  @Output('onCancel')
  _onCancel: EventEmitter<string> = new EventEmitter<string>();

  get permissionsList(): Permission[] {
    return this._permissionsList;
  }

  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _cdRef: ChangeDetectorRef
    , private _store: Store<fromRoot.State>
    , private _localeDatePipe: LocaleDatePipe
  ) {
    super(_localeService, _translationService, _cdRef);
  }

  onFormClosed(e) {
    this._onCancel.emit('close');
  }

  ngOnInit() {
    this._permissionsListSubscription$ = this._store.let(fromRoot.getCurrentLogVersionData).subscribe(res => {
      if (!isNullOrUndefined(res) && !isNullOrUndefined(res[0])) {
        this._permissionsList = res[0].Permissions;
        this._cdRef.markForCheck();
      }
    })
  }

  ngOnDestroy() {
    if (!isNullOrUndefined(this._permissionsListSubscription$)) {
      this._permissionsListSubscription$.unsubscribe();
    }
    super.ngOnDestroy();
  }

}
