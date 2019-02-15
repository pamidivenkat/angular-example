import { select } from "@angular-redux/store";
import { Overlay, OverlayConfig, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, ViewContainerRef, ViewEncapsulation } from "@angular/core";
import { MatIconRegistry } from "@angular/material";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { Observable, of } from "rxjs";
import { filter, switchMap, takeUntil } from "rxjs/operators";

import { ReviewRequest } from "../../../core/models/review-request";
import { User } from "../../../core/models/user";
import { IdentityActions } from "../../../core/redux/actions/identity.actions";
import { ReviewService } from "../../../core/services/review.service";
import { SnackbarService } from "../../../core/services/snackbar.service";
import { BaseComponent } from "../../base-component";
import { SmdFabSpeedDialComponent } from "./speed-dial/speed-dial";

@Component({
  selector: "app-fab-button",
  templateUrl: "./fab-button.component.html",
  styleUrls: ["./fab-button.component.scss"],
  encapsulation: ViewEncapsulation.None
})
export class FabButtonComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _overlayRef: OverlayRef;
  private _isPropertyPage: boolean;
  private _propertyId: number;
  private _pointsEarned: number;
  private _user: any;

  @select(["settings", "values"])
  private _settings$: Observable<Array<any>>;

  @select(["identity", "user"])
  private _user$: Observable<any>;
  // End of Private Fields

  // Public properties
  open = false;
  fixed = true;

  isIEOrEdge = /msie\s|trident\/|edge\//i.test(window.navigator.userAgent);

  get isPropertyPage(): boolean {
    return this._isPropertyPage;
  }
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(
    private _router: Router,
    private _overlay: Overlay,
    private _viewContainerRef: ViewContainerRef,
    private _matIconRegistry: MatIconRegistry,
    private _domSanitizer: DomSanitizer,
    private _reviewService: ReviewService,
    private _snackbar: SnackbarService,
    private _identityActions: IdentityActions
  ) {
    super();
    this._isPropertyPage = false;

    this._matIconRegistry.addSvgIcon(
      "request_review",
      this._domSanitizer.bypassSecurityTrustResourceUrl("Clientapp/dist/assets/swap_vertical_circle.svg")
    );

    this._matIconRegistry.addSvgIcon(
      "hb_help",
      this._domSanitizer.bypassSecurityTrustResourceUrl("Clientapp/dist/assets/help.svg")
    );

    this._matIconRegistry.addSvgIcon(
      "hb_info",
      this._domSanitizer.bypassSecurityTrustResourceUrl("Clientapp/dist/assets/info.svg")
    );

    this._matIconRegistry.addSvgIcon(
      "hb_stars",
      this._domSanitizer.bypassSecurityTrustResourceUrl("Clientapp/dist/assets/stars.svg")
    );

    this._settings$
      .pipe(
        takeUntil(this._destructor$),
        filter(setting => setting !== null)
      )
      .subscribe(settings => {
        this._pointsEarned = settings.find(setting => setting.name.toLowerCase() === "points:reviewrequest").value;
      });
  }

  // End of constructor

  // Private methods
  // End of private methods

  // Public methods
  ngOnInit() {
    this._router.events.subscribe(event => {
      this._overlayRef && this._overlayRef.dispose();
      this.open = false;
    });

    this._user$.pipe(takeUntil(this._destructor$)).subscribe(u => (this._user = u));
  }

  addPost(type: string) {
    if (this._router.url.startsWith("/property")) {
      const routes = this._router.url.split("/");
      this._router.navigate(["/" + type + "/add"], {
        queryParams: { property: routes[2] }
      });
    } else {
      this._router.navigate(["/" + type + "/add"]);
    }
  }

  showButtons() {
    if (this._router.url.startsWith("/property")) {
      this._isPropertyPage = true;
      let urlParts = this._router.url.split("/");
      this._propertyId = +urlParts[2];
    } else {
      this._isPropertyPage = false;
    }
    if (this.open) {
      this._overlayRef.dispose();
      this.open = !this.open;
      return;
    }

    let config = new OverlayConfig();
    config.hasBackdrop = true;

    this._overlayRef = this._overlay.create(config);

    this._overlayRef.backdropClick().subscribe(() => {
      this._overlayRef.dispose();
      this.open = !this.open;
    });

    this._overlayRef.attach(new ComponentPortal(SmdFabSpeedDialComponent, this._viewContainerRef));

    this.open = !this.open;
  }

  addReviewRequest() {
    let reviewRequest = new ReviewRequest();
    reviewRequest.id = 0;
    reviewRequest.propertyId = this._propertyId;
    reviewRequest.active = 1;

    this._reviewService
      .checkForExistingReview(this._propertyId)
      .pipe(
        takeUntil(this._destructor$),
        switchMap(response => {
          if (response instanceof HttpErrorResponse) {
            return of(response);
          } else {
            return this._reviewService.createReviewRequest(reviewRequest).pipe(takeUntil(this._destructor$));
          }
        })
      )
      .subscribe(response => {
        if (response instanceof HttpErrorResponse) {
          if (response.status === 500) {
            this._snackbar.error(response.error);
          } else {
            this._snackbar.error("Unable to create review request");
          }
        } else {
          this._snackbar.success(`Review request created - ${this._pointsEarned} points earned`);
        }

        let updatedUser: User = Object.assign({}, this._user);
        updatedUser.points = +updatedUser.points + +this._pointsEarned;
        this._identityActions.loadUserIdentity(updatedUser);

        this._overlayRef.dispose();
        this.open = !this.open;
      });
  }

  // End of public methods
}
