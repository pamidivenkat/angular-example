import { isArray } from 'util';
export class ObjectHelper {
    static equals(obj1: any, obj2: any): boolean {
        if (obj1 == null && obj2 == null) {
            return true;
        }
        if (obj1 == null || obj2 == null) {
            return false;
        }

        if (obj1 == obj2) {
            return true;
        }

        if (typeof obj1 == 'object' && typeof obj2 == 'object') {
            for (var p in obj1) {
                if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) {
                    return false;
                }

                switch (typeof (obj1[p])) {
                    case 'object':
                        if (obj1[p] && !this.equals(obj1[p], obj2[p])) return false;
                        break;

                    case 'function':
                        if (typeof (obj2[p]) == 'undefined' || (p != 'compare' && obj1[p].toString() != obj2[p].toString())) return false;
                        break;

                    default:
                        if (obj1[p] != obj2[p]) return false;
                        break;
                }
            }

            for (var p in obj2) {
                if (typeof (obj1[p]) == 'undefined') return false;
            }

            return true;
        }

        return false;
    }

    static resolveFieldData(data: any, field: string): any {
        if (data && field) {
            if (field.indexOf('.') == -1) {
                return data[field];
            }
            else {
                let fields: string[] = field.split('.');
                let value = data;
                for (var i = 0, len = fields.length; i < len; ++i) {
                    if (value == null) {
                        return null;
                    }
                    value = value[fields[i]];
                }
                return value;
            }
        }
        else {
            return null;
        }
    }

    static isArray(obj) {
        return Array.isArray(obj) || obj.toString() == '[object Array]';
    }

    static pluck(objs: any[], key: string) {
        return objs.map(obj => this.getProperty(obj, key));
    }

    static getProperty(obj,prop) {
        prop = (prop + "").toLowerCase();
        for (var p in obj) {
            let m = (p + "").toLowerCase();
            if (prop == m && Object.prototype.hasOwnProperty.call(obj, p)) {
                return obj[p];
            }
            continue;
        }
    }

    static hasProperty(obj,prop) {
        prop = (prop + "").toLowerCase();
        for (var p in obj) {
            let m = (p + "").toLowerCase();
            if (prop == m && Object.prototype.hasOwnProperty.call(obj, p)) {
                return true;
            }
            continue;
        }
    }

    static hasPropInArray(prop: string, array: any[]): boolean {
        if (this.isArray(array)) {
            return array.every(c => {
                return c == null || c == undefined || (c && this.hasProperty(c,prop));
            });
            //return itemsWithProp.length == array.length;
        }
        return false;
    }

    static isPlainArray(array: any[]): boolean {
        if (this.isArray(array)) {
            return array.every(c => {
                return c == null || c == undefined || (typeof c != 'object' && (typeof c == 'string' || typeof c == 'number'));
            });
        }
        return false;
    }
}