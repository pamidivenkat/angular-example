import { BehaviorSubject } from 'rxjs/Rx';
export interface AeElementDirectiveModel {
    Property: string,
    Value: BehaviorSubject<any>;
}


