import { AeTemplateComponent } from './../ae-template/ae-template.component';
import { AeIconSize } from '../common/ae-icon-size.enum';
import { isNullOrUndefined } from 'util';
import { BehaviorSubject, Subject } from 'rxjs/Rx';
import { AeTabStripItemComponent } from './ae-tabstrip-item/ae-tabstrip-item.component';
import { Router, ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    QueryList,
    TemplateRef,
    ViewEncapsulation,
    ViewChild
} from '@angular/core';
import { BaseElement } from './../common/base-element';
import { createPopOverVm } from './../common/models/popover-vm';

@Component({
    selector: 'ae-tabstrip',
    templateUrl: './ae-tabstrip.component.html',
    styleUrls: ['./ae-tabstrip.component.scss'],
    providers: [RouterLink, RouterLinkActive],
    encapsulation: ViewEncapsulation.None

    // , changeDetection: ChangeDetectionStrategy.OnPush //TODO:Need to avoid this , count in the tab strip is not updating if we remove this
})
export class AeTabStripComponent extends BaseElement implements OnInit, AfterContentInit, OnChanges {
    // Private Fields
    private _standard: boolean;
    private _standardWithIcon: boolean;
    private _tabs: AeTabStripItemComponent[];
    private _defaultSelection: number;
    private _currentNavigateUrl: string;
    private _selectedTabIndex: number;
    private _contentInitialized: boolean = false;
    private _navigatedUrl: string
    private _isTabButton: boolean;
    private _hasAnyTabStripCountChanged: boolean;
    private iconOneSize: AeIconSize = AeIconSize.medium;
    private _visibility$ = new Subject<boolean>();
    private _tabPopOverVisible: boolean = false;
    // End of Private Fields

    // Public properties
    get tabs(): AeTabStripItemComponent[] {
        return this._tabs;
    }
    @Input('standard')
    get standard() {
        return this._standard;
    }
    set standard(val: boolean) {
        this._standard = val;
    }

    @Input('isTabButton')
    get isTabButton() {
        return this._isTabButton;
    }
    set isTabButton(val: boolean) {
        this._isTabButton = val;
    }



    @Input('standardWithIcon')
    get standardWithIcon() {
        return this._standardWithIcon;
    }
    set standardWithIcon(val: boolean) {
        this._standardWithIcon = val;
    }

    @Input('navigatedUrl')
    get navigatedUrl(): string {
        return this._navigatedUrl;
    }
    set navigatedUrl(val: string) {
        this._navigatedUrl = val;
    }



    // End of Public properties

    // Public Output bindings
    // End of Public Output bindings

    // Public ViewChild bindings
    @ContentChildren(AeTabStripItemComponent)
    tabStripsList: QueryList<AeTabStripItemComponent>;
    @ViewChild('popOverTemplate')
    _popOverTemplate: AeTemplateComponent<any>;
    // End of Public ViewChild bindings

    // Public ViewContent bindings
    // End of Public ViewContent bindings

    // Constructor
    constructor(private _router: Router, private _route: ActivatedRoute, private _cdr: ChangeDetectorRef) {
        // private route: ActivatedRoute,
        //        private router: Router
        super();
    }
    // End of constructor

    // Private methods
    getPopOverVm(rowContext: any) {
        if (rowContext.Title)
            return createPopOverVm<any>(null, { Text: rowContext.Title }, null, true);
        return null;
    }
    _setVisibility() {
        this._tabPopOverVisible = !this._tabPopOverVisible;
        this._visibility$.next(this._tabPopOverVisible);
    }
    _hidePopover() {
        this._tabPopOverVisible = false;
        this._visibility$.next(this._tabPopOverVisible);
    }
    isStandardHeader(): boolean {
        return this._standard || this._standardWithIcon;
    }

    hasTabButton(): boolean {
        return this._isTabButton;
    }

    hasCount(tab: AeTabStripItemComponent): boolean {
        return tab.HasCount;
    }

    getTabItemHeaderTemplate(tab: AeTabStripItemComponent): TemplateRef<any> {
        return tab.headerTemplate.template;
    }


    // End of private methods

    // Public methods

    ngAfterContentInit(): void {
        this._contentInitialized = true;
        this._tabs = this.tabStripsList.toArray();
    }
    ngOnInit(): void {
        super.ngOnInit();
    }
    ngOnChanges(): void {
        if (this._contentInitialized)
            this._tabs = this.tabStripsList.toArray();
    }
    getIndex(tab: AeTabStripItemComponent, tabs: AeTabStripItemComponent[]): number {
        return tabs.indexOf(tab);
    }
    // End of public methods

}
