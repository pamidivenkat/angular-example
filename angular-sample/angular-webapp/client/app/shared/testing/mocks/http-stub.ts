import { AuthConfig } from './../../security/auth-config';
import { RestClientService } from './../../data/rest-client.service';
import { RouteParamsMock } from './route-params-mock';
import { Store } from '@ngrx/store';
import { authConfigServiceFactory } from '../../security/auth-config';
import { AuthorizationServiceStub } from './authorization-service-mock';
import { BaseRequestOptions, Http } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import * as fromRoot from '../../../shared/reducers';

export class HttpStub  {
  
}

export const mockHttpProvider = {
    deps: [MockBackend, BaseRequestOptions],
    useFactory: (backend: MockBackend, defaultOptions: BaseRequestOptions) => {
        return new Http(backend, defaultOptions);
    }
};

export const restClientServiceProvider = {
    deps: [HttpStub, AuthorizationServiceStub, authConfigServiceFactory(), Store, RouteParamsMock, BaseRequestOptions],
    useFactory: (http: HttpStub, authService: AuthorizationServiceStub, options:any, store: Store<fromRoot.State>,
        routeParams: RouteParamsMock,
        defOpts?: BaseRequestOptions) => {
        return new RestClientService(<any>http, <any>authService, options, store, <any>routeParams, defOpts);
    }

}