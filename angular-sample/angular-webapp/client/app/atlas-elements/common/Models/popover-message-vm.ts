import { isFunction } from 'util';
import { MessageType } from '../ae-message.enum';
import { PopoverVm } from './popover-vm';
import { IMessageVM } from '../../../shared/models/imessage-vm';
export class PopoverMessageVm<T> implements IMessageVM {
    public type: MessageType;
    vm: PopoverVm<any>;

    public toMessage(): string {
        throw new Error('Not implemented yet.');
    }

    public getDataObject<T>(): T {
        let data: T = {} as T;
        for (let key in this) {
            if (key) {
                let val = this[key];
                if (!isFunction(val)) {
                    data[key.toString()] = val;
                }
            }
        }
        return data;

    }
}

export function createPopoverMessageVm(vm: PopoverVm<any>) {
    let message = new PopoverMessageVm<any>();
    message.vm = vm;
    message.type = MessageType.Info;
    return message;
}


