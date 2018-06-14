import { AuthorizationService } from './../../security/authorization.service';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthorizationServiceStub  {

    constructor() {
            
    }
   
    public GetToken(){}

    public SignOut() {}

    public AuthorizedCallback() {}

    public SetAuthorizationData(token: any, id_token: any, url: string = null) {}

    public Authorize(url: string){}

    public IsAuthorized() {}
}

export function AuthorizationServiceFactory()
{
    return  new AuthorizationServiceStub()
}