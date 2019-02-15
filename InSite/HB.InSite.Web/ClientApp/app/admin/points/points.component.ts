import { Component, OnInit, ViewChild, ChangeDetectorRef, Injectable } from "@angular/core";
import { FormControl, FormGroup, FormBuilder } from "@angular/forms";
import { MatSelect, MatDialog } from "@angular/material";
import { ActivatedRoute, Resolve, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { switchMap, takeUntil, distinctUntilChanged } from "rxjs/operators";

import { AssociateUser, User } from "../../core/models/user";
import { PostService } from "../../core/services/post.service";
import { AdminService } from "../services/admin.service";
import { UserService } from "../../core/services/user.service";
import { BaseComponent } from "../../shared/base-component";
import { CommonHelpers } from "../../shared/helpers/common-helper";
import { select } from "@angular-redux/store";
import { filter } from "rxjs-compat/operator/filter";
import { SnackbarService } from "../../core/services/snackbar.service";
import { IdentityActions } from "../../core/redux/actions/identity.actions";
import { ClaimsHelperService } from "../../core/services/claims-helper.service";
import { NativeScriptInterfaceService } from "../../shared/services/native-script-interface.service";
import { SnackbarType } from "../../core/models/snackbar-type";
import { SettingsService } from "../../core/services/settings.service";


@Component({
  selector: "app-points",
  templateUrl: "./points.component.html",
  styleUrls: ["./points.component.scss"]
})
export class PointsComponent extends BaseComponent implements OnInit {
    @select(["identity", "user"])
    User$: Observable<User>;
    // Private Fields
    private _user: User;
    private _pointsId: number;
    private _isEditable: boolean = false;
    private _isLoading: boolean;
    private defaultValues = {
        Question: 0,
        Answer: 0,
        Insight: 0,
        Review: 0,
        Inspection: 0,
        InsightComment: 0,
        InsightCommentReply: 0,
        AnswerReply: 0,
        //AnswerReplyComment: 0,
        ReviewRequest: 0,
        ExtendExpiration: 0
    };
    // End of Private Fields

    // Public properties
    points: any;
    public isHybridApp: boolean;
    public pointsForm: FormGroup;
    public pointsList: any;
    public editorOptions: any;
    public userlist: Array<any>;
    get isEditable(): boolean {
        return this._isEditable;
    }

    @select(["settings", "values"])
    settings$: Observable<Array<any>>;
    // End of Public properties

    // Public Output bindings
    // End of Public Output bindings

    // Public ViewChild bindings
    // End of Public ViewChild bindings

    // Public ContentChild bindings
    // End of Public ContentChild bindings

    // Constructor
    constructor(
        private _fb: FormBuilder,
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _postService: PostService,
        private _snackbarService: SnackbarService,
        private _dialog: MatDialog,
        private nsInterfaceService: NativeScriptInterfaceService,
        private _cdr: ChangeDetectorRef,
        private _claimsHelper: ClaimsHelperService,
        private _pointsService: SettingsService,
        private _identityActions: IdentityActions,
        private _userService: UserService
    ) {
        super();
        //this.User$.pipe(
        //    distinctUntilChanged(),
        //    filter(u => u != null)
        //).subscribe(u => (this._user = u));

    }
    // End of constructor

    // Private methods
    private _initForm() {
        this.pointsForm = this._fb.group(this.defaultValues);
    }

    private _updatePointsValues() {
        this.pointsList.filter(function (value) { return (value.name.indexOf('Question') > -1) })[0].value = this.pointsForm.get("Question").value + '';
        this.pointsList.filter(function (value) { return (value.name.indexOf('Answer') > -1) })[0].value = this.pointsForm.get("Answer").value + '';
        this.pointsList.filter(function (value) { return (value.name.indexOf('Insight') > -1) })[0].value = this.pointsForm.get("Insight").value + '';
        this.pointsList.filter(function (value) { return (value.name.indexOf('Review') > -1) })[0].value = this.pointsForm.get("Review").value + '';
        this.pointsList.filter(function (value) { return (value.name.indexOf('Inspection') > -1) })[0].value = this.pointsForm.get("Inspection").value + '';
        this.pointsList.filter(function (value) { return (value.name.indexOf('InsightComment') > -1) })[0].value = this.pointsForm.get("InsightComment").value + '';
        this.pointsList.filter(function (value) { return (value.name.indexOf('InsightCommentReply') > -1) })[0].value = this.pointsForm.get("InsightCommentReply").value + '';
        this.pointsList.filter(function (value) { return (value.name.indexOf('AnswerReply') > -1) })[0].value = this.pointsForm.get("AnswerReply").value + '';
        //this.pointsList.filter(function (value) { return (value.name.indexOf('AnswerReplyComment') > -1) })[0].value = this.pointsForm.get("AnswerReplyComment").value + '';
        this.pointsList.filter(function (value) { return (value.name.indexOf('ReviewRequest') > -1) })[0].value = this.pointsForm.get("ReviewRequest").value + '';
        this.pointsList.filter(function (value) { return (value.name.indexOf('ExtendExpiration') > -1) })[0].value = this.pointsForm.get("ExtendExpiration").value + '';
    }
    // End of private methods

    // Public methods
    ngOnInit() {
        this.isHybridApp = window["isHybridApp"];
        this._activatedRoute.url.subscribe(urlComponents => {
            let key = urlComponents[0].path.replace(/(?:^|\s)[a-z]/g, m =>
                m.toUpperCase()
            );
            //this.pointsType = PointsType[key];
        });
        const routeSubscription$ = this._activatedRoute.params.pipe(
            takeUntil(this._destructor$)
        );
        const dataSubscriptions$ = this._activatedRoute.data.pipe(
            takeUntil(this._destructor$)
        );

        //this._activatedRoute.params
        //    .pipe(
        //        takeUntil(this._destructor$),
        //        switchMap(data => {
        //            return Observable.combineLatest(
        //            );
        //        })
        //    )
        //    .subscribe(response => {
        //        this._isLoading = false;
        //        //this._posts = response[0] && response[0].data ? response[0].data : [];
        //    });

        Observable.combineLatest(routeSubscription$, dataSubscriptions$)
            .pipe(takeUntil(this._destructor$))
            .subscribe(values => {
                const params = values[0];
                const data = values[1].data ? values[1].data : values[1].userListData;
                this._initForm();
                this.pointsList = data ? data : this.defaultValues;
                this.points = {};
                this.pointsList.forEach((setting, key) => {
                    this.points[setting.name.split(":")[1]] = setting;
                });

                this.pointsForm.get("Question").setValue(parseInt(this.pointsList.filter(function (value) { return (value.name.indexOf('Question') > -1) })[0].value));
                this.pointsForm.get("Answer").setValue(parseInt(this.pointsList.filter(function (value) { return (value.name.indexOf('Answer') > -1) })[0].value));
                this.pointsForm.get("Insight").setValue(parseInt(this.pointsList.filter(function (value) { return (value.name.indexOf('Insight') > -1) })[0].value));
                this.pointsForm.get("Review").setValue(parseInt(this.pointsList.filter(function (value) { return (value.name.indexOf('Review') > -1) })[0].value));
                this.pointsForm.get("Inspection").setValue(parseInt(this.pointsList.filter(function (value) { return (value.name.indexOf('Inspection') > -1) })[0].value));
                this.pointsForm.get("InsightComment").setValue(parseInt(this.pointsList.filter(function (value) { return (value.name.indexOf('InsightComment') > -1) })[0].value));
                this.pointsForm.get("InsightCommentReply").setValue(parseInt(this.pointsList.filter(function (value) { return (value.name.indexOf('InsightCommentReply') > -1) })[0].value));
                this.pointsForm.get("AnswerReply").setValue(parseInt(this.pointsList.filter(function (value) { return (value.name.indexOf('AnswerReply') > -1) })[0].value));
                //this.pointsForm.get("AnswerReplyComment").setValue(parseInt(this.pointsList.filter(function (value) { return (value.name.indexOf('AnswerReplyComment') > -1) })[0].value));
                this.pointsForm.get("ReviewRequest").setValue(parseInt(this.pointsList.filter(function (value) { return (value.name.indexOf('ReviewRequest') > -1) })[0].value));
                this.pointsForm.get("ExtendExpiration").setValue(parseInt(this.pointsList.filter(function (value) { return (value.name.indexOf('ExtendExpiration') > -1) })[0].value));
            });
    }

    getDescription(name: string) {
        return this.pointsList.filter(function (value) { return (value.name.indexOf(name) > -1) })[0].description;
    }
    onSubmit() {
        if (!this.pointsForm.valid) {
            this._snackbarService.error("Please fix the errors");
            return;
        }

        this._updatePointsValues();
        
        this._pointsService
            .bulkUpdateSettings(this.pointsList)
            .pipe(takeUntil(this._destructor$))
            .subscribe(response => {
                if (!response || (response && !response.error)) {
                    this._snackbarService.success(
                        "Points updated successfully",
                        SnackbarType.Success
                    );
                    this._router.navigateByUrl("/admin");
                }
            });
    }

    cancel() {
        this.pointsForm.reset(this.defaultValues);

        //TODO : navigate to previous route.
        this._router.navigateByUrl("/admin");
    }
    // End of public methods
}

@Injectable()
export class PointsResolver implements Resolve<any> {
    constructor(private _adminService: AdminService) { }

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> {
        return this._adminService.getPointsSettings();
    }
}
