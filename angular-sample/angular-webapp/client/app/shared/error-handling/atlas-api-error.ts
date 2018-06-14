import { isNullOrUndefined } from 'util';
import { Md5 } from 'ts-md5/dist/md5';
import { MessageEvent } from '../../atlas-elements/common/models/message-event.enum';
export class AtlasApiError {
    public Event: MessageEvent;
    public Error: any;
    public Code: any;
    public Identifier: string;
    public Entity: string;
    constructor(error: any, event: MessageEvent, entity: string, objectIdentifier: string, code: string = null) {
        this.Error = error;
        this.Entity = entity;
        this.Identifier = objectIdentifier;
        this.Code = code;
        this.Event = event;
        if (!code && !isNullOrUndefined(objectIdentifier)) {
            this.Code = Md5.hashStr(objectIdentifier);
        }
    }
}