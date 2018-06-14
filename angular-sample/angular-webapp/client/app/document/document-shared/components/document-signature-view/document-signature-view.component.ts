import { Component, OnInit, ChangeDetectionStrategy, ViewEncapsulation, ChangeDetectorRef, Input, OnDestroy } from "@angular/core";
import { LocaleService, TranslationService } from "angular-l10n";
import { BaseComponent } from "../../../../shared/base-component";
import { DocumentSignatureDetails } from "../../models/document-signature.model";

@Component({
  selector: "document-signature-view",
  templateUrl: "./document-signature-view.component.html",
  styleUrls: ['./document-signature-view.component.scss'],  
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})

export class DocumentSignatureViewComponent extends BaseComponent implements OnInit, OnDestroy {

  private _documentSignatureDetails: DocumentSignatureDetails;

  /*constructor*/
  constructor(protected _localeService: LocaleService
    , protected _translationService: TranslationService
    , protected _changeDetectordRef: ChangeDetectorRef
  ) {
    super(_localeService, _translationService, _changeDetectordRef);
    this._documentSignatureDetails = new DocumentSignatureDetails();
  }
  /*end of constructor*/

  /*input properties*/
  @Input('documentSignatureDetails')
  set documentSignatureDetails(value: DocumentSignatureDetails) {
    this._documentSignatureDetails = value;
  }
  get documentSignatureDetails() {
    return this._documentSignatureDetails;
  }
  /* end of input properties*/

  ngOnInit() {

  }
}
