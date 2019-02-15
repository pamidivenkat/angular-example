import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { InspectionService } from "../core/services/inspection.service";
import { BaseComponent } from "../shared/base-component";
import * as constants from "./../app.constants";
import { Inspection, Section } from "./../core/models/inspection";

@Component({
  selector: "app-inspection",
  templateUrl: "./inspection.component.html",
  styleUrls: ["./inspection.component.scss"]
})
export class InspectionComponent extends BaseComponent implements OnInit {
  private _inspection: Inspection;
  private _isLoading: boolean = false;
  private _generalSection: Section = new Section();
  private _otherSections: Array<Section> = [];

  public consts;
  public inspSubject: Subject<Inspection> = new Subject();

  get inspection() {
    return this._inspection;
  }
  get isLoading(): boolean {
    return this._isLoading;
  }
  get generalSection(): Section {
    return this._generalSection;
  }
  get otherSections(): Array<Section> {
    return this._otherSections;
  }

  constructor(private _inspectionService: InspectionService, private _activatedRoute: ActivatedRoute) {
    super();
    this.consts = constants;
    this._inspection = new Inspection();
    //TODO : Mock data

    // Mock data
  }

  ngOnInit() {
    this._isLoading = true;
    this._activatedRoute.params
      .pipe(takeUntil(this._destructor$))
      .switchMap(params => {
        return this._inspectionService.getInspectionDetails(params.id);
      })
      .subscribe(data => {
        this._isLoading = false;
        if (data instanceof HttpErrorResponse) {
          //TODO
        } else {
          this._inspection = data;
          this._generalSection = this._inspection.tblInspectionSections.find(
            section => section.inspectionSectionType.sectionTypeID === 1
          );

          this._inspection.property.location = [
            this._inspection.property.propertyAddress,
            this._inspection.property.cityName,
            this._inspection.property.stateName,
            this._inspection.property.propertyZip,
            this._inspection.property.countryName
          ]
            .filter(part => part)
            .join(", ");

          this._otherSections = this._inspection.tblInspectionSections
            .filter(section => section.inspectionSectionType.sectionTypeID !== 1)
            .filter(
              section =>
                section.detailedNotes.length > 0 || section.inspectionSectionItems.length > 0 || section.rating > 0
            )
            .sort((a, b) => (a.inspectionSectionType.sectionTypeID > b.inspectionSectionType.sectionTypeID ? 1 : -1));
          this._inspection.createdOn = this._inspection.createdOn ? this._inspection.createdOn : new Date().toString();

          this.inspSubject.next(Object.assign({}, this._inspection));
        }
      });
  }

  updateBookmark(event) {}
}
