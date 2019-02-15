import { Injectable } from "@angular/core";

import { IdentityActions } from "./core/redux/actions/identity.actions";

@Injectable()
export class AppConfigService {
  public message: string;

  constructor(private _identActions: IdentityActions) {}

  load(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      // console.log("App init called");
      this._identActions.initIdentity();
      // .then(()=>{
      setTimeout(() => {
        // console.log("APP_INITIALIZER completed");
        resolve(true);
      }, 1000);
      // });
    });
  }
}
