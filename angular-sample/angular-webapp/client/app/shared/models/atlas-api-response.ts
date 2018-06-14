import { isNullOrUndefined } from 'util';
import { PagingInfo } from '../../atlas-elements/common/models/ae-paging-info';
import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { AeSortModel } from './../../atlas-elements/common/models/ae-sort-model';

export class AtlasApiResponse<T> {
    private _Entities: Array<T>;
    private _OtherInfo: any;
    private _PagingInfo: PagingInfo;

    get Entities(): Array<T> {
        return this._Entities;
    }
    set Entities(value: Array<T>) {
        this._Entities = value;
    }

    get OtherInfo(): any {
        return this._OtherInfo;
    }
    set OtherInfo(value: any) {
        this._OtherInfo = value;
    }

    get PagingInfo(): PagingInfo {
        return this._PagingInfo;
    }
    set PagingInfo(value: PagingInfo) {
        this._PagingInfo = value;
    }
    constructor() {
        this._Entities = [];
    }
}

export class AtlasApiRequest {
    PageNumber: number;
    PageSize: number;
    SortBy: AeSortModel = { SortField: 'createdon', Direction: SortDirection.Descending };

    constructor(pageNumber: number, pageSize: number, sortBy: string, sortDirection: SortDirection) {
        this.PageNumber = pageNumber;
        this.PageSize = pageSize;
        this.SortBy = { SortField: sortBy, Direction: sortDirection };
    }
}


export class AtlasApiRequestWithParams extends AtlasApiRequest {
    private _atlasParams: AtlasParams[];
    get Params(): AtlasParams[] {
        return this._atlasParams;
    }
    set Params(value: AtlasParams[]) {
        this._atlasParams = value;
    }

    constructor(pageNumber: number, pageSize: number, sortBy: string, sortDirection: SortDirection, paramArray: AtlasParams[]) {
        super(pageNumber, pageSize, sortBy, sortDirection);
        this._atlasParams = paramArray;
    }
}

export class AtlasParams {
    private _key: string;
    private _value: any;
    get Key(): string {
        return this._key;
    }
    set Key(value: string) {
        this._key = value;
    }
    get Value(): any {
        return this._value;
    }
    set Value(value: any) {
        this._value = value;
    }
    constructor(key: string, value: any) {
        this._key = key;
        this._value = value;
    }
}