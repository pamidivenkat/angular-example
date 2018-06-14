import { SortDirection } from '../../atlas-elements/common/models/ae-sort-model';
import { LOCALE_ID } from '@angular/core';
import { AeSelectItem } from './../../atlas-elements/common/models/ae-select-item';
import { StringHelper } from './string-helper';
import { isNullOrUndefined, isFunction } from 'util';
import { IFormBuilderVM, IFormField } from '../models/iform-builder-vm';
import { environment } from '../../../environments/environment';
import { DatePipe } from '@angular/common';
import * as Immutable from 'immutable';

export class CommonHelpers {
    static writeToConsole(data: any) {
        console.log(data);
    }
    static writeExceptionToConsole(ex: any) {
        if (!environment.production) {
            CommonHelpers.writeToConsole(ex);
            CommonHelpers.writeToConsole(ex.constructor.name);
            CommonHelpers.writeToConsole(ex.context);
            CommonHelpers.writeToConsole(ex.message);
            CommonHelpers.writeToConsole(ex);
        }
    }

    static isIFormBuilderTypeGaurd<T>(field: IFormBuilderVM | IFormField<T>): field is IFormBuilderVM {
        return (<IFormBuilderVM>field).getFields !== undefined;
    }

    static isIFormFieldTypeGaurd<T>(field: IFormBuilderVM | IFormField<T>): field is IFormField<T> {
        let iformField = <IFormField<T>>field;
        return iformField.name !== undefined
            && iformField.initialValue !== undefined
            && iformField.type !== undefined;
    }

    static checkIsValidStartAndEndDates(startDateTimestamp: any, endDateTimestamp: any): boolean {
        //if any of the value does not exits then return null
        if (StringHelper.isNullOrUndefined(startDateTimestamp) || StringHelper.isNullOrUndefined(endDateTimestamp)) return null;

        startDateTimestamp = Date.parse(startDateTimestamp);
        endDateTimestamp = Date.parse(endDateTimestamp);        
        return (startDateTimestamp <= endDateTimestamp) ? true : false;
    }

    static processFSYearValue(value: string, datePipe: DatePipe): {
        StartDate: string,
        EndDate: string
    } {
        if (!StringHelper.isNullOrUndefinedOrEmpty(value) &&
            value.indexOf('dt') !== -1) {
            let dates = value.split('dt');
            let startDate = datePipe.transform(dates[0], 'yyyy-MM-dd');
            let endDate = datePipe.transform(dates[1], 'yyyy-MM-dd');
            return {
                StartDate: startDate,
                EndDate: endDate
            };
        }
        return null;
    }

    static getAssignToMeta(): Immutable.List<AeSelectItem<string>> {
        return Immutable.List<AeSelectItem<string>>([new AeSelectItem<string>('Company', '1'), new AeSelectItem<string>('Department', '4'), new AeSelectItem<string>('Employee', '17'), new AeSelectItem<string>('Site', '3')]);
    }


    static sortArray(anyTypeOfArray: any[], sortKey: string, sortDirection: SortDirection): any[] {
        let absenceTypeAfterSort: any[] = anyTypeOfArray;
        if (sortDirection === SortDirection.Ascending) {
            absenceTypeAfterSort = absenceTypeAfterSort.sort(function (a, b) {
                let aVal: string = a[sortKey] ? <string>a[sortKey].toString() : '';
                let bVal: string = b[sortKey] ? <string>b[sortKey].toString() : '';
                var nameA = aVal.toUpperCase(); // ignore upper and lowercase
                var nameB = bVal.toUpperCase(); // ignore upper and lowercase
                if (nameA < nameB) {
                    return -1;
                }
                if (nameA > nameB) {
                    return 1;
                }
                // names must be equal
                return 0;
            });
        } else {
            absenceTypeAfterSort = absenceTypeAfterSort.sort(function (a, b) {
                let aVal: string = a[sortKey] ? <string>a[sortKey].toString() : '';
                let bVal: string = b[sortKey] ? <string>b[sortKey].toString() : '';
                var nameA = aVal.toUpperCase(); // ignore upper and lowercase
                var nameB = bVal.toUpperCase(); // ignore upper and lowercase
                if (nameA > nameB) {
                    return -1;
                }
                if (nameA < nameB) {
                    return 1;
                }
                // names must be equal
                return 0;
            });
        }
        return absenceTypeAfterSort;
    }

    static sortArrayByIndex(anyTypeOfArray: any[], sortKey: string, sortDirection: SortDirection): any[] {
        let absenceTypeAfterSort: any[] = anyTypeOfArray;
        let aVal: any;
        let bVal: any;

        absenceTypeAfterSort = absenceTypeAfterSort.sort(function (a, b) {
            aVal = a[sortKey] ? <number>a[sortKey] : 0;
            bVal = b[sortKey] ? <number>b[sortKey] : 0;

            if (sortDirection === SortDirection.Ascending) {

                if (aVal < bVal) {
                    return -1;
                } else if (aVal > bVal) {
                    return 1;
                } else {
                    // values must be equal
                    return 0;
                }
            } else {
                if (aVal > bVal) {
                    return -1;
                } else if (aVal < bVal) {
                    return 1;
                } else {
                    // values must be equal
                    return 0;
                }
            }
        });

        return absenceTypeAfterSort;
    }

    // Vijay : hack to handle value changes for cascading dropdowns in AeForm, need to find proper approach.
    static forceValueChange(callbackFn) {
        if (!isNullOrUndefined(callbackFn) && isFunction(callbackFn)) {
            setTimeout(callbackFn, 1);
        }
    }
    static whatIsIt(object): string {
        var stringConstructor = "test".constructor;
        var arrayConstructor = [].constructor;
        var objectConstructor = {}.constructor;
        if (object === null) {
            return "null";
        }
        else if (object === undefined) {
            return "undefined";
        }
        else if (object.constructor === stringConstructor) {
            return "String";
        }
        else if (object.constructor === arrayConstructor) {
            return "Array";
        }
        else if (object.constructor === objectConstructor) {
            return "Object";
        }
        else {
            return "don't know";
        }
    }

}
