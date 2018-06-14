import { isNullOrUndefined } from 'util';
import { AeSelectEvent } from '../common/ae-select.event';
import { AeSelectItem } from '../common/models/ae-select-item';
import { PagingInfo } from '../common/models/ae-paging-info';
import { DataTableOptions } from '../common/models/ae-datatable-options';
import { PageNav } from '../common/orientation.enum';
import { BehaviorSubject, Observable, Subscription } from 'rxjs/Rx';
import { BaseElement } from '../common/base-element';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewEncapsulation,
    OnDestroy
} from '@angular/core';
import * as Immutable from 'immutable';

@Component({
    selector: 'ae-pagination',
    styleUrls: ['ae-pagination.component.scss'],
    templateUrl: 'ae-pagination.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class AePaginationComponent extends BaseElement implements OnInit, OnDestroy {

    // Private Fields
    private first = 1;
    private start: number;
    private end: number;
    private _rows: number;
    private _noOfPageLinks = 5;
    private _defaultRowsPerPageOptions: Immutable.List<number> = Immutable.List<number>([10, 25, 50, 100]);
    private _rowsPerPageOptions: Immutable.List<number>;
    private _pageLinks: Immutable.Seq.Indexed<number>;
    private _totalPageCount: number;
    private _currentPage = 1;
    private _displayOptions: Immutable.List<AeSelectItem<number>>;
    private _totalRecordsSubscription: Subscription;
    private _currentRows: number = 10;
    /**
     * total number of Records
     * @type {number}
     * @memberOf AePaginatorComponent
     */
    private _totalRecords$: BehaviorSubject<number>;
    private _totalRecords: number;

    // End of Private Fields

    // Public properties

    get displayOptions(): Immutable.List<AeSelectItem<number>> {
        return this._displayOptions;
    }

    get pageLinks(): Immutable.Seq.Indexed<number> {
        return this._pageLinks;
    }

    get totalRecordsCount() {
        return this._totalRecords;
    }

    @Input('currentPage')
    get currentPage() {
        return this._currentPage;
    }
    set currentPage(val: number) {
        this._currentPage = val;
        this.setCurrentPage(this._currentPage);
    }

    @Input('rows')
    get rows() {
        return this._rows;
    }

    set rows(val: number) {
        this._rows = val;
    }

    /**
     * number of pages count to be shown on the pagination
     * @type {number}
     * @memberOf AePaginatorComponent
     */
    @Input('noOfPageLinks')
    get noOfPageLinks() {
        return this._noOfPageLinks;
    }
    set noOfPageLinks(val: number) {
        this._noOfPageLinks = val;
    }

    /**
     * list of rows per page dropdown list page
     * @type {number[]}
     * @memberOf AePaginatorComponent
     */
    @Input('rowsPerPageOptions')
    get rowsPerPageOptions() {
        return this._rowsPerPageOptions ? this._rowsPerPageOptions : this._defaultRowsPerPageOptions;
    }
    set rowsPerPageOptions(val: Immutable.List<number>) {
        this._rowsPerPageOptions = val;
    }

    /**
     * get & set for total number of records count
     * @type {number}
     * @memberOf AePaginatorComponent
     */
    @Input('totalRecords')
    get totalRecords(): BehaviorSubject<number> {
        return this._totalRecords$;
    }
    set totalRecords(val: BehaviorSubject<number>) {
        this._totalRecords$ = val;
    }

    @Input('currentRows')
    get currentRows() {
        return this._currentRows;
    }

    set currentRows(val: number) {
        this._currentRows = val;
    }


    // End of Public properties

    // Public Output bindings
    /**
     * event emits of page change
     * @type {EventEmitter<number>}
     * @memberOf AePaginatorComponent
     */
    @Output() aePageChange: EventEmitter<PagingInfo> = new EventEmitter<PagingInfo>();
    @Output() aeRowsPerPageChanged: EventEmitter<number> = new EventEmitter<number>();
    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ContnetChild bindings
    // End of Public ContnetChild bindings

    // Constructor
    constructor(private _cdRef: ChangeDetectorRef) {
        super();
    }

    // End of constructor

    // Private methods


    /**
     * to set the visibility based on total pages count return
     * @returns 
     * 
     * @memberOf AePaginationComponent
     */
    setVisibilityOnTotalCount() {
        const _totalPages = this._getPageCount();
        return _totalPages > 5;
    }


    /**
     * to set active current selected page 
     * 
     * @param {number} pageLink 
     * @returns 
     * 
     * @memberOf AePaginationComponent
     */
    setCurrentPageActive(pageLink: number) {
        return this._currentPage == pageLink;
    }
    /**
     * to set the pagination visibility
     * @returns 
     * 
     * @memberOf AePaginationComponent
     */
    setPagingVisibility() {
        return this._totalRecords > 10;
    }

    setPageLinksVisibility(): boolean {
        return this._totalRecords > this._rows;
    }

    /**
     * Enable & disable the first page Icon basedon the current page
     * @returns 
     * @memberOf AePaginatorComponent
     */
    isFirstPage(): boolean {
        return this._getPage() === 1;
    }

    /**
     * Enable & disable the last page Icon basedon the current page
     * @returns 
     * @memberOf AePaginatorComponent
     */
    isLastPage(): boolean {
        return this._getPage() === this._getPageCount();
    }



    /**
     * calls on the total number of rows per page event change
     * @param {any} event 
     * @memberOf AePaginatorComponent
     */
    onRowsPerPageChanged(e: AeSelectEvent<number>): void {
        this._rows = e.SelectedItem.Value;
        this.aeRowsPerPageChanged.emit(this._rows);
        this._calculateTotalPageCount();
        this._updatePageLinks();
        this.changePageToFirst(e);
    }

    /**
     * return the total records count
     * @private
     * 
     * @memberOf AePaginationComponent
     */
    private _calculateTotalPageCount() {
        this._totalPageCount = Math.ceil(this._totalRecords / this._rows);
    }


    /**
     * to get the current active page
     * 
     * @returns {number} 
     * 
     * @memberOf AePaginationComponent
     */
    _getPage(): number {
        return Math.floor(this.first / this._rows);
    }


    /**
     * 
     * set the page to first
     * @param {any} event 
     * 
     * @memberOf AePaginationComponent
     */
    changePageToFirst(event) {
        this._changePage(1, event);
        this._updatePageLinks();
    }


    /**
     * 
     * set the previous page
     * @param {any} event 
     * 
     * @memberOf AePaginationComponent
     */
    changePageToPrev(event) {
        if (this._getPage() != 1) {
            this._changePage(this._getPage() - 1, event);
            this._updatePageLinks();
        }
    }


    /**
     * set the next page
     * 
     * @param {any} event 
     * 
     * @memberOf AePaginationComponent
     */
    changePageToNext(event) {
        if (this._getPage() != this._getPageCount()) {
            this._changePage(this._getPage() + 1, event);
            this._updatePageLinks();
        }

    }


    /**
     *  set the last page
     * @param {any} event 
     * 
     * @memberOf AePaginationComponent
     */
    changePageToLast(event) {
        if (this._getPage() != this._getPageCount()) {
            this._changePage(this._getPageCount(), event);
            this._updatePageLinks();
        }
    }


    /**
     * set the current page
     * @param {number} p 
     * @param {any} event 
     * 
     * @memberOf AePaginationComponent
     */
    _changePage(p: number, event) {
        var pc = this._getPageCount();

        if (p >= 0 && p <= pc) {
            this._currentPage = p;
            this.first = this._rows * p;
            this.aePageChange.emit(new PagingInfo(this._totalPageCount, this._totalRecords, p, this._rows));
        }
        //preventDefault is not supported in firefox
        // if (event) {
        //     event.preventDefault();
        // }
    }


    /**
     * calculates the page boundaries 
     * @returns 
     * 
     * @memberOf AePaginationComponent
     */
    _calculatePageLinkBoundaries() {
        let numberOfPages = this._getPageCount(),
            visiblePages = Math.min(this._noOfPageLinks, numberOfPages);

        //calculate range, keep current in middle if necessary
        let start = Math.max(1, Math.ceil(this._getPage() - ((visiblePages) / 2))),
            end = Math.min(numberOfPages, start + visiblePages - 1);

        //check when approaching to last page
        var delta = this._noOfPageLinks - (end - start);
        start = Math.max(1, start - delta + 1);

        return [start, end];
    }


    /**
     * updates the page links boundaries 
     * 
     * @memberOf AePaginationComponent
     */
    _updatePageLinks() {
        let boundaries = this._calculatePageLinkBoundaries(),
            start = boundaries[0],
            end = boundaries[1];
        this._pageLinks = Immutable.Range(start, end + 1);
        this._cdRef.markForCheck();
    }


    /**
     * to get the total pages count
     * 
     * @returns 
     * 
     * @memberOf AePaginationComponent
     */
    _getPageCount() {
        return Math.ceil(this._totalRecords / this._rows) || 1;
    }
    _getPageSize(): number {
        return this._rows;
    }
    // End of private methods

    // Public methods
    /**
     * ng2 Life cycle hook
     * @memberOf AePaginatorComponent
     */
    ngOnInit(): void {
        super.ngOnInit();
        this._displayOptions = this.rowsPerPageOptions.map((item) => new AeSelectItem<number>(`Display ${item} rows`, item)).toList();
        this._totalRecordsSubscription = this._totalRecords$.subscribe(n => {
            this._totalRecords = n;
            // this._currentPage = 1;
            this.setCurrentPage(this._currentPage);
        });

        this.start = 1;
        this.end = this._noOfPageLinks;
    }
    ngOnDestroy(): void {
        if (this._totalRecordsSubscription) {
            this._totalRecordsSubscription.unsubscribe();
        }
    }

    /**
     * to update the current page links 
     * @param {number} currentPage 
     * 
     * @memberOf AePaginationComponent
     */
    public setCurrentPage(currentPage: number) {
        this._currentPage = currentPage;
        this.first = this._rows * currentPage;
        this._updatePageLinks();
    }

    public getStartRowIndex() {
        return ((this._currentPage - 1) * this._rows + 1);
    }
    public getEndRowIndex() {
        return ((this._currentPage - 1) * this._rows + this._currentRows);
    }
    // End of public methods
}