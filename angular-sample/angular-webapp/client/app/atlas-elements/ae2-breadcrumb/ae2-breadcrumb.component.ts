import { BreadcrumbGroup } from '../common/models/ae-breadcrumb-group';
import { StringHelper } from '../../shared/helpers/string-helper';
import { Router, NavigationExtras } from '@angular/router';
import { AeClassStyle } from '../common/ae-class-style.enum';
import { IBreadcrumb } from '../common/models/ae-ibreadcrumb.model';
import { BaseElement } from '../common/base-element';
import { BreadcrumbService } from '../common/services/breadcrumb-service';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation, Input } from '@angular/core';

@Component({
  selector: 'ae2-breadcrumb',
  templateUrl: './ae2-breadcrumb.component.html',
  styleUrls: ['./ae2-breadcrumb.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Ae2BreadcrumbComponent extends BaseElement implements OnInit {

  private _bcList: Array<IBreadcrumb>;
  private _breadcrumbClass: AeClassStyle = AeClassStyle.Breadcrumb;
  private _group: BreadcrumbGroup;
  constructor(private _breadcrumbService: BreadcrumbService, public _router: Router, private _cdr: ChangeDetectorRef) {
    super();
    this._bcList = [];
  }
  @Input('group')
  get group(): BreadcrumbGroup {
    return this._group;
  }
  set group(g: BreadcrumbGroup) {
    this._group = g;
  }

  get bcList(): Array<IBreadcrumb> {
    return this._bcList;
  }

  get breadcrumbClass(): AeClassStyle {
    return this._breadcrumbClass;
  }

  ngOnInit() {
    super.ngOnInit();
    this._breadcrumbService.breadCrumbSubject.subscribe((data) => {
      this._bcList = data.filter((b) => b.group === this._group);
      this._cdr.markForCheck();
    });
  }

  private redirectTo(obj): void {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    };
    if (obj && !StringHelper.isNullOrUndefinedOrEmpty(obj.url) && obj.url != '/') {
      this._router.navigate([obj.url], navigationExtras);
    } else {
      navigationExtras.queryParamsHandling = "";
      this._router.navigate([obj.url], navigationExtras);//for home page no need of cid to carry on to the link
    }
  }
}
