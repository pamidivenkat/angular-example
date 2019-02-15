import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { takeUntil } from "rxjs/operators";

import { Promotion } from "../core/models/promotion";
import { Property } from "../core/models/property";
import { PromotionService } from "../core/services/promotion.service";
import { SnackbarService } from "../core/services/snackbar.service";
import { BaseComponent } from "../shared/base-component";
import { accordionAnimation } from "../shared/helpers/animations";
import * as constants from "./../app.constants";

@Component({
  selector: "app-promotion",
  templateUrl: "./promotion.component.html",
  styleUrls: ["./promotion.component.scss"],
  animations: [accordionAnimation]
})
export class PromotionComponent extends BaseComponent implements OnInit {
  private _promotion: Promotion;
  private _venues: Array<Property> = [];
  private _isAnnouncement: boolean = false;

  public consts;
  public toggleInfoBarStatus: boolean = false;
  public isLoading: boolean = true;

  get promotion() {
    return this._promotion;
  }

  get venues(): Array<any> {
    return this._venues;
  }

  get isAnnouncement(): boolean {
    return this._isAnnouncement;
  }

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _promotionService: PromotionService,
    private _snackbar: SnackbarService
  ) {
    super();
    this.consts = constants;

    this._promotion = new Promotion();
  }

  ngOnInit() {
    this._activatedRoute.params
      .pipe(takeUntil(this._destructor$))
      .switchMap(params => {
        if (this._activatedRoute.snapshot.url[0].path === "announcement") {
          this._isAnnouncement = true;
          return this._promotionService.getAnnouncementById(params.id);
        } else {
          return this._promotionService.getPromotionById(params.id);
        }
      })
      .subscribe(response => {
        this.isLoading = false;
        if (response instanceof HttpErrorResponse) {
          this._snackbar.error(response.statusText);
        } else {
          if (this._isAnnouncement) {
            this._promotion = new Promotion();
            this._promotion.promoId = response.announcementId;
            this._promotion.dateOffered = response.createdOn;
            this._promotion.headline = response.title;
            this._promotion.details = response.body;
          } else {
            this._promotion = response;
            this._venues = [response.property];
          }
        }
      });
  }

  toggleInfoBar() {
    this.toggleInfoBarStatus = !this.toggleInfoBarStatus;
  }

  mailToContact() {
    location.href = `mailto:${this._promotion.promoEmail}`;
  }
}
