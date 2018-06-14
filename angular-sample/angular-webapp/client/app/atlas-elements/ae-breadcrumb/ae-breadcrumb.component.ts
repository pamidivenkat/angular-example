import { IBreadcrumb } from '../common/models/ae-ibreadcrumb.model';
import { ActivatedRoute, NavigationEnd, PRIMARY_OUTLET, Router, NavigationExtras } from '@angular/router';
import { BaseElement } from '../common/base-element';
import { AeClassStyle } from '../common/ae-class-style.enum';
import 'rxjs/add/operator/filter';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'ae-breadcrumb',
  templateUrl: './ae-breadcrumb.component.html',
  styleUrls: ['./ae-breadcrumb.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeBreadcrumbComponent extends BaseElement implements OnInit {
  /** Private fields */
  private _breadcrumbClass: AeClassStyle = AeClassStyle.Breadcrumb;
  private _breadcrumbs: IBreadcrumb[] = [];
  private _idKey: number = 0;
  /** End of private fields */

  get breadcrumbs(): IBreadcrumb[] {
    return this._breadcrumbs;
  }
  /** Constructor */
  constructor(private activatedRoute: ActivatedRoute, public _router: Router, private _cdr: ChangeDetectorRef) {
    super();
    this._breadcrumbs = [];
  }
  /** End of Constructor */

  ngOnInit() {
    let ROUTE_DATA_BREADCRUMB: string = "breadcrumb";
    this._router.events.filter(event => event instanceof NavigationEnd).subscribe(event => {
      let root: ActivatedRoute = this.activatedRoute.root;
      this._breadcrumbs = this.getBreadcrumbs(root);
      this._cdr.markForCheck();
    });
  }

  /** Private methods */


  /**
   * Method to navigate on clicking breadcrumb link
   * 
   * @private
   * @param {any} obj 
   * 
   * @memberOf AeBreadcrumbComponent
   */
  private redirectTo(obj): void {
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'merge'
    };
    if (obj) {
      this._router.navigate([obj.url], navigationExtras);
    } else {
      this._router.navigateByUrl('');
    }
  }

  /**
   * Method to generate list of breadcrumb items
   * 
   * @private
   * @param {ActivatedRoute} route 
   * @param {string} [url=""] 
   * @param {IBreadcrumb[]} [breadcrumbs=[]] 
   * @returns {IBreadcrumb[]} 
   * 
   * @memberOf AeBreadcrumbComponent
   */
  private getBreadcrumbs(route: ActivatedRoute, url: string = "", breadcrumbs: IBreadcrumb[] = []): IBreadcrumb[] {
    let ROUTE_DATA_BREADCRUMB: string = "breadcrumb";
    //get the child routes
    let children: ActivatedRoute[] = route.children;

    //return if there are no more children
    if (children.length === 0) {
      return breadcrumbs;
    }

    //iterate over each children
    for (let child of children) {
      //verify primary route
      if (child.outlet !== PRIMARY_OUTLET) {
        continue;
      }

      //verify the custom data property "breadcrumb" is specified on the route
      if (!child.snapshot.data.hasOwnProperty(ROUTE_DATA_BREADCRUMB)) {
        return this.getBreadcrumbs(child, url, breadcrumbs);
      }

      //get the route's URL segment
      let routeURL: string = child.snapshot.url.map(segment => segment.path).join("/");
      //append route URL to URL
      if (routeURL.length > 0) {
        url += `/${routeURL}`;
        // let breadcrumb: IBreadcrumb = {
        //   label: child.snapshot.data[ROUTE_DATA_BREADCRUMB],
        //   params: child.snapshot.params,
        //   url: url
        // };
        // breadcrumbs.push(breadcrumb);
      }
      return this.getBreadcrumbs(child, url, breadcrumbs);
    }
  }
  /** End of Private methods */

}

