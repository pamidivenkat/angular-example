import { AeInformationBarItemType } from '../../atlas-elements/common/ae-informationbar-itemtype.enum';

export class StatisticsInformation<T> {
    Id: string;
    Code: AeInformationBarItemType;
    Count: number;
    Priority: number
    Data?: T;
}