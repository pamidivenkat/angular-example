export class DataTableOptions {
    private _currentPage: number;
    private _noOfRows = 10;
    private _sortField: any = '';
    private _sortDirection: any = '';
    private _noOfPageLinks = 5;

    get currentPage(): number {
        return this._currentPage;
    }
    set currentPage(currentPage: number) {
        this._currentPage = currentPage;
    }

    get noOfRows(): number {
        return this._noOfRows;
    }

    set noOfRows(selectedRows: number) {
        this._noOfRows = selectedRows;
    }

    get sortField(): any {
        return this._sortField;
    }
    set sortField(sortField: any) {
        this._sortField = sortField;
    }

    get sortDirection(): any {
        return this._sortDirection;
    }

    set sortDirection(sortDirection: any) {
        this._sortDirection = sortDirection;
    }

    get noOfPageLinks() {
        return this._noOfPageLinks;
    }
    set noOfPageLinks(val: number) {
        this._noOfPageLinks = val;
    }

    constructor(currentPage: number, selectedRows: number, sortField ?: any, sortDirection ?: any) {
      
        this._currentPage = currentPage;
        this._noOfRows = selectedRows;
        this._sortField = sortField;
        this._sortDirection = sortDirection;
    }
}