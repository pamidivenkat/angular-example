import { BehaviorSubject } from 'rxjs/Rx';
import { IBreadcrumb } from './../../../atlas-elements/common/models/ae-ibreadcrumb.model';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BreadcrumbService } from './../../../atlas-elements/common/services/breadcrumb-service';

@Injectable()
export class BreadcrumbServiceStub {
    private _currentBC: IBreadcrumb;
    private _breadcrumbs: IBreadcrumb[] = [];
    public breadCrumbSubject = new BehaviorSubject(this._breadcrumbs);

    public add(newBC: IBreadcrumb) {
        
    }
    
}
