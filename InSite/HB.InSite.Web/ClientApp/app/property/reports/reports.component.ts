import { DecimalPipe } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, Input, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { distinctUntilChanged, takeUntil } from "rxjs/operators";

import { Property, ReportType, Summary } from "../../core/models/property";
import { PropertyService } from "../../core/services/property.service";
import { SnackbarService } from "../../core/services/snackbar.service";
import { BaseComponent } from "../../shared/base-component";
import { CommonHelpers } from "../../shared/helpers/common-helper";

@Component({
  selector: "app-reports",
  templateUrl: "./reports.component.html",
  styleUrls: ["./reports.component.scss"]
})
export class ReportsComponent extends BaseComponent implements OnInit {
  private _isLoading: boolean = false;
  private _summaryReport: any;
  private _report: Array<any> = [];

  currencies: Array<any> = [];
  selectedReport: string = "summary";
  selectedCurrency: number = 1000;
  reportTypes: Array<any> = [];
  reportType: any;
  hasReportData: boolean = true;
  columnHeight: number;
  tableHeaders: Array<string> = [];

  @Input()
  propertyId: number;

  @Input()
  property: Subject<Property> = new Subject();

  get isLoading(): boolean {
    return this._isLoading;
  }
  get summaryReport(): any {
    return this._summaryReport;
  }
  get report(): Array<any> {
    return this._report;
  }

  constructor(
    private _propertyService: PropertyService,
    private _decimalPipe: DecimalPipe,
    private _snackbar: SnackbarService
  ) {
    super();
    this.reportTypes = CommonHelpers.EnumToArray(ReportType, true);
    this.reportType = ReportType;
  }

  private _getSummaryReport(currency: number = 1000) {
    if (this.propertyId) {
      this._isLoading = true;
      this._propertyService
        .getPropertyReport("GetBookingStatsbyPropertyId", this.propertyId, currency)
        .pipe(takeUntil(this._destructor$))
        .subscribe((report: Summary) => {
          this._isLoading = false;
          if (report instanceof HttpErrorResponse) {
            this._snackbar.error(report.statusText);
            this.hasReportData = false;
          } else {
            this._summaryReport = report;
            this.hasReportData = report ? true : false;
          }
        });
    }
  }

  private _prepareProgramDataReport(records: Array<any>) {
    let currentYear = new Date().getFullYear();
    records.map(record => {
      if (record.year === currentYear) {
        this.tableHeaders.push("This Year");
      } else if (record.year === currentYear - 1) {
        this.tableHeaders.push("Last Year");
      } else if (record.year === currentYear + 1) {
        this.tableHeaders.push("Next Year");
      }
      this._report[0].push(record.totalPrograms);
      this._report[1].push(record.roomNights);
      this._report[2].push(this._decimalPipe.transform(Math.round(+record.convertedRevenue).toString()));
      this._report[3].push(this._decimalPipe.transform(Math.round(+record.convertedADR).toString()));
      this._report[4].push(this._decimalPipe.transform(Math.round(+record.convertedMCR).toString()));
    });
  }

  private _prepareBookingDataReport(records: Array<any>) {
    let currentYear = new Date().getFullYear();
    records.map(record => {
      if (record.year === currentYear) {
        this.tableHeaders.push("This Year");
      } else if (record.year === currentYear - 1) {
        this.tableHeaders.push("Last Year");
      }
      this._report[0].push(record.totalPrograms);
      this._report[1].push(record.roomNights);
      this._report[2].push(this._decimalPipe.transform(Math.round(+record.convertedRevenue)).toString());
      this._report[3].push(this._decimalPipe.transform(Math.round(+record.convertedADR).toString()));
      this._report[4].push(this._decimalPipe.transform(Math.round(+record.convertedMCR).toString()));
    });
  }

  private _getStatsReport(reportType: string, selectionType: string, currency: number) {
    if (this.propertyId) {
      this._isLoading = true;
      this._propertyService
        .getPropertyReport(reportType, this.propertyId, currency, selectionType)
        .pipe(takeUntil(this._destructor$))
        .subscribe(records => {
          this._isLoading = false;

          if (records instanceof HttpErrorResponse) {
            this._snackbar.error(records.statusText);
            this.hasReportData = false;
          } else {
            if (records) {
              this.columnHeight = 24 * records.length;
              records = records.sort((a, b) => (a.year > b.year ? 1 : -1));
              this.tableHeaders = [];
              switch (this.selectedReport) {
                case "programDate":
                  this.tableHeaders = ["Consumed"];
                  this._report = [["Programs"], ["Rooms"], ["Revenue"], ["ADR"], ["MCR"]];
                  this._prepareProgramDataReport(records);
                  break;
                case "bookingDate":
                  this.tableHeaders = ["Booked"];
                  this._report = [["Programs"], ["Rooms"], ["Revenue"], ["ADR"], ["MCR"]];
                  this._prepareBookingDataReport(records);
                  break;
              }
            } else {
              this.columnHeight = 24;
              this.hasReportData = false;
            }
          }
        });
    }
  }

  private _getReport(reportType: string, currency: number) {
    if (this.propertyId) {
      this._isLoading = true;
      this._propertyService
        .getPropertyReport(reportType, this.propertyId, currency)
        .pipe(takeUntil(this._destructor$))
        .subscribe(records => {
          records = records ? records : [];
          this._isLoading = false;

          if (records instanceof HttpErrorResponse) {
            this._snackbar.error(records.statusText);
            this.hasReportData = false;
          } else {
            let currentYear = new Date().getFullYear();
            if (records) {
              records = records.sort((a, b) => (a.year > b.year ? 1 : -1));
            } else {
              this.hasReportData = false;
            }

            this._report = [];
            let key = 0;
            records.map(record => {
              const idx = this._report.findIndex(r => r[3] === record.year);
              if (idx > -1) {
                if (record["name"].toLowerCase() === "bookingdate") {
                  this._report[idx][2] = this._decimalPipe.transform(Math.round(+record.converted)).toString();
                } else {
                  this._report[idx][1] = this._decimalPipe.transform(Math.round(+record.converted)).toString();
                }
              } else {
                this._report[key] = [];
                if (record.year === currentYear) {
                  this._report[key].push("This Year");
                } else if (record.year === currentYear - 1) {
                  this._report[key].push("Last Year");
                } else if (record.year === currentYear + 1) {
                  this._report[key].push("Next Year");
                }
                if (record["name"].toLowerCase() === "bookingdate") {
                  this._report[key][1] = 0;
                  this._report[key][2] = this._decimalPipe.transform(Math.round(+record.converted)).toString();
                } else {
                  this._report[key][1] = this._decimalPipe.transform(Math.round(+record.converted)).toString();
                  this._report[key][2] = 0;
                }
                this._report[key][3] = record.year;
                key++;
              }
            });
          }
        });
    }
  }

  ngOnInit() {
    this._report = [];
    this.property.pipe(distinctUntilChanged()).subscribe(property => {
      this.propertyId = property.propertyId;
      this.selectedReport = "summary";
      this.selectedCurrency = 1000;
      this._getSummaryReport();
    });

    setTimeout(() => {
      this._getSummaryReport();
    }, 15);

    this._propertyService
      .getCurrencies()
      .pipe(takeUntil(this._destructor$))
      .subscribe(data => (this.currencies = data));
  }

  updateReport(selectedReport, currency) {
    this._report = [];
    let rptType = this.reportTypes.find(type => type.value == selectedReport).name;
    switch (rptType) {
      case ReportType.summary:
        this._getSummaryReport(currency);
        break;
      case ReportType.programDate:
        this._getStatsReport("GetInsiteVenueStatsbyPropertyId", "ProgramStartDate", currency);
        break;
      case ReportType.bookingDate:
        this._getStatsReport("GetInsiteVenueStatsbyPropertyId", "BookingDate", currency);
        break;
      case ReportType.adr:
        this._getReport("GetADRContent", currency);
        break;
      case ReportType.mcr:
        this._getReport("GetMCRContent", currency);
        break;
    }
  }

  onReportTypeChanged(selectedReport) {
    this.updateReport(selectedReport.value, this.selectedCurrency);
  }

  onCurrencyChanged(currency) {
    this.updateReport(this.selectedReport, currency.value);
  }
}
