import { isNullOrUndefined } from 'util';
import { BreadcrumbGroup } from '../models/ae-breadcrumb-group';
import { BehaviorSubject } from 'rxjs/Rx';
import { IBreadcrumb } from '../models/ae-ibreadcrumb.model';
import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

/**
 * Breadcrumb Service
 * 
 * @export
 * @class BreadcrumbService
 */
@Injectable()
export class BreadcrumbService {
    private _currentBC: IBreadcrumb;

    private _breadcrumbs: IBreadcrumb[] = [];
    public breadCrumbSubject = new BehaviorSubject(this._breadcrumbs);

    constructor(private _router: Router) {
        this._breadcrumbs = [];
        this._router.events.subscribe((val: any) => {
            if (val instanceof NavigationStart) {
                this.clearAll();
            }
        }

        );

    }

    /**
     * @Method
     * Public method to add breadcrumb item
     * 
     * @memberOf BreadcrumbService
     */
    public add = (newBC: IBreadcrumb): void => {
        if (this.isExists(newBC)) {
            // this.removeBreadcrumbs(newBC);
        } else {
            this._breadcrumbs.push(newBC);
            this.breadCrumbSubject.next(this._breadcrumbs);
        }
    }

    public get(group: BreadcrumbGroup): IBreadcrumb[] {
        return this._breadcrumbs.filter((b) => b.group === group);
    }

    public clear(group: BreadcrumbGroup) {
        this._breadcrumbs = this._breadcrumbs.filter((b) => b.group !== group || b.isGroupRoot);
        this.breadCrumbSubject.next(this._breadcrumbs);
    }

    public clearAll() {
        this._breadcrumbs = this._breadcrumbs.filter((b) => b.isGroupRoot);
        this.breadCrumbSubject.next(this._breadcrumbs);
    }

    private isExists = (bc: IBreadcrumb): IBreadcrumb => {
        let list = this._breadcrumbs.filter(obj => obj.label === bc.label && obj.group === bc.group);
        this._currentBC = list[0];
        return this._currentBC;
    }

    public removeBreadcrumbs = (bc: IBreadcrumb): void => {
        let bcIndex = this._breadcrumbs.indexOf(bc);
        this._breadcrumbs.splice(bcIndex, 1);
    }
}
