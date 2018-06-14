import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { isNullOrUndefined } from "util";
import { LookupServiceService } from "../services/lookup-service.service";
@Pipe({
  name: 'aeAsync'
})
export class AeAsyncPipe implements PipeTransform {

  constructor(
    private _lookuoService: LookupServiceService) {
  }

  transform(value: Observable<any>, lookup: boolean, actionNameOrActionDispatchMethod: Function | string): any {
    if (!isNullOrUndefined(value)) {
      value.subscribe((val) => {
        if (isNullOrUndefined(val)) {
          this._processDispatch(lookup, actionNameOrActionDispatchMethod);
        } else {
          return val;
        }
      });
    }
    return null;
  }

  private _processDispatch(lookup: boolean, actionNameOrActionDispatchMethod: Function | string) {
    if (lookup) {
      this._lookupDispatch(<string>actionNameOrActionDispatchMethod);
    } else {
      this._dispatch(<Function>actionNameOrActionDispatchMethod);
    }
  }

  private _lookupDispatch(actionName: string) {
    this._lookuoService.dispatch(actionName);
  }

  private _dispatch(actionDispatcher: Function) {
    actionDispatcher();
  }

}
