import { IMessageVM } from '../models/imessage-vm';
import { isNullOrUndefined } from 'util';
import { Injectable } from '@angular/core';

@Injectable()
export class MessengerService {

    // Private fields
    private _subscriptionList: Map<string, Array<(value: IMessageVM) => void>>;
    // End of Private fields

    // Public Properties
    // End of Public Properties

    // Constructors
    constructor() {
        this._subscriptionList = new Map<string, Array<(value: IMessageVM) => void>>();
    }
    // End of  Constructors

    // Public Methods
    /**
     * subscribe
     */
    public subscribe(token: string, subscriber: (value: IMessageVM) => void) {
        let existing = this._subscriptionList.get(token)
        if (isNullOrUndefined(existing)) {
            this._subscriptionList.set(token, []);
            existing = this._subscriptionList.get(token);
        }
        existing.push(subscriber);
    }

    /**
     * publish
     */
    public publish(token: string, data: IMessageVM) {
        let subscribers = this._subscriptionList.get(token);
        if (!isNullOrUndefined(subscribers)) {
            subscribers.map((subscriber) => {
                subscriber(data);
            });
        }
    }
    // End of Public Methods
}
