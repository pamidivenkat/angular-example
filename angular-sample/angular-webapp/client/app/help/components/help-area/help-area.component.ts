import { SortDirection } from '../../../atlas-elements/common/models/ae-sort-model';
import { AtlasApiRequestWithParams, AtlasParams } from '../../../shared/models/atlas-api-response';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { AeIconSize } from '../../../atlas-elements/common/ae-icon-size.enum';
import { HelpArea } from '../../models/helparea';
import { Observable } from 'rxjs/Rx';
import { Store } from '@ngrx/store';
import { BaseComponent } from '../../../shared/base-component';
import { IBreadcrumb } from '../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../../../atlas-elements/common/services/breadcrumb-service';
import { LocaleService, TranslationService } from 'angular-l10n';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Output, EventEmitter } from '@angular/core';
import * as fromRoot from '../../../shared/reducers';
import { LoadHelpAreasAction } from "../../actions/help.actions";
import * as Immutable from 'immutable';

@Component({
    selector: 'help-area',
    templateUrl: './help-area.component.html',
    styleUrls: ['./help-area.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelpAreaComponent extends BaseComponent implements OnInit {
    private _helpAreas: Observable<Immutable.List<HelpArea>>;
    private _iconSize: AeIconSize = AeIconSize.medium;
    private _applyScroll: boolean = true;
    private _maxHeight: string = '20em';
    private _loadedHelpAreas: boolean;
    constructor(protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef
        , private _breadcrumbService: BreadcrumbService
        , private _store: Store<fromRoot.State>) {
        super(_localeService, _translationService, _cdRef);

    }
    @Output('onShowHelpAreaContent') _onShowHelpAreaContent: EventEmitter<any> = new EventEmitter();
    get HelpAreas(): Observable<Immutable.List<HelpArea>> {
        return this._helpAreas;
    }
    get IconSize(): AeIconSize {
        return this._iconSize;
    }
    ngOnInit() {
        this._store.let(fromRoot.getHelpAreasInfoProgressStatus).takeUntil(this._destructor$).subscribe(isLoaded => {
            if (!isLoaded) {
                let params: AtlasParams[] = new Array();
                params.push(new AtlasParams('fields', 'Id,Name,IconName,Code'))
                 let helpAreasApiRequest = new AtlasApiRequestWithParams(0, 0, 'Name', SortDirection.Ascending, params);
               this._store.dispatch(new LoadHelpAreasAction(helpAreasApiRequest));
                this._helpAreas = this._store.let(fromRoot.getHelpAreasInfo);
            }
            else
            {
                 this._helpAreas = this._store.let(fromRoot.getHelpAreasInfo);
            }
        });
    }
    getHelpAreaIcon(helpAreaIcon: string) {
        return "#" + helpAreaIcon;
    }

    private getMaxHeight(): string {
        if (this._applyScroll && !StringHelper.isNullOrUndefinedOrEmpty(this._maxHeight)) {
            return this._maxHeight;
        }
        return null;
    }
    showHelpAreaContent($event: any) {
        this._onShowHelpAreaContent.emit($event);
    }
    hasScroll(): boolean {
        if (this._applyScroll) {
            return true;
        }
        return null;
    }
    ngOnDestroy() {
        super.ngOnDestroy();
    }
}