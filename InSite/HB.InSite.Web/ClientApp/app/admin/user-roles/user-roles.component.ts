import { Component, OnInit, ViewChild, ChangeDetectorRef, Injectable } from "@angular/core";
import { FormControl, FormGroup, FormBuilder } from "@angular/forms";
import { MatSelect, MatDialog } from "@angular/material";
import { ActivatedRoute, Router, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Observable, observable } from "rxjs";
import { switchMap, takeUntil, distinctUntilChanged } from "rxjs/operators";

import { AssociateUser, User } from "../../core/models/user";
import { PostService } from "../../core/services/post.service";
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

@Component({
  selector: "app-user-roles",
  templateUrl: "./user-roles.component.html",
  styleUrls: ["./user-roles.component.scss"]
})
export class UserRolesComponent extends BaseComponent implements OnInit {
    @select(["identity", "user"])
    User$: Observable<User>;
    // Private Fields
    private _user: User;
    private _userRolesId: number;
    private _userRoles: any;
    private _isEditing: number = -1;
    private _isLoading: boolean;
    private defaultValues = {
        role: 0
    };
    // End of Private Fields

    // Public properties
    public isHybridApp: boolean;
    public userRolesList: any;
    public userRolesForm: FormGroup;
    public editorOptions: any;
    public userList: Array<any>;
    get isEditing(): number {
        return this._isEditing;
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
        //private _userRolesService: any,
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
    private _updateUserRolesValues() {
        this._userRoles.roleId = this.userRolesForm.get("role").value;
    }
    // End of private methods

    // Public methods
    ngOnInit() {
        this.isHybridApp = window["isHybridApp"];
        this._activatedRoute.url.subscribe(urlComponents => {
            let key = urlComponents[0].path.replace(/(?:^|\s)[a-z]/g, m =>
                m.toUpperCase()
            );
            //this._userRolesType = UserRolesType[key];
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
                this.userList = data;
                this._userService.getRolesList().subscribe(data => {
                    this.userRolesList = data;
                });
            }
        );
    }
    editUser(user, index) {
        this._isEditing = index;
        this._userRoles = user;
        this.userRolesForm = this._fb.group(this.defaultValues);
        this.userRolesForm.get("role").setValue(user.roleId);
    }

    updateUserRole(roleId, index) {
        this.userList[index].roleId = roleId;
        this.userList[index].roles = [this.userRolesList.find(function (obj) { return obj.id === roleId; }).normalizedName ];
    }

    cancel() {
        this.userRolesForm.reset(this.defaultValues);
        this._isEditing = -1;
        //TODO : navigate to previous route.
        //this._router.navigateByUrl("/");
    }

    onSubmit() {
        if (!this.userRolesForm.valid) {
            this._snackbarService.error("Please fix the errors");
            return;
        }
        this._isEditing = -1;

        this._updateUserRolesValues();
        const userRoleMap = { "id": this._userRoles.id, "roleId": this._userRoles.roleId };
        this._userService
            .setUserRoles(userRoleMap)
            .pipe(takeUntil(this._destructor$))
            .subscribe(response => {
                if (!response || (response && !response.error)) {
                    this._snackbarService.success(
                        "User role updated successfully",
                        SnackbarType.Success
                    );
                    this._userRoles = response;
                    //this._router.navigateByUrl("/");
                }
            });
    }
    // End of public methods
}

@Injectable()
export class UserRolesResolver implements Resolve<any> {
    constructor(private _userService: UserService) { }

    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<any> {
        return this._userService.getUserListWithRoles();
    }
}