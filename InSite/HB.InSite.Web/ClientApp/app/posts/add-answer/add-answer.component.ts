import { select } from "@angular-redux/store";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChildren } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material";
import { Quill } from "quill";
import { Observable, of, Subject } from "rxjs";
import { debounceTime, distinctUntilChanged, map, switchMap, takeUntil } from "rxjs/operators";

import * as constants from "../../app.constants";
import { Answer } from "../../core/models/answer";
import { User } from "../../core/models/user";
import { IdentityActions } from "../../core/redux/actions/identity.actions";
import { AnswerService } from "../../core/services/answer.service";
import { PropertyService } from "../../core/services/property.service";
import { SnackbarService } from "../../core/services/snackbar.service";
import { BaseComponent } from "../../shared/base-component";
import { MatFileUpload } from "../../shared/mat-file-upload-module/matFileUploaders";
import { NativeScriptInterfaceService } from "../../shared/services/native-script-interface.service";

@Component({
  selector: "app-add-answer",
  templateUrl: "./add-answer.component.html",
  styleUrls: ["./add-answer.component.scss"]
})
export class AddAnswerComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _answer: Answer;
  private _attachments: any;
  private _postVenues: Array<any> = [];
  private _postLocations: Array<any> = [];
  private _postBrands: Array<any> = [];
  private _pointsEarned: number;
  private _editor: Quill;
  private _user: any;

  @select(["settings", "values"])
  private _settings$: Observable<Array<any>>;

  @select(["identity", "user"])
  private _user$: Observable<any>;
  // End of Private Fields

  // Public properties
  public answerForm: FormGroup;
  public isHybridApp: boolean;
  public maxNoFiles: number;
  public maxNoImages: number;
  public attachedImages: Array<any> = [];
  public attachedFiles: Array<any> = [];

  public maxFileLength: number;
  public uploadURL: string;
  public minExpirationDate: Date = new Date();

  public propertyControl: FormControl;
  public filteredProperties: Observable<any[]>;
  public selectedProperties: Array<any> = [];

  public propertyChainControl: FormControl;
  public filteredPropertyChains: Observable<any[]>;
  public selectedPropertyChains: Array<any> = [];

  public locationControl: FormControl;
  public filteredLocations: Observable<any[]>;
  public selectedLocations: Array<any> = [];

  public propertyChainLoader: boolean = false;
  public locationLoader: boolean = false;
  public propertyLoader: boolean = false;

  public properties: Array<any>;
  public propertyChains: Array<any>;
  public locations: Array<any>;

  public errorMaxLength: boolean = false;
  public isUploadInProgress: boolean;

  get attachments(): Array<any> {
    this._answer.attachments = this._answer.attachments ? this._answer.attachments : [];

    this._attachments = this._attachments ? this._attachments : this._answer.attachments;
    return this._attachments;
  }
  set attachments(value: Array<any>) {
    this._attachments = this._answer.attachments = value ? value : [];
  }

  @Input()
  postId: number;
  @Input()
  postVenues: Subject<Array<any>> = new Subject<Array<any>>();
  @Input()
  postBrands: Subject<Array<any>> = new Subject<Array<any>>();
  @Input()
  postLocations: Subject<Array<any>> = new Subject<Array<any>>();
  @Input()
  editingAnswer: Subject<Answer> = new Subject<Answer>();

  @select(["settings", "values"])
  settings$: Observable<Array<any>>;
  // End of Public properties

  // Public Output bindings
  @Output()
  onAnswerSave = new EventEmitter<Answer>();

  @Output()
  onEditCancel = new EventEmitter<boolean>();

  @Output()
  onEditorCreated = new EventEmitter<any>();
  // End of Public Output bindings

  // Public ViewChild bindings
  @ViewChildren(MatFileUpload)
  private _fileUploads: QueryList<MatFileUpload>;
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(
    private nsInterfaceService: NativeScriptInterfaceService,
    private _snackbarService: SnackbarService,
    private _fb: FormBuilder,
    private _propertyService: PropertyService,
    private _answerService: AnswerService,
    private _identityActions: IdentityActions
  ) {
    super();
    this._answer = new Answer();

    this.properties = [];
    this.propertyChains = [];
    this.locations = [];

    this.propertyControl = new FormControl();
    this.propertyChainControl = new FormControl();
    this.locationControl = new FormControl();
    this.isUploadInProgress = false;

    this.filteredProperties = this.propertyControl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(value => {
        const trimmedValue: string = value ? value.trim() : "";
        if (trimmedValue.length >= 3) {
          this.propertyLoader = true;
          return this._getPropertiesByName(value);
        } else {
          return of([]);
        }
      })
    );

    this.filteredLocations = this.locationControl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(value => {
        const trimmedValue: string = value ? value.trim() : "";
        if (trimmedValue.length >= 3) {
          this.locationLoader = true;
          return this._getLocationsByName(value);
        } else {
          return Observable.of([]);
        }
      })
    );

    this.filteredPropertyChains = this.propertyChainControl.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(value => {
        const trimmedValue: string = value ? value.trim() : "";
        if (trimmedValue.length >= 3) {
          this.propertyChainLoader = true;
          return this._getPropertyChainsByName(value);
        } else {
          return Observable.of([]);
        }
      })
    );
  }
  // End of constructor

  // Private methods
  private _setVenues() {
    if (this._answer.answerProperties) {
      this._answer.answerProperties.map(answerProperty => {
        const property = {
          propertyId: answerProperty.property.propertyId,
          propertyName: answerProperty.property.propertyName
        };
        this.selectedProperties.push(property);
      });
    }
  }

  private _setBrands() {
    if (this._answer.answerPropertyChains) {
      this._answer.answerPropertyChains.map(answerPropertyChain => {
        const propertyChain = {
          propertyChainID: answerPropertyChain.propertyChain.propertyChainID,
          propertyChainName: answerPropertyChain.propertyChain.propertyChainName
        };
        this.selectedPropertyChains.push(propertyChain);
      });
    }
  }
  private _setLocations() {
    if (this._answer.answerLocations) {
      this._answer.answerLocations.map(answerLocation => {
        const location = {
          id: answerLocation.location.id,
          name: answerLocation.location.name
        };
        this.selectedLocations.push(location);
      });
    }
  }

  private _getPropertyChainsByName(searchText: string) {
    return this._propertyService.getPropertyChainsByName(searchText).pipe(
      map(response => {
        const selectedPropertyChainIds = this.selectedPropertyChains.map(({ propertyChainID }) => propertyChainID);
        this.propertyChains = response
          .filter(propertyChain => selectedPropertyChainIds.indexOf(propertyChain.propertyChainID) === -1)
          .filter(
            //Filter the brands already exist in Question
            propertyChain => this._postBrands.indexOf(propertyChain.propertyChainID) === -1
          );
        this.propertyChainLoader = false;
        return this.propertyChains;
      })
    );
  }

  private _getLocationsByName(searchText: string) {
    return this._propertyService.getLocationsByName(searchText).pipe(
      map(response => {
        const selectedLocationIds = this.selectedLocations.map(({ id }) => id);
        this.locations = response
          .filter(location => selectedLocationIds.indexOf(location.id) === -1)
          .filter(
            //Filter the location already exist in Question
            location => this._postLocations.indexOf(location.id) === -1
          );
        this.locationLoader = false;
        return this.locations;
      })
    );
  }

  private _getPropertiesByName(searchText: string) {
    return this._propertyService.searchProperties(searchText).pipe(
      map(response => {
        const selectedPropertyIds = this.selectedProperties.map(({ propertyId }) => propertyId);
        this.properties = [];
        response.value.map(property => {
          if (
            selectedPropertyIds.indexOf(property.propertyID) === -1 &&
            this._postVenues.indexOf(property.propertyID) === -1
          ) {
            this.properties.push({
              propertyId: property.propertyID,
              propertyName: property.venue,
              propertyChainId: property.propertyChainId,
              propertyChainName: property.venueBrand,
              locationId: property.locationId,
              location: property.location,
              isInternalOnly: property.isInternalOnly
            });
          }
        });
        this.propertyLoader = false;
        return this.properties;
      })
    );
  }

  private _initForm() {
    this.isHybridApp = window["isHybridApp"];

    this.answerForm = this._fb.group({
      details: "",
      attachments: null,
      singleFile: null,
      imageFile: null,
      venue: "",
      location: "",
      brand: "",
      expirationDate: "",
      expirationReminder: false
    });

    this.answerForm.get("expirationReminder").setValue(false);
  }

  private _setValues() {
    if (this._answer.answerId) {
      this.answerForm.get("details").setValue(this._answer.answerDetails);

      this._answer.attachments.map(attachment => {
        if (attachment.isImage) {
          this.attachedImages.push(attachment);
        } else {
          this.attachedFiles.push(attachment);
        }
      });
      this._attachments = this._answer.attachments;

      this._setVenues();
      this._setBrands();
      this._setLocations();
    }
  }

  private _updateAnswerValues() {
    this._answer.answerDetails = this.answerForm.get("details").value;
    this._answer.answerSummary = "";
    this._answer.postId = this.postId;
  }

  private _addToSelectedProperty(property) {
    this.selectedProperties.push(property);
    this.selectedProperties.sort((a, b) => {
      return a.propertyName > b.propertyName ? 1 : -1;
    });

    if (this.selectedPropertyChains.findIndex(brand => brand.propertyChainID === property.propertyChainId) === -1) {
      const brand = {
        propertyChainID: property.propertyChainId,
        propertyChainName: property.propertyChainName
      };
      this.selectedPropertyChains.push(brand);
    }

    if (this.selectedLocations.findIndex(loc => loc.id === property.locationId) === -1 && property.locationId > 0) {
      const location = {
        id: property.locationId,
        name: property.location
      };
      this.selectedLocations.push(location);
    }
    this.propertyControl.reset();
    this.answerForm.markAsDirty();
  }

  private _saveAnswer(response: Observable<any>, id?: number) {
    response.pipe(takeUntil(this._destructor$)).subscribe(answer => {
      if (answer instanceof HttpErrorResponse) {
        this._snackbarService.error("Unable to save answer");
        this.answerForm.markAsDirty();
        return;
      } else {
        let msg = `Answer ${id ? "updated" : "added"} successfully  ${
          id ? "" : "- " + this._pointsEarned + " points earned."
        }`;

        if (!id) {
          let updatedUser: User = Object.assign({}, this._user);
          updatedUser.points = +updatedUser.points + +this._pointsEarned;

          this._identityActions.loadUserIdentity(updatedUser);
        }

        this._snackbarService.success(msg);
        this.onAnswerSave.emit(answer);
      }
      this.reset();
    });
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    this.editingAnswer.pipe(takeUntil(this._destructor$)).subscribe(answer => {
      this.reset();
      this._answer = Object.create(answer);
      this._setValues();
    });

    this.isHybridApp = window["isHybridApp"];
    this.uploadURL = constants.apiUrl + "FileUpload";

    this._settings$.pipe(takeUntil(this._destructor$)).subscribe(settings => {
      if (settings) {
        this.maxFileLength = settings.find(setting => setting.name.toLowerCase() === "uploadfilemaxsize").value;

        this.maxNoFiles = settings.find(setting => setting.name.toLowerCase() === "uploadfileselectionlimit").value;
        this.maxNoImages = settings.find(setting => setting.name.toLowerCase() === "uploadimageselectionlimit").value;

        this._pointsEarned = settings.find(setting => setting.name.toLowerCase() === "points:answer").value;
      }
    });

    this._initForm();
    this._user$.pipe(takeUntil(this._destructor$)).subscribe(u => (this._user = u));
  }

  public chooseFile(event) {
    this.nsInterfaceService.nsEventLister(
      { type: "selectedFile", object: this },
      function(that, file) {
        console.log("NS sent - selectedFile : " + JSON.stringify(file));
        that.attachments.push(file);
        that.addAttachment({ file: file }, that.attachments.length - 1);
        that._cdr.detectChanges();
      },
      function(error) {
        console.log("NS sent - selectedFile : Error:" + JSON.stringify(error));
      }
    );
    this.nsInterfaceService.nsEventEmitter({ type: "fileUpload" });
  }

  removeAttachment(event) {
    this.attachments = this.attachments.filter(attachment => attachment.fileIdentifier != event.file.fileIdentifier);
    this.answerForm.markAsDirty();
  }

  addAttachment(event, isImage: boolean) {
    event.file.isImage = isImage;
    if (event.file.fileIdentifier) {
      event.file.postId = null;
      event.file.answerId = this._answer.answerId ? this._answer.answerId : null;
      event.file.id = event.file.id ? event.file.id : 0;
      event.file.active = true;
      event.file.createdOn = event.file.createdOn ? event.file.createdOn : new Date();
      event.file.createdBy = event.file.createdBy ? event.file.createdBy : this._answer.createdBy;
      event.file.modifiedOn = event.file.modifiedOn ? event.file.modifiedOn : new Date();
      event.file.modifiedBy = event.file.modifiedBy ? event.file.modifiedBy : this._answer.modifiedBy;
    }

    this.attachments.push(event.file);
    this.isUploadInProgress = false;
    this.answerForm.markAsDirty();
  }

  onSubmit() {
    let pendingAttachments = this._fileUploads.filter(fileUpload => !fileUpload.isPreview);

    if (pendingAttachments.length > 0) {
      this._snackbarService.error("Please upload pending attachments");
      return;
    }

    if (!this.answerForm.valid || this.errorMaxLength) {
      this._snackbarService.error("Please fix the errors");
      return;
    }
    this.answerForm.markAsPristine();
    this._updateAnswerValues();
    this._answer.answerLocations = this.selectedLocations.map(({ id }) => id);
    this._answer.answerProperties = this.selectedProperties.map(({ propertyId }) => propertyId);
    this._answer.answerPropertyChains = this.selectedPropertyChains.map(({ propertyChainID }) => propertyChainID);

    this._answer.replies = [];
    this._answer.active = true;
    this._answer.archive = false;

    this._answer.attachments = this.attachments.filter(attachment => attachment.fileIdentifier !== "");

    if (this._answer.answerId) {
      this._saveAnswer(this._answerService.updateAnswer(this._answer), this._answer.answerId);
    } else {
      this._saveAnswer(this._answerService.createAnswer(this._answer));
    }
  }

  sendMail() {
    this.settings$.pipe(distinctUntilChanged()).subscribe(settings => {
      if (settings) {
        const address = settings.find(setting => setting.name === "MissingHotelEmail:Address").value;
        const subject = settings.find(setting => setting.name === "MissingHotelEmail:Subject").value;
        location.href = `mailto:${address}?subject=${subject}`;
      } else {
        location.href = "mailto:admin@hbinsite.com?subject=Missing hotel information";
      }
    });
  }

  propertySelected(selected: MatAutocompleteSelectedEvent) {
    const index = this.properties.findIndex(option => option.propertyId === selected.option.value);
    this.propertyControl.reset();
    this._addToSelectedProperty(this.properties[index]);
  }

  removeSelectedProperty(id: number) {
    const index = this.selectedProperties.findIndex(chip => chip.propertyId === id);
    this.selectedProperties.splice(index, 1);
    this.answerForm.markAsDirty();
  }

  locationSelected(selected: MatAutocompleteSelectedEvent) {
    const selectedIndex = this.locations.findIndex(location => location.id === selected.option.value);
    this.selectedLocations.push(this.locations[selectedIndex]);
    this.selectedLocations.sort((a, b) => (a.name > b.name ? 1 : -1));
    this.locationControl.reset();
    this.answerForm.markAsDirty();
  }

  removeSelectedLocation(id: number) {
    const index = this.selectedLocations.findIndex(chip => chip.id === id);
    this.selectedLocations.splice(index, 1);
    this.answerForm.markAsDirty();
  }

  propertyChainSelected(selected: MatAutocompleteSelectedEvent) {
    const index = this.propertyChains.findIndex(option => option.propertyChainID === selected.option.value);
    this.selectedPropertyChains.push(this.propertyChains[index]);
    this.selectedPropertyChains.sort((a, b) => (a.propertyChainName > b.propertyChainName ? 1 : -1));
    this.propertyChainControl.reset();
    this.answerForm.markAsDirty();
  }

  removeSelectedPropertyChain(id: number) {
    const index = this.selectedPropertyChains.findIndex(chip => chip.propertyChainID === id);
    this.selectedPropertyChains.splice(index, 1);
    this.answerForm.markAsDirty();
  }

  reset() {
    this.answerForm.reset();

    if (this._fileUploads) {
      this._fileUploads.map(fileUpload => {
        setTimeout(() => {
          fileUpload.remove(false);
        }, 100);
      });
    }
    this._answer.answerId = 0;
    this.selectedLocations = [];
    this.locationControl.reset();
    this.selectedProperties = [];
    this.propertyControl.reset();
    this.selectedPropertyChains = [];
    this.propertyChainControl.reset();
    this.answerForm.markAsPristine();
  }

  cancel() {
    this.reset();
    this.onEditCancel.emit(true);
  }

  setEditor(editor) {
    this._editor = editor;
    this.onEditorCreated.emit(editor);
  }

  contentChange(event) {
    this.errorMaxLength = event.editor.getLength() > 8000;
  }

  updateProgress(event) {
    this.isUploadInProgress = true;
  }
  // End of public methods
}
