import { SortDirection } from '../common/models/ae-sort-model';
import { AeLoaderType } from '../common/ae-loader-type.enum';
import { PagingInfo } from '../common/models/ae-paging-info';
import { DataTableOptions } from '../common/models/ae-datatable-options';
import { AeSortModel } from '../common/models/ae-sort-model';
import { AePaginationComponent } from '../ae-pagination/ae-pagination.component';
import { AeNavActionsOption } from '../common/models/ae-nav-actions-options';
import { AeDataTableAction } from '../common/models/ae-data-table-action';
import { AePageChangeEventModel } from '../common/models/ae-page-change-event-model';
import { isArray, isNullOrUndefined } from 'util';
import { AeIDataItem } from '../common/models/ae-idataitem.model';
import { BehaviorSubject, ReplaySubject, Subject, Subscription } from 'rxjs/Rx';
import { AeColumnComponent } from './ae-column/ae-column.component';
import { BaseElementGeneric } from '../common/base-element-generic';
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    Input,
    IterableDiffers,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    ViewChild,
    ViewEncapsulation,
    Renderer2,
    HostListener
} from '@angular/core';

import * as Immutable from 'immutable';
import { Tristate } from '../common/tristate.enum';
import { ObjectHelper } from '../../shared/helpers/object-helper';
import { AeIconSize } from '../common/ae-icon-size.enum';
import { AeDropVm } from '../ae-drag-drop/common/models/ae-drop-vm';
import { TweenLite } from 'gsap';
import Draggable from 'gsap/Draggable';
import { CommonHelpers } from '../../shared/helpers/common-helpers';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'ae-datatable',
    templateUrl: './ae-datatable.component.html',
    styleUrls: ['./ae-datatable.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class AeDatatableComponent<T> extends BaseElementGeneric<any> implements OnInit, AfterViewInit, AfterContentInit, OnDestroy {

    // Private Fields
    private _columns: AeColumnComponent<T>[];
    private _dataSource: BehaviorSubject<Immutable.List<T>>;
    private _defaultOptions: DataTableOptions;
    private _numberOfRows: number;
    private _defaultItems: Immutable.List<Immutable.List<T>>;
    private _autoGenerateColumns: boolean;
    private _pageChanged: EventEmitter<AePageChangeEventModel>;
    private _rows;
    private _actions: Immutable.List<AeDataTableAction>;
    private _splitButtonOptions: Immutable.List<AeNavActionsOption<any>>;
    private _givenDataSet: Immutable.List<T>;
    private _currentRowIndex: number;
    private _sortedDataSet: Immutable.List<T>;
    private _totalRecords: BehaviorSubject<number>;
    private _currentPage: BehaviorSubject<number>;
    private _defaultNoOfRows: number;
    private _noOfPageLinks: number;
    private _onSort: EventEmitter<AeSortModel>;
    private _onDropComplete: EventEmitter<any>;
    private _loading: boolean;
    private _loaderType: AeLoaderType = AeLoaderType.Bars;
    private _currentSort: AeSortModel;
    private _showDataRows: boolean;
    private _currentPageNumber: number;
    private _pageChangeSubscription: Subscription;
    private _rowsPerpageChangeSubscription: Subscription;
    private _rowSelector: (rowContext) => boolean;
    private _mobileViewColumn: AeColumnComponent<T>;
    private _mobileViewColumnIndex: number;
    private _activatedRows: Array<number>;
    private _inlineEdit: boolean;
    private _internalContextProperties: Array<string>;
    private _scrollListner: ReplaySubject<any>;
    private _scrollData: { left: number, top: number };
    private _hideColumns: Array<number>;
    private _hideColumns$: Subject<number | Array<number>>;
    private _draggableRows: boolean = false;
    private _dragIconSize = AeIconSize.small;
    private _dragOverRow: number = -1;
    private _actionsSubscriptions: Subscription[] = [];
    private _hideColumnsSubscription: Subscription;
    private _scrollListnerSubscription: Subscription;
    private _sortables: Array<any> = [];
    private _selectable: boolean = false;
    private _selectedRows: EventEmitter<any>;
    private _checkedRows: Array<string>;
    private _clearSelection: BehaviorSubject<boolean>;
    private _clearSelectionSubscription: Subscription;
    // End of Private Fields

    // Getter Fields
    get dragIconSize() {
        return this._dragIconSize;
    }
    // End of Getter Fields

    // Public properties

    get columns(): AeColumnComponent<T>[] {
        return this._columns;
    }

    get rows() {
        return this._rows;
    }

    get defaultItems(): Immutable.List<Immutable.List<T>> {
        return this._defaultItems;
    }

    get showDataRows(): boolean {
        return this._showDataRows;
    }

    get loaderType(): AeLoaderType {
        return this._loaderType;
    }

    get defaultNoOfRows(): number {
        return this._defaultNoOfRows;
    }

    get noOfPageLinks(): number {
        return this._noOfPageLinks;
    }

    get currentPageNumber(): number {
        return this._currentPageNumber;
    }


    @Input('defaultOptions')
    get defaultOptions() {
        return this._defaultOptions;
    }
    set defaultOptions(val: DataTableOptions) {
        if (val) {
            this._defaultOptions = val;
        } else {
            this._defaultOptions = new DataTableOptions(1, 10);
        }
        this._updateOptions();
    }

    @Input('dataSource')
    get dataSource() {
        return this._dataSource;
    }
    set dataSource(val: BehaviorSubject<Immutable.List<T>>) {
        this._dataSource = val;
    }

    @Input('autoGenerateColumns')
    get autoGenerateColumns() {
        return this._autoGenerateColumns;
    }
    set autoGenerateColumns(val: boolean) {
        if (isNullOrUndefined(this._autoGenerateColumns)) {
            this._autoGenerateColumns = val;
        }
    }

    @Input('actions')
    get actions() {
        return this._actions;
    }
    set actions(val: Immutable.List<AeDataTableAction>) {
        this._actions = val;
    }

    @Input('totalRecords')
    get totalRecords() {
        return this._totalRecords;
    }
    set totalRecords(val: BehaviorSubject<number>) {
        this._totalRecords = val;
    }

    @Input('loading')
    get loading() {
        return this._loading;
    }
    set loading(val: boolean) {
        this._loading = val;
    }

    @Input('rowSelector')
    get rowSelector() {
        return this._rowSelector;
    }
    set rowSelector(val: (rowContext) => boolean) {
        this._rowSelector = val;
    }

    @Input('inlineEdit')
    get inlineEdit() {
        return this._inlineEdit;
    }
    set inlineEdit(val: boolean) {
        this._inlineEdit = val;
    }

    @Input('draggableRows')
    get draggableRows() {
        return this._draggableRows;
    }
    set draggableRows(val: boolean) {
        this._draggableRows = val;
    }

    @Input('selectable')
    get selectable() {
        return this._selectable;
    }

    @Input('clearSelection')
    get clearSelection() {
        return this._clearSelection;
    }
    set clearSelection(val: BehaviorSubject<boolean>) {
        this._clearSelection = val;
    }

    set selectable(val: boolean) {
        this._selectable = val;
    }

    get scrollListner() {
        return this._scrollListner;
    }

    get visibleColumns() {
        return this._hideColumns$;
    }

    get numberOfRows() {
        return this._numberOfRows;
    }
    // End of Public properties

    // Public Output bindings
    @Output('pageChanged')
    get pageChanged() {
        return this._pageChanged;
    }

    @Output('onSort')
    get onSort() {
        return this._onSort;
    }

    @Output('onDropComplete')
    get onDropComplete() {
        return this._onDropComplete;
    }

    @Output('onSelectRows')
    get selectedRows() {
        return this._selectedRows;
    }
    // End of Public Output bindings

    // Public ViewChild bindings
    @ViewChild(AePaginationComponent)
    pagination: AePaginationComponent;

    @ViewChild('tableBody')
    tableBody: ElementRef;

    @ViewChild('tableHeader')
    tableHeader: ElementRef;
    // End of Public ViewChild bindings


    // Public ViewContent bindings
    @ContentChildren(AeColumnComponent)
    cols: QueryList<AeColumnComponent<T>>;
    // End of Public ViewContent bindings

    // Constructor
    constructor(private _el: ElementRef, private _differs: IterableDiffers,
        private _renderer: Renderer2, private _changeDetector: ChangeDetectorRef) {
        super(_changeDetector);
        this._pageChanged = new EventEmitter<AePageChangeEventModel>();
        this._scrollListner = new ReplaySubject();
        this._onSort = new EventEmitter<AeSortModel>();
        this._onDropComplete = new EventEmitter<any>();
        this._selectedRows = new EventEmitter<Array<string>>();
        this._numberOfRows = 10;
        this._showDataRows = false;
        this._clearSelection = new BehaviorSubject<boolean>(false);
        this._activatedRows = new Array();
        this._checkedRows = new Array<string>();
        this._hideColumns = new Array();
        this._hideColumns$ = new Subject<number | Array<number>>();
        this._internalContextProperties = new Array('Row', 'Column');
    }
    // End of constructor

    //public properties     
    //end of public properties
    // Private methods

    // End of private methods
    private _createDefaultItems(): void {
        let colLength = this._columns.length;
        let rowArray = new Array<Immutable.List<T>>(this._numberOfRows);
        for (let i = 0; i < this._numberOfRows; i++) {
            let colArray: Array<T> = new Array<T>(colLength);
            for (let j = 0; j < colLength; j++) {
                colArray[j] = Object.assign({}, this._getContextObject(j, i));
            }
            rowArray[i] = Immutable.List(colArray);
        }
        this._defaultItems = Immutable.List(rowArray);
        this.cdr.markForCheck();
    }

    private _getContextObject(colIndex: number, rowNumber: number): any {
        let contextObj = this.isInlineEdit() ? this.getEditTemplate(this._columns[colIndex]).contextObject :
            this.getCellTemplate(this._columns[colIndex]).contextObject;
        contextObj = ObjectHelper.merge(contextObj, { Column: colIndex, Row: rowNumber });
        return contextObj;
    }

    private _updateData(nextDataSet: Immutable.List<T>): void {
        for (let i = 0; i < this._defaultItems.count(); i++) {
            let row = this._defaultItems.get(i);
            for (let j = 0; j < row.count(); j++) {
                let cell = row.get(j);
                for (let key in cell) {
                    this._updateCellValue(cell, key, null);
                }

            }

        }
        for (let i = 0; i < nextDataSet.count(); i++) {
            let row = this._defaultItems.get(i);
            if (row) {
                let dataItem = nextDataSet.get(i);
                for (let j = 0; j < row.count(); j++) {
                    let cell = row.get(j);
                    for (let key in cell) {
                        this._updateCellValue(cell, key, dataItem[key]);
                    }
                }

            }
        }
    }

    private _pageChange(pageNumber: number, pageSize: number) {
        this._pageChanged.emit({ pageNumber: pageNumber, noOfRows: pageSize });
    }

    private _rowsPerPageChanged(noOfRows: number) {
        this._numberOfRows = noOfRows;
        this._updateRows();
    }

    getHeaderTemplate(col: AeColumnComponent<T>) {
        return col.getHeaderTemplate();
    }

    getCellTemplate(col: AeColumnComponent<T>) {
        return col.getCellTemplate();
    }

    getEditTemplate(col: AeColumnComponent<T>) {
        return col.getEditTemplate();
    }

    // private _getDataItemForColumn(row: number, index: number) {
    //     let dataRowItem = this._defaultItems.get(row);
    //     return dataRowItem.get(index);
    // }

    getDataItemForColumn(rowItem: any, index: number) {
        return rowItem.get(index);
    }

    private _getDataItemForRow(index: number) {
        return this._sortedDataSet.get(index);
    }

    private _getDefaultItems() {
        return this._defaultItems;
    }

    isSortable(column: AeColumnComponent<any>) {
        return column.sortable;
    }

    isColumnVisible(colIndex: number): boolean {
        let col = this._hideColumns.find(index => index === colIndex);
        return isNullOrUndefined(col) ? true : false;
    }

    getActions(row: number) {
        if (!isNullOrUndefined(this._sortedDataSet) && !isNullOrUndefined(this._sortedDataSet.get(row))) {
            let rowItem = this._sortedDataSet.get(row);
            let currentRowOptions: Array<AeDataTableAction> = new Array();
            this._actions.map((action) => {
                action.navActionsOption.Disabled = action.selectorFn(rowItem);
                if (action.navActionsOption.Disabled !== Tristate.False) {
                    currentRowOptions.push(action);
                }
            });
            let currentNavActions = currentRowOptions.map((action) => action.navActionsOption);
            return currentNavActions;
        }
    }

    sortByHeader(column: AeColumnComponent<any>) {
        if (this.isSortable(column)) {
            if (!isNullOrUndefined(this._currentSort)) {
                if (this._currentSort.SortField === column.sortKey) {
                    if (this._currentSort.Direction === SortDirection.Ascending) {
                        this.sortDescending(column);
                    } else {
                        this.sortAscending(column);
                    }
                }
                else {
                    this.sortAscending(column);
                }
            }
            else {
                this.sortAscending(column);
            }
        }
    }

    sortAscending(column: AeColumnComponent<any>) {
        if (!this.isAscendingDisabled(column)) {
            this._onSort.emit(this._getCurrentSort(column.sortKey, SortDirection.Ascending));
        }

    }

    sortDescending(column: AeColumnComponent<any>) {
        if (!this.isDescendingDisabled(column)) {
            this._onSort.emit(this._getCurrentSort(column.sortKey, SortDirection.Descending));
        }
    }

    private _getCurrentSort(sortKey: string, direction: SortDirection): AeSortModel {
        this._currentSort = { SortField: sortKey, Direction: direction };
        return this._currentSort;
    }

    private _sort(a, b, column: AeColumnComponent<any>) {
        let aValue = a[column.sortKey];
        let bValue = b[column.sortKey];
        if (aValue < bValue) {
            return -1;
        }
        if (aValue > bValue) {
            return 1;
        }
        if (aValue === bValue) {
            return 0;
        }
    }

    isActionable() {
        return !isNullOrUndefined(this._actions);
    }

    isSelectable(): boolean {
        return this._selectable;
    }

    setCurrentRowBySplitButton(row: number) {
        this._setCurrentRow(row);
    }

    private _setCurrentRow(row: number) {
        this._currentRowIndex = row;
    }
    private _updateRows() {
        this._rows = Immutable.Range(0, this._numberOfRows, 1);
        this._createDefaultItems();
    }

    private _getTotalRecords() {
        return this._totalRecords;
    }

    private _dropped(sourceIndex: number, targetIndex: number) {
        this._loading = true;
        if (Math.abs(targetIndex - sourceIndex) === 1 &&
            (targetIndex > sourceIndex)) {
            targetIndex = [sourceIndex, sourceIndex = targetIndex][0];
        }

        let itemSource = [].splice(0).concat(this._dataSource.getValue().toArray());

        let sourceItem = itemSource.find((v, index) => sourceIndex === index);
        if (!isNullOrUndefined(sourceItem)) {
            sourceItem = Object.assign({}, sourceItem);
        }
        itemSource = itemSource.filter((c, i) => sourceIndex !== i);

        itemSource.splice(targetIndex, 0, sourceItem);

        let pageNumber = this.pagination._getPage();
        let pageSize = this.pagination._getPageSize();
        let startIndex = ((pageNumber - 1) * pageSize) + 1;

        itemSource.forEach(c => {
            c.OrderIndex = startIndex;
            startIndex = startIndex + 1;
        });
        this._dataSource.next(Immutable.List(itemSource));
        this._loading = false;
        this._dragOverRow = -1;
        this._onDropComplete.emit(Immutable.List(itemSource));
    }

    private _buildSortableRow(element: Element, index) {
        let self = this;

        let dragger = new Draggable(element, {
            cursor: 'inherit',
            type: 'y',
            trigger: element.querySelector('.icon--dragable .dragable'),
            bounds: (<HTMLElement>self._el.nativeElement).querySelector('.table__table'),
            zIndexBoost: true,
            throwProps: true,
            edgeResistance: 0.65,
            onDrag: function (e) {
                let rowHeight = (<HTMLElement>this.target).getBoundingClientRect().height;
                let rowWidth = (<HTMLElement>this.target).getBoundingClientRect().width;

                if (this.x > (this.maxX + rowWidth) || this.x < (this.minX - rowWidth) || this.y > (this.maxY + rowHeight) || this.y < (this.minY - rowHeight)) {
                    // if out of bounds
                    this.endDrag();
                } else {
                    let droppables = (<HTMLElement>self._el.nativeElement).querySelectorAll('.table__row');
                    let i = droppables.length;
                    while (--i > -1) {
                        /* ALTERNATE TEST: you can use the static Draggable.hitTest() method for even more flexibility
                        , like passing in a mouse event to see if the mouse is overlapping with the element... */
                        if (Draggable.hitTest(droppables[i], e) && droppables[i] !== this.target) {
                            self._renderer.addClass(droppables.item(i), 'table__row--dragover');
                        } else {
                            self._renderer.removeClass(droppables.item(i), 'table__row--dragover');
                        }
                    }
                }
            },
            onDragEnd: function (e) {
                let hit: boolean = false;
                let droppables = (<HTMLElement>self._el.nativeElement).querySelectorAll('.table__row');
                let i = droppables.length;
                while (--i > -1) {
                    if (Draggable.hitTest(droppables[i], e) && droppables[i] !== this.target) {
                        hit = true;
                        let targetIndex = -1;
                        for (let iIndex = 0; iIndex < droppables.length; iIndex++) {
                            if (droppables[iIndex] === this.target) {
                                targetIndex = iIndex;
                                break;
                            }
                        }
                        self._renderer.removeClass(droppables.item(i), 'table__row--dragover');
                        if (i !== targetIndex) {
                            self._dropped(targetIndex, i);
                        }
                    }
                }

                if (!hit) {
                    let newSource = Immutable.List([].splice(0)).concat(self._dataSource.getValue()).toList();
                    self._dataSource.next(newSource);
                    self._changeDetector.markForCheck();
                }
            }
        });

        (<HTMLElement>element).removeAttribute('style');

        // Public properties and methods
        let sortable = {
            dragger: dragger,
            element: element,
            index: index
        };
        return sortable;
    }

    isAscendingDisabled(column: AeColumnComponent<any>): boolean {
        return !isNullOrUndefined(this._currentSort) && (this._currentSort.SortField === column.sortKey) && (this._currentSort.Direction === SortDirection.Ascending);
    }

    isDescendingDisabled(column: AeColumnComponent<any>): boolean {
        return !isNullOrUndefined(this._currentSort) && (this._currentSort.SortField === column.sortKey) && (this._currentSort.Direction === SortDirection.Descending);
    }

    isRowSelected(index: number) {
        let context = this._getDataItemForRow(index);
        context = Object.assign({}, context, { Row: index });
        if (!isNullOrUndefined(this._rowSelector)) {
            return this._rowSelector(context);
        }
        return false;
    }

    isRowActivated(index: number) {
        let row = this._activatedRows.find(ar => ar === index);
        return isNullOrUndefined(row) ? false : true;
    }

    isRowDragOver(index: number) {
        let row = this._activatedRows.find(ar => ar === index);
        return isNullOrUndefined(row) ? false : true;
    }

    isMobileViewCoumn(columnIndex: number) {
        return this._mobileViewColumnIndex === columnIndex;
    }
    isCurrentSortColumn(column: AeColumnComponent<any>) {
        if (!column.sortable || isNullOrUndefined(this._currentSort)) return false;
        return this._currentSort.SortField == column.sortKey;
    }

    private _init() {
        this._updateRows();
        if (this._actions) {
            this._actions = this._actions.map(a => {
                let sub = a.dtCommand.subscribe(() => {
                    a.command.next(this._sortedDataSet.get(this._currentRowIndex));
                });
                this._actionsSubscriptions.push(sub);
                return a;
            }).toList();
        }

        let subscription = this._dataSource.subscribe((nextDataSet) => {
            if (!isNullOrUndefined(nextDataSet)) {
                if (isNullOrUndefined(this._defaultItems)) {
                    this._createDefaultItems();
                }
                this._numberOfRows = nextDataSet.count();
                this._updateRows();
                this._givenDataSet = nextDataSet;
                this._sortedDataSet = Immutable.List(this._givenDataSet);
                if (this._numberOfRows > 0) {
                    this._showDataRows = true;
                    if (this.isInlineEdit()) {
                        this._updatePositions(this.tableBody.nativeElement);
                    }
                } else {
                    this._showDataRows = false;
                }
                this._updateData(nextDataSet);
                this._changeDetector.markForCheck();
                if (this.isInlineEdit()) {
                    setTimeout(() => {
                        let tblBodyEle = this.tableBody.nativeElement.parentNode;
                        this._updateBodyFrozenColumnsPosition(tblBodyEle.scrollLeft);
                    }, 100);
                }

                if (this.draggableRows) {
                    setTimeout(() => {
                        let rows = (<HTMLElement>this._el.nativeElement).querySelectorAll('.table__row');
                        if (!isNullOrUndefined(rows) && rows.length > 0) {
                            for (let i = 0; i < rows.length; i++) {
                                this._sortables.push(this._buildSortableRow(rows.item(i), i));
                            }
                        }
                    });
                }
            }
        });
        this._actionsSubscriptions.push(subscription);
    }

    showRowDetails(index: number) {
        let i = this._activatedRows.findIndex(ar => ar === index);
        if (i > -1) {
            this._activatedRows.splice(i, 1);
        } else {
            this._activatedRows.push(index);
        }
    }

    private _updatePositions(ele) {
        setTimeout(() => {
            let tableRow = ele.children[1].children[0];
            this._updateHeaderCellPositionsBasedOnbodyCells(4, tableRow);
        }, 100)
    }

    public updatePositions() {
        this._updatePositions(this.tableBody.nativeElement);
    }

    private _updateHeaderCellPositionsBasedOnbodyCells(startIndex: number, tableRow: any, ) {
        for (let i = startIndex; i < tableRow.children.length; i++) {
            let cell = tableRow.children[i];
            let headerCell = this.tableHeader.nativeElement.children[i];
            this._renderer.setStyle(headerCell, 'left', cell.offsetLeft + 'px');
            this._renderer.setStyle(headerCell, 'width', cell.offsetWidth + 'px');
        }
    }

    private _findMobileViewColumnIndex(): number {
        return this._columns.findIndex(c => c.isMobileView);
    }

    isAutoGenerateColumns(): boolean {
        return this._autoGenerateColumns;
    }

    isInlineEdit(): boolean {
        return this._inlineEdit;
    }


    private _updateCellValue(cell, key, value): void {
        if (!this._internalContextProperties.find(prop => prop === key)) {
            cell[key] = value;
        }
    }

    private _updatePositionOnScroll(scrollLeft: number, scrollTop: number) {
        if (isNullOrUndefined(this._scrollData)) {
            this._scrollData = {
                left: scrollLeft,
                top: scrollTop
            };
        }
        let tblBodyEle = this.tableBody.nativeElement.parentNode;
        let deltaX = scrollLeft - this._scrollData.left;
        let deltaY = tblBodyEle.scrollTop;
        let headerCells = this.tableHeader.nativeElement.children;
        let tableRows = this.tableBody.nativeElement.children[1].children;
        if (deltaX !== 0) {
            for (let i = 0; i < 4; i++) {
                let headerCell = headerCells[i];
                this._renderer.setStyle(headerCell, 'left', (headerCell.offsetLeft + deltaX) + 'px');
                for (let j = 0; j < tableRows.length; j++) {
                    let tableRow = tableRows[j];
                    let cells = tableRow.children;
                    let cell = cells[i];
                    if (cell) {
                        this._renderer.setStyle(cell, 'left', (cell.offsetLeft + deltaX) + 'px');
                    }
                }
            }
        }
        if (headerCells[0].offsetLeft !== 0 && scrollLeft === 0) {
            let deltaX = headerCells[0].offsetLeft;
            for (let i = 0; i < 4; i++) {
                let headerCell = headerCells[i];
                this._renderer.setStyle(headerCell, 'left', (headerCell.offsetLeft - deltaX) + 'px');
                for (let j = 0; j < tableRows.length; j++) {
                    let tableRow = tableRows[j];
                    let cells = tableRow.children;
                    let cell = cells[i];
                    if (cell) {
                        this._renderer.setStyle(cell, 'left', (cell.offsetLeft - deltaX) + 'px');
                    }
                }
            }
        }

        if (deltaY !== 0) {
            for (let i = 0; i < headerCells.length; i++) {
                let headerCell = headerCells[i];
                if (headerCell) {
                    this._renderer.setStyle(headerCell, 'top', deltaY + 'px');
                }
            }
        } else if (headerCells[0].offsetTop !== 0 && deltaY === 0) {
            for (let i = 0; i < headerCells.length; i++) {
                let headerCell = headerCells[i];
                if (headerCell) {
                    this._renderer.setStyle(headerCell, 'top', 0 + 'px');
                }
            }
        }
        this._scrollData = {
            left: scrollLeft,
            top: scrollTop
        };
    }

    private _updateBodyFrozenColumnsPosition(scrollLeft: number) {
        let tableRows = this.tableBody.nativeElement.children[1].children;
        let offsetLeft: number;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < tableRows.length; j++) {
                let tableRow = tableRows[j];
                let cells = tableRow.children;
                let cell = cells[i];
                if (cell) {
                    if (isNullOrUndefined(offsetLeft)) {
                        offsetLeft = cell.offsetLeft;
                    }
                    let delta = cell.offsetLeft + scrollLeft + Math.abs(offsetLeft);
                    this._renderer.setStyle(cell, 'left', delta + 'px');
                }
            }
        }
    }

    private _hidecolumns(colIndex: number) {
        let col = this._hideColumns.findIndex(i => i == colIndex);
        if (col !== -1) {
            this._hideColumns.splice(col, 1);
        } else {
            this._hideColumns.push(colIndex);
        }
    }

    private _updateOptions() {
        this._currentPageNumber = this._defaultOptions.currentPage;
        this._defaultNoOfRows = this._defaultOptions.noOfRows;
        this._noOfPageLinks = this._defaultOptions.noOfPageLinks;
        if (!isNullOrUndefined(this._defaultOptions.sortField) && !isNullOrUndefined(this._defaultOptions.sortDirection)) {
            this._getCurrentSort(this._defaultOptions.sortField, this._defaultOptions.sortDirection);
        }
    }

    onDataTableScroll(event) {
        this.scrollListner.next(event);
    }

    // Public methods   
    public getContext() {
        return this._sortedDataSet;
    }

    public dragOver(rowNumber: number) {
        this._dragOverRow = rowNumber;
    }

    public rowHasDragOver(rowNumber: number) {
        return this._dragOverRow === rowNumber;
    }


    // drag and drop changes
    public getDraggableVm(rowNumber) {
        if (!this.draggableRows) {
            return;
        }
        let dragVM = {
            dragEffect: null,
            identifier: 'data-row',
            canChildrenDraggableIndependently: false,
            canDragHandleContainer: false,
            dragHandle: '.icon--dragable .dragable',
            canDrag: () => this.draggableRows,
            model: { Source: null }
        };
        if (!isNullOrUndefined(this._dataSource)) {
            let source: T = this._dataSource.getValue().get(rowNumber);
            dragVM.model.Source = source;
        }
        return dragVM;
    }

    public getDroppableVm(ctx): AeDropVm<any> {
        if (!this.draggableRows) {
            return;
        }
        return {
            canDrop: () => this.draggableRows,
            dropEffect: 'move',
            identifiers: null
        };
    }

    public dropped(sourceModel, targetRowNumber) {
        if (this.draggableRows) {
            this._dragOverRow = -1;
            let target: T = this._dataSource.getValue().get(targetRowNumber);
            this._onDropComplete.emit({
                Source: sourceModel.model.Source,
                Target: target
            });
        }
    }

    public dragEnter(e) {
    }

    public clearRowsSelection() {
        this._checkedRows = null;
    }

    public checkRowSelectionExists(contextId: string): number {
        let checkedRowIndex = this._checkedRows.findIndex(ar => ar === contextId);
        return checkedRowIndex;
    }

    public checkedRowItem(rowNumber: number) {
        if (isNullOrUndefined(this._checkedRows)) {
            this._checkedRows = new Array<string>();
        }
        let context: any = this._getDataItemForRow(rowNumber);
        if (isNullOrUndefined(context)) return false;
        let checkedRowIndex = this.checkRowSelectionExists(context.Id);
        if (checkedRowIndex > -1) {
            return true;
        } else {
            return false;
        }
    }

    public selectedRowItem(rowNumber: number) {
        let context: any = this._getDataItemForRow(rowNumber);
        if (isNullOrUndefined(context)) return;

        let checkedRowIndex = this.checkRowSelectionExists(context.Id);
        if (checkedRowIndex > -1) {
            this._checkedRows.splice(checkedRowIndex, 1);
        } else {
            this._checkedRows.push(context.Id);
        }

        this._selectedRows.emit(this._checkedRows);
    }

    // public onDragLeave(e) {
    //     console.log(e);
    // public onDragLeave(e) {    
    // }

    // public onDragOver(e) {    
    // }
    // end of drag abd drop changes


    /**
    * ngOnInit life cycle hook
    * It calls BaseElementGeneric ngOnInit
    * 
    * @memberOf AeDatatableComponent
    */
    ngOnInit(): void {
        super.ngOnInit();
        this._hideColumnsSubscription = this._hideColumns$.subscribe((val) => {
            if (isArray(val)) {
                let colIndexes = <Array<number>>val;
                colIndexes.forEach((colIndex) => {
                    this._hidecolumns(colIndex);
                });
            } else {
                let colIndex = <number>val;
                this._hidecolumns(colIndex);
            }
            this._changeDetector.markForCheck();
            setTimeout(() => {
                this._updatePositions(this.tableBody.nativeElement);
                let tblBodyEle = this.tableBody.nativeElement.parentNode;
                this._updatePositionOnScroll(tblBodyEle.scrollLeft, tblBodyEle.scrollTop);
            }, 100);
        });
        this._scrollListnerSubscription = this._scrollListner.subscribe((scrollData) => {
            if (!isNullOrUndefined(scrollData)) {
                this._updatePositionOnScroll(scrollData.target.scrollLeft, scrollData.target.scrollTop);
            }
        });
    }


    /**
     * ngAfterContentInit life cycle hoot
     * 
     * 
     * @memberOf AeDatatableComponent
     */
    ngAfterContentInit(): void {
        if (!this._autoGenerateColumns) {
            this._columns = this.cols.toArray();
            this._mobileViewColumnIndex = this._findMobileViewColumnIndex();
            if (this._mobileViewColumnIndex < 0) {
                this._mobileViewColumnIndex = 0;
            }
            this._mobileViewColumn = this._columns[this._mobileViewColumnIndex];
            this._init();
        }
    }

    /**
     * ngAfterViewInit life cycle hook
     * 
     * 
     * @memberOf AeDatatableComponent
     */
    ngAfterViewInit(): void {
        this._pageChangeSubscription = this.pagination.aePageChange.subscribe((pagingInfo: PagingInfo) => {
            this._pageChange(pagingInfo.PageNumber, pagingInfo.PageSize);
        });

        this._rowsPerpageChangeSubscription = this.pagination.aeRowsPerPageChanged.subscribe((newRowsCount: number) => {
            this._rowsPerPageChanged(newRowsCount);
        });
        this.pagination.setCurrentPage(this._currentPageNumber);

        this._clearSelectionSubscription = this.clearSelection.subscribe((clear) => {
            if (clear) {
                this.clearRowsSelection();
            }
        })
    }

    /**
     * ngOnDestroy life cycle hook
     * 
     * @memberOf AeDatatableComponent
     */
    ngOnDestroy(): void {
        if (this._scrollListnerSubscription) {
            this._scrollListnerSubscription.unsubscribe();
        }
        if (this._hideColumnsSubscription) {
            this._hideColumnsSubscription.unsubscribe();
        }
        this._actionsSubscriptions.forEach(sub => {
            if (sub) {
                sub.unsubscribe();
            }
        });
        if (this._pageChangeSubscription) {
            this._pageChangeSubscription.unsubscribe();
        }

        if (this._rowsPerpageChangeSubscription) {
            this._rowsPerpageChangeSubscription.unsubscribe();
        }

        if (this._clearSelectionSubscription) {
            this._clearSelectionSubscription.unsubscribe();
        }
    }

    public getIdOrName(name:string,row:number){
        return name + '_' + row;
    }
    // End of public methods
}
