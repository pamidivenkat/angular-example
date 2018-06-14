import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    EventEmitter,
    Input,
    OnInit,
    Output,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { AeTemplateComponent } from '../ae-template/ae-template.component';
import { BaseElement } from '../common/base-element';
import { TabSelection } from '../common/models/ae-tab-model';
import { createPopOverVm } from '../common/models/popover-vm';
import { AeTabItemComponent } from './ae-tab-item/ae-tab-item.component';

@Component({
    selector: 'ae-tab',
    templateUrl: './ae-tab.component.html',
    styleUrls: ['./ae-tab.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class AeTabComponent extends BaseElement implements OnInit, AfterContentInit {
    // Private Fields
    private _standard: boolean;
    private _standardWithIcon: boolean;
    private _tabs: AeTabItemComponent[];
    private _tabItemContentStream: BehaviorSubject<TemplateRef<any>>;
    private _defaultSelection: number;
    private _currentTab: number;
    private _contentInitialized: boolean = false;
    // End of Private Fields

    // Public properties

    get tabs(): AeTabItemComponent[] {
        return this._tabs;
    }

    @Input('standard')
    get standard() {
        return this._standard;
    }
    set standard(val: boolean) {
        this._standard = val;
    }

    @Input('standardWithIcon')
    get standardWithIcon() {
        return this._standardWithIcon;
    }
    set standardWithIcon(val: boolean) {
        this._standardWithIcon = val;
    }

    @Input('defaultSelection')
    get defaultSelection() {
        return this._defaultSelection;
    }
    set defaultSelection(val: number) {
        this._defaultSelection = val;
        this._currentTab = val;
    }

    // @Input('selectedTabIndex')
    // get SelectedTabIndex() {
    //     return this._selectedTabIndex;
    // }
    // set SelectedTabIndex(val: number) {
    //     this._selectedTabIndex = val;
    // }

    // End of Public properties

    // Public Output bindings
    @Output('aeTabIndexChange')
    onTabIndexChange: EventEmitter<TabSelection> = new EventEmitter<TabSelection>();
    // End of Public Output bindings

    // Public ViewChild bindings
    @ContentChildren(AeTabItemComponent)
    tabsList: QueryList<AeTabItemComponent>;

    @ViewChild('popOverTemplate')
    _popOverTemplate: AeTemplateComponent<any>;
    // End of Public ViewChild bindings

    // Public ViewContent bindings
    // End of Public ViewContent bindings

    // Constructor
    constructor() {
        super();
        this._defaultSelection = this._currentTab = 0;
    }
    // End of constructor

    // Public methods
    isStandardHeader(): boolean {
        return (!isNullOrUndefined(this._standard) || !isNullOrUndefined(this._standardWithIcon)) &&
            (this._standard || this._standardWithIcon);
    }

    tabHeaderClick(tab: AeTabItemComponent, selectedTabIndex: number): void {
        let tabSelection : TabSelection = new TabSelection();
        tabSelection.previousTabIndex = this._currentTab;
        tabSelection.currentTabIndex = selectedTabIndex;
        
        this._currentTab = selectedTabIndex;
        if (!isNullOrUndefined(tab.contentTemplate)) {
            this._tabItemContentStream.next(tab.contentTemplate.template);
        }
        
        this.onTabIndexChange.emit(tabSelection);
    }

    getTabItemContentTempalteStream(): BehaviorSubject<TemplateRef<any>> {
        return this._tabItemContentStream;
    }

    getTabItemHeaderTemplate(tab: AeTabItemComponent): TemplateRef<any> {
        return tab.headerTemplate.template;
    }

    ngOnInit(): void {
        super.ngOnInit();
    }

    ngAfterContentInit(): void {
        this._contentInitialized = true;
        this._tabs = this.tabsList.toArray();
        let defaultTab = this._tabs[this._defaultSelection];
        this._tabs.map((t) => {
            t.checkHeaderTemplateDefined(this.isStandardHeader());
            t.checkContentTemplateDefined();
        })
        if (!isNullOrUndefined(defaultTab) && !isNullOrUndefined(defaultTab.contentTemplate)) {
            this._tabItemContentStream = new BehaviorSubject<TemplateRef<any>>(defaultTab.contentTemplate.template);
        } else {
            this._tabItemContentStream = new BehaviorSubject<TemplateRef<any>>(null);
        }
    }

    getSelectedTabIndex(): number {
        return this._currentTab;
    }
    getPopOverVm(rowContext: any) {
        if (rowContext.headerTitle)
            return createPopOverVm<any>(null, { Text: rowContext.headerTitle }, null, true);
        return null;
    }
    // End of public methods

}
