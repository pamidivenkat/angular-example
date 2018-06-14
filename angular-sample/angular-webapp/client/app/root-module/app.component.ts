import { LoadMenuAction } from './actions/menu.actions';
import { Menu } from './models/menu';
import { IBreadcrumb } from '../atlas-elements/common/models/ae-ibreadcrumb.model';
import { BreadcrumbService } from '../atlas-elements/common/services/breadcrumb-service';
import { ErrorService } from '../shared/error-handling/error.service';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, AfterViewChecked } from '@angular/core';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: []
})
export class AppComponent implements OnInit {
    private homeBC: IBreadcrumb;
    errors: any[] = [];
    constructor(private errorService: ErrorService
        , private _breadcrumbService: BreadcrumbService
        , private _cdRef: ChangeDetectorRef) {
        this.errorService.subscribeToError((error) => {
            this.errors.push(error);
        });
    }
    navs = [
        { url: '', content: 'Home' },
        { url: 'design', content: 'Atlas Design' },
        { url: 'employee', content: 'Employee' }

    ];

    ngOnInit(): void {
        //this.homeBC = { label: 'Dashboard', url: '' };
        //this._breadcrumbService.add(this.homeBC);
    }

    // ngAfterViewChecked() {
    //     let baseUrl = window.location.href;
    //     let nodesArray = [].slice.call(document.querySelectorAll("use[*|href]"));
    //     let filterdItems = nodesArray.filter(function (element) {
    //         return (element.getAttribute("xlink:href").indexOf("#") === 0);
    //     });

    //     filterdItems.forEach(function (element) {
    //         let linkHref = baseUrl + element.getAttribute("xlink:href");
    //         element.setAttribute("xlink:href", linkHref);
    //     });

    // }
}
