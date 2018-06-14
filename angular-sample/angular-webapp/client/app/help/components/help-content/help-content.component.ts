import { replaceDocumentIdWithFileDownload } from '../../../home/common/extract-helpers';
import { isNullOrUndefined } from 'util';
import { HelpContent } from '../../models/helparea';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { AeIconSize } from '../../../atlas-elements/common/ae-icon-size.enum';
import { Observable } from 'rxjs/Rx';
import { Store } from '@ngrx/store';
import { BaseComponent } from '../../../shared/base-component';
import { IBreadcrumb } from '../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../../../atlas-elements/common/services/breadcrumb-service';
import { LocaleService, TranslationService } from 'angular-l10n';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import * as fromRoot from '../../../shared/reducers';
import {
    LoadHelpAreaContentBodyAction,
    LoadHelpAreaContentsAction
} from '../../actions/help.actions';
import * as Immutable from 'immutable';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Component({
    selector: 'help-content',
    templateUrl: './help-content.component.html',
    styleUrls: ['./help-content.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelpContentComponent extends BaseComponent implements OnInit {
    private _helpContents: Observable<Immutable.List<HelpContent>>;
    private _helpContentItems: Immutable.List<HelpContent>;
    private _helpAreaName: string = "";
    private _openedArticles: Array<HelpContent>;
    @Output('onHelpContentCancel') onClickHelpContentCancel: EventEmitter<any> = new EventEmitter();
    @Input('HelpcontentVM')
    set HelpcontentVM(val: Immutable.List<HelpContent>) {
        this._helpContentItems = val;
    }
    get HelpcontentVM() {
        return this._helpContentItems;
    }
    
    @Input('HelpAreaName')
    get HelpAreaName() {
        return this._helpAreaName;
    }
    set HelpAreaName(val: string) {
        this._helpAreaName = val;
    }
    get HelpContentItems() {
        return this._helpContentItems;
    }
    constructor(protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef
        , private _breadcrumbService: BreadcrumbService
        , private _store: Store<fromRoot.State>
        , private sanitizer: DomSanitizer
    ) {
        super(_localeService, _translationService, _cdRef);
        this._openedArticles = new Array();

    }
    private _checkArticleVisibility(item: HelpContent) {
        let index = this._openedArticles.findIndex((article) => article.Id === item.Id);
        if (index !== -1) {
            return true;
        } else {
            return false;
        }
    }

    getHelpAreaContentbody(helpContent: HelpContent) {
        if (isNullOrUndefined(helpContent.Body)) {
            this._store.dispatch(new LoadHelpAreaContentBodyAction(helpContent.Id));
        }
        let index = this._openedArticles.findIndex((article) => article.Id === helpContent.Id);
        if (index !== -1) {
            this._openedArticles.splice(index, 1);
        } else {
            this._openedArticles.push(helpContent);
        }
    }
    isOpen(item: HelpContent): boolean {
        return this._checkArticleVisibility(item);
    }

    ngOnInit() {


    }
    onHelpContentCancel() {
        this.onClickHelpContentCancel.emit(false);
    }
    getBody(body: string): SafeHtml {
        if (isNullOrUndefined(body)) return;
        return replaceDocumentIdWithFileDownload(body, this.sanitizer, true);
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }
}