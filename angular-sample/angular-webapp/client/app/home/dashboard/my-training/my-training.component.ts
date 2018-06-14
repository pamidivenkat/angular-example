import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { BaseComponent } from '../../../shared/base-component';
import { AeListItem } from './../../../atlas-elements/common/models/ae-list-item';
import { MyTraining } from './../../models/my-training';
import { Store } from '@ngrx/store';
import { ClaimsHelperService } from './../../../shared/helpers/claims-helper';
import { LocaleService, TranslationService } from 'angular-l10n';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import * as fromRoot from '../../../shared/reducers/index';
import * as Immutable from 'immutable';

@Component({
    selector: 'app-mytrainings',
    templateUrl: './my-training.component.html',
    styleUrls: ['./my-training.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class MyTrainingsComponent extends BaseComponent implements OnInit, OnChanges {
    // Private Fields
    private _trainings: MyTraining[];
    private _aeListItems: AeListItem[];
    private _isLoading: boolean = false;
    private _myTeamTasksExists: boolean = false;
    // End of Private Fields

    // Public properties

    @Input('myTeamTasksExists')
    get myTeamTasksExists(): boolean {
        return this._myTeamTasksExists;
    }
    set myTeamTasksExists(myTeamTasksExists: boolean) {
        this._myTeamTasksExists = myTeamTasksExists;
    }

    @Input('trainings')
    get Trainings(): MyTraining[] {
        return this._trainings;
    }
    set Trainings(value: MyTraining[]) {
        this._trainings = value;
    }
    @Input('isLoading')
    get isLoading(): boolean {
        return this._isLoading;
    }
    set isLoading(value: boolean) {
        this._isLoading = value;
    }

    get aeListItems(): AeListItem[] {
        return this._aeListItems;
    }
    set aeListItems(value: AeListItem[]) {
        this._aeListItems = value;
    }

    get ImmutableItems() {
        return Immutable.List(this._aeListItems);
    }

    // End of Public properties

    // Public Output bindings
    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ContnetChild bindings
    // End of Public ContnetChild bindings

    // Constructor
    constructor(protected _localeService: LocaleService
        , protected _translationService: TranslationService
        , protected _cdRef: ChangeDetectorRef
        , private _claimsHelper: ClaimsHelperService
        , private _store: Store<fromRoot.State>
        , private _router: Router
        , private _route: ActivatedRoute) {
        super(_localeService, _translationService, _cdRef);

    }
    // End of constructor

    // Private methods
    needToShowPendingMsg(): boolean {
        return this._aeListItems && this._aeListItems.length > 0;
    }
    needToShowUptoUpdateMsg(): boolean {
        return this._aeListItems && this._aeListItems.length == 0;
    }

    isHolidayAuthoriserOrManager(): boolean {
        return this._claimsHelper.isHolidayAuthorizerOrManager();
    }

    myTeamTrainingTasksExists(): boolean {
        return this._myTeamTasksExists;
    }

    onTeamTrainingTasksInfoClick() {
        let navigationExtras: NavigationExtras = {
            queryParamsHandling: 'merge',
            relativeTo: this._route
        };
        this._router.navigate(["task/view/myteam/training"], navigationExtras);
    }
    // End of private methods

    // Public methods
    onTrainingClick(ev) {
        let courseTitle = ev.selectedItem.Text;
        let navigationExtras: NavigationExtras = {
            queryParamsHandling: 'merge',
            relativeTo: this._route
        };
        this._router.navigate(["training/byname/" + courseTitle], navigationExtras);
    }

    ngOnInit(): void {
    }

    ngOnChanges(): void {
        if (this.Trainings) {
            this.aeListItems = [];
            this.Trainings.forEach(training => {
                let listItem = new AeListItem(training);
                listItem.Text = training.ModuleTitle;
                listItem.IsClickable = true;
                this.aeListItems.push(listItem);
            });
        }
    }
    // End of public methods
}

