export class PagingInfo {
    private _count: number;
    private _totalCount: number;
    private _pageNumber: number;
    private _pageSize: number;

    get PageSize(): number {
        return this._pageSize;
    }
    set PageSize(value: number) {
        this._pageSize = value;
    }

    get Count(): number {
        return this._count;
    }
    set Count(value: number) {
        this._count = value;
    }

    get TotalCount(): number {
        return this._totalCount;
    }
    set TotalCount(value: number) {
        this._totalCount = value;
    }


    get PageNumber(): number {
        return this._pageNumber;
    }
    set PageNumber(value: number) {
        this._pageNumber = value;
    }

    constructor(count: number, totalCount: number, pageNumber: number, pageSize: number) {
        this._count = count;
        this._totalCount = totalCount;
        this._pageNumber = pageNumber;
        this._pageSize = pageSize;
    }
}
