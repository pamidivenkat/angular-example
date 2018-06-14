import { EmployeeLeavingReason, EmployeeLeavingSubReason } from '../../employee/models/timeline';
import { getSensitivityName } from '../../employee/common/extract-helpers';
import { StringHelper } from './string-helper';
import { MessageType } from '../../atlas-elements/common/ae-message.enum';
import { MessageStatus, MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
import { SnackbarMessageVM } from '../models/snackbar-message-vm';
import * as Immutable from 'immutable';
import { AeSelectItem } from '../../atlas-elements/common/models/ae-select-item';
import { EnumHelper } from '../../shared/helpers/enum-helper';
import { isNullOrUndefined } from 'util';
import { Md5 } from 'ts-md5/dist/md5';
import { BaseMessageVM } from '../../shared/models/base-message-vm';

export class ObjectHelper {
    static merge<F, S>(first: F, second: S): F & S {
        let result = <F & S>{};
        for (let key in first) {
            (<any>result)[key] = (<any>first)[key];
        }
        for (let key in second) {
            (<any>result)[key] = (<any>second)[key];
        }
        return result
    }

    static extract<S, D>(source: S, destination: D): D {
        if (!isNullOrUndefined(source)) {
            Object.keys(destination).forEach((key) => {
                if (source.hasOwnProperty(key)) {
                    destination[key] = source[key];
                }
            });
        }
        return destination;
    }

    static flatten<T>(source: Array<any>): Array<T> {
        if (isNullOrUndefined(source) || source.length === 0) {
            return [] as Array<T>;
        }
        return source.reduce(function (firstItem, currentItem) {
            return firstItem.concat(Array.isArray(currentItem) ? ObjectHelper.flatten(currentItem) : currentItem);
        }, []);
    }

    static create<T>(type: { new(): T; }): T {
        return new type();
    }

    static createObjectFromMap(dataMap: Map<string, any>) {
        let dataObject = {};
        dataMap.forEach((val, key) => {
            dataObject[key] = val;
        });
        return dataObject;
    }
    static createUpdateErrorSnackbarMessageGeneric<T>(type: { new(a, b, c, d, e): T; }, objectType: string, objectIdentifier: string, code: string) {
        return new type(StringHelper.snackbarMessage(objectType, objectIdentifier),
            MessageType.Error, MessageEvent.Update, MessageStatus.Failed, code);
    }

    static createUpdateCompleteSnackbarMessageGeneric<T>(type: { new(a, b, c, d, e): T; }, objectType: string, objectIdentifier: string, code: string) {
        return new type(StringHelper.snackbarMessage(objectType, objectIdentifier), MessageType.Success,
            MessageEvent.Update, MessageStatus.Complete, code);
    }

    static createUpdateInProgressSnackbarMessageGeneric<T>(type: { new(a, b, c, d, e): T; }, objectType: string, objectIdentifier: string, code: string) {
        return new type(StringHelper.snackbarMessage(objectType, objectIdentifier), MessageType.Info,
            MessageEvent.Update, MessageStatus.InProgress, code);
    }

    static createInsertErrorSnackbarMessageGeneric<T>(type: { new(a, b, c, d, e): T; }, objectType: string, objectIdentifier: string, code: string) {
        return new SnackbarMessageVM(StringHelper.snackbarMessage(objectType, objectIdentifier), MessageType.Error,
            MessageEvent.Create, MessageStatus.Failed, Md5.hashStr(objectIdentifier));
    }

    static createInsertCompleteSnackbarMessageGeneric<T>(type: { new(a, b, c, d, e): T; }, objectType: string, objectIdentifier: string) {
        return new type(StringHelper.snackbarMessage(objectType, objectIdentifier), MessageType.Success,
            MessageEvent.Create, MessageStatus.Complete, Md5.hashStr(objectIdentifier));
    }

    static createInsertInProgressSnackbarMessageGeneric<T>(type: { new(a, b, c, d, e): T; }, objectType: string, objectIdentifier: string) {
        return new type(StringHelper.snackbarMessage(objectType, objectIdentifier), MessageType.Info,
            MessageEvent.Create, MessageStatus.InProgress, Md5.hashStr(objectIdentifier));
    }
    static createRemoveErrorSnackbarMessageGeneric<T>(type: { new(a, b, c, d, e): T; }, objectType: string, objectIdentifier: string, code: string) {
        return new type(StringHelper.snackbarMessage(objectType, objectIdentifier), MessageType.Error,
            MessageEvent.Remove, MessageStatus.Failed, code);
    }

    static createRemoveCompleteSnackbarMessageGeneric<T>(type: { new(a, b, c, d, e): T; }, objectType: string, objectIdentifier: string, code: string) {
        return new type(StringHelper.snackbarMessage(objectType, objectIdentifier), MessageType.Success,
            MessageEvent.Remove, MessageStatus.Complete, code);
    }

    static createRemoveInProgressSnackbarMessageGeneric<T>(type: { new(a, b, c, d, e): T; }, objectType: string, objectIdentifier: string, code: string) {
        return new type(StringHelper.snackbarMessage(objectType, objectIdentifier), MessageType.Info,
            MessageEvent.Remove, MessageStatus.InProgress, code);
    }
    static createUpdateErrorSnackbarMessage(objectType: string, objectIdentifier: string, code: string) {
        return new SnackbarMessageVM(StringHelper.snackbarMessage(objectType, objectIdentifier), MessageType.Error,
            MessageEvent.Update, MessageStatus.Failed, code);
    }

    static createUpdateCompleteSnackbarMessage(objectType: string, objectIdentifier: string, code: string) {
        return new SnackbarMessageVM(StringHelper.snackbarMessage(objectType, objectIdentifier), MessageType.Success,
            MessageEvent.Update, MessageStatus.Complete, code);
    }

    static createUpdateInProgressSnackbarMessage(objectType: string, objectIdentifier: string, code: string) {
        return new SnackbarMessageVM(StringHelper.snackbarMessage(objectType, objectIdentifier), MessageType.Info,
            MessageEvent.Update, MessageStatus.InProgress, code);
    }
    static createCustomActionInProgressSnackbarMessage(customMessage: string, code: string) {
        return new SnackbarMessageVM(StringHelper.snackbarCustomMessage(customMessage), MessageType.Info,
            MessageEvent.Update, MessageStatus.Custom, code);
    }
    static createCustomActionCompleteSnackbarMessage(customMessage: string, code: string) {
        return new SnackbarMessageVM(StringHelper.snackbarCustomMessage(customMessage), MessageType.Success,
            MessageEvent.Update, MessageStatus.Custom, code);
    }

    static createInsertErrorSnackbarMessage(objectType: string, objectIdentifier: string) {
        return new SnackbarMessageVM(StringHelper.snackbarMessage(objectType, objectIdentifier), MessageType.Error,
            MessageEvent.Create, MessageStatus.Failed, Md5.hashStr(objectIdentifier));
    }

    static createInsertCompleteSnackbarMessage(objectType: string, objectIdentifier: string) {
        return new SnackbarMessageVM(StringHelper.snackbarMessage(objectType, objectIdentifier), MessageType.Success,
            MessageEvent.Create, MessageStatus.Complete, Md5.hashStr(objectIdentifier));
    }

    static createInsertInProgressSnackbarMessage(objectType: string, objectIdentifier: string) {
        return new SnackbarMessageVM(StringHelper.snackbarMessage(objectType, objectIdentifier), MessageType.Info,
            MessageEvent.Create, MessageStatus.InProgress, Md5.hashStr(objectIdentifier));
    }

    static createRemoveErrorSnackbarMessage(objectType: string, objectIdentifier: string, code: string) {
        return new SnackbarMessageVM(StringHelper.snackbarMessage(objectType, objectIdentifier), MessageType.Error,
            MessageEvent.Remove, MessageStatus.Failed, code);
    }

    static createRemoveCompleteSnackbarMessage(objectType: string, objectIdentifier: string, code: string) {
        return new SnackbarMessageVM(StringHelper.snackbarMessage(objectType, objectIdentifier), MessageType.Success,
            MessageEvent.Remove, MessageStatus.Complete, code);
    }

    static createRemoveInProgressSnackbarMessage(objectType: string, objectIdentifier: string, code: string) {
        return new SnackbarMessageVM(StringHelper.snackbarMessage(objectType, objectIdentifier), MessageType.Info,
            MessageEvent.Remove, MessageStatus.InProgress, code);
    }

    static operationCompleteSnackbarMessage(message: string) {
        return new BaseMessageVM(message, MessageType.Success, MessageEvent.Create, MessageStatus.Complete);
    }

    static operationInProgressSnackbarMessage(message: string) {
        return new BaseMessageVM(message, MessageType.Info, MessageEvent.Create, MessageStatus.InProgress);
    }

    static operationFailedSnackbarMessage(message: string) {
        return new BaseMessageVM(message, MessageType.Error, MessageEvent.Create, MessageStatus.Failed);
    }

    static generatAeselectItemsFromEnum(enumForSelect): Immutable.List<any> {
        return Immutable.List(EnumHelper.getNamesAndValues(enumForSelect).map((enumItem) => {
            let item: AeSelectItem<number> = new AeSelectItem<number>();
            item.Text = enumItem.name;
            item.Value = enumItem.value;
            return item;
        }));
    }
    static generatAeselectItemsForSensitivityFromEnum(enumForSelect): Immutable.List<any> {
        return Immutable.List(EnumHelper.getNamesAndValues(enumForSelect).map((enumItem) => {
            let item: AeSelectItem<number> = new AeSelectItem<number>();
            item.Text = getSensitivityName(enumItem.value);
            item.Value = enumItem.value;
            return item;
        })).sort((a, b) => { return a.Text.localeCompare(b.Text) }).toList();
    }
    static generatSortedAeselectItemsFromEnum(enumForSelect): Immutable.List<any> {
        return Immutable.List(EnumHelper.getNamesAndValues(enumForSelect).map((enumItem) => {
            let item: AeSelectItem<number> = new AeSelectItem<number>();
            item.Text = getSensitivityName(enumItem.value);
            item.Value = enumItem.value;
            return item;
        })).sort((a, b) => { return a.Text.localeCompare(b.Text) }).toList();
    }


    static extractLeavingReasonsSelectItems(outcome: EmployeeLeavingReason[]): AeSelectItem<string>[] {
        return outcome.map((keyValuePair) => {
            let aeSelectItem = new AeSelectItem<string>(keyValuePair.Title, keyValuePair.Id, false);
            aeSelectItem.Childrens = null;
            return aeSelectItem;
        }).sort(function (a, b) {
            if (a.Text < b.Text)
                return -1;
            if (a.Text > b.Text)
                return 1;
            return 0;
        });
    }

    static extractSubReasonsSelectItems(outcome: EmployeeLeavingSubReason[]): AeSelectItem<string>[] {
        return outcome.map((keyValuePair) => {
            let aeSelectItem = new AeSelectItem<string>(keyValuePair.Title, keyValuePair.Id, false);
            aeSelectItem.Childrens = null;
            return aeSelectItem;
        }).sort(function (a, b) {
            if (a.Text < b.Text)
                return -1;
            if (a.Text > b.Text)
                return 1;
            return 0;
        });
    }

    static createCopyErrorSnackbarMessage(objectType: string, objectIdentifier: string, code: string) {
        return new SnackbarMessageVM(StringHelper.snackbarMessage(objectType, objectIdentifier), MessageType.Error,
            MessageEvent.Copy, MessageStatus.Failed, code);
    }

    static createCopyCompleteSnackbarMessage(objectType: string, objectIdentifier: string, code: string) {
        return new SnackbarMessageVM(StringHelper.snackbarMessage(objectType, objectIdentifier), MessageType.Success,
            MessageEvent.Copy, MessageStatus.Complete, code);
    }

    static createCopyInProgressSnackbarMessage(objectType: string, objectIdentifier: string, code: string) {
        return new SnackbarMessageVM(StringHelper.snackbarMessage(objectType, objectIdentifier), MessageType.Info,
            MessageEvent.Copy, MessageStatus.InProgress, code);
    }
}



