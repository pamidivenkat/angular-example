import { Injectable } from '@angular/core';

@Injectable()
export class StorageService {
    private _storage: Storage
    constructor() {
        this._storage = window['localStorage'];
    }

    remove(key: string): void {
        if (this._storage) {
            this._storage.removeItem(key);
        }
    }

    get<T>(key: string): T {
        let item = this._storage ? this._storage.getItem(key) : null;

        if (!item || item === 'null') {
            return null;
        }

        try {
            return JSON.parse(item);
        } catch (e) {
            return null;
        }
    }

    set(key: string, value: any): boolean {
        if (value === undefined) {
            value = null;
        } else {
            value = JSON.stringify(value);
        }

        try {
            if (this._storage) {
                this._storage.setItem(key, value);
            }
        } catch (e) {
            // handle error
            return false;
        }
        return true;
    }
}