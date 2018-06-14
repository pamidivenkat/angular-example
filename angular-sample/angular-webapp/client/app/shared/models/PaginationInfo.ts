export class PaginationInfo {
    PageNumber: number;
    Count: number;
    TotalCount: number;

    constructor(_pageNumber: number, _count: number, _totalCount: number) {
        this.PageNumber = _pageNumber;
        this.Count = _count;
        this.TotalCount = _totalCount;
    }
}