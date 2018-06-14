import { Subject, Subscription } from 'rxjs/Rx';
import { Injectable } from '@angular/core';

@Injectable()
export class ErrorService {

  constructor() { }

  private _onError:Subject<any> = new Subject<any>();

  publishError(error:Error){
    this._onError.next(error);
  }

  subscribeToError(fn:any):Subscription{
    return this._onError.subscribe(fn);
  }

}
