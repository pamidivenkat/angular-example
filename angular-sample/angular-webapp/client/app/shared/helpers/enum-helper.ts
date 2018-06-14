import { isNullOrUndefined } from 'util';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';

export class EnumHelper {
    static getNamesAndValues<T extends number>(e: any) {
        return EnumHelper.getNames(e).map(n => ({ name: n, value: e[n] as T }));
    }

    static getNames(e: any) {
        return EnumHelper.getEnumValues(e).filter(v => typeof v === 'string') as string[];
    }

    static getValues<T extends number>(e: any) {
        return EnumHelper.getEnumValues(e).filter(v => typeof v === 'number') as T[];
    }

    private static getEnumValues(e: any): (number | string)[] {
        return Object.keys(e).map(k => e[k]);
    }
    static getGivenNameEnumValue<T extends number>(e: any, name: string): number {
        let enumItem = EnumHelper.getNamesAndValues(e).find(obj => obj.name.toLowerCase() == name.toLowerCase());
        if (!isNullOrUndefined(enumItem)) return enumItem.value;
        return null;
    }
    static getAeSelectItems<T extends number>(e: any): Array<AeSelectItem<number>> {
        return EnumHelper.getNamesAndValues(e)
            .map((enumItem) => {
                let item: AeSelectItem<number> = new AeSelectItem<number>();
                item.Text = enumItem.name;
                item.Value = enumItem.value;
                return item;
            });
    }
}
