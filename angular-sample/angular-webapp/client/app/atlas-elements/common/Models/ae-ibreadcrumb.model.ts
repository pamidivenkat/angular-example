import { Params } from '@angular/router';
import { BreadcrumbGroup } from './ae-breadcrumb-group';

export class IBreadcrumb {
  label: string;
  params?: Params;
  url: string;
  group: BreadcrumbGroup;
  isGroupRoot: boolean = false;

  constructor(label: string, url: string, group: BreadcrumbGroup, params?: Params, isGroupRoot: boolean = false) {
    this.group = group;
    this.isGroupRoot = isGroupRoot;
    this.label = label;
    this.params = params;
    this.url = url;
  }
}
