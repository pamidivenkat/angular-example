
import { ErrorService } from './error.service';
import { CommonHelpers } from '../helpers/common-helpers';
import { AtlasError } from './atlas-error';
import { ErrorHandler, ReflectiveInjector } from '@angular/core';
export class AtlasErrorHandler implements ErrorHandler {

    private errorService: ErrorService;
    /**
     *
     */
    constructor() {
        this.errorService = ReflectiveInjector.resolveAndCreate([ErrorService]).get(ErrorService);
    }
    
    handleError(error: any): void {
        CommonHelpers.writeExceptionToConsole(error);
        this.errorService.publishError(error);
    }
}
