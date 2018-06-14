import { Observable, Subscription } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { PasswordResetConfimration } from '../../../shared/actions/user.actions';
import { Store } from '@ngrx/store';
import { AeClassStyle } from '../../../atlas-elements/common/ae-class-style.enum';
import { CookieService } from 'ngx-cookie';
import { StorageService } from '../../../shared/services/storage.service';
import { AuthorizationService } from '../../../shared/security/authorization.service';
import { StringHelper } from '../../../shared/helpers/string-helper';
import { NavigationExtras, Router } from '@angular/router';
import { isNullOrUndefined } from 'util';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  OnDestroy
} from '@angular/core';
import { ClaimsHelperService } from '../../../shared/helpers/claims-helper';
import { BaseComponent } from "./../../../shared/base-component";
import { LocaleService, TranslationService } from "angular-l10n";
import { AeImageAvatarSize } from "./../../../atlas-elements/common/ae-image-avatar-size.enum";
import * as fromConstants from './../../../shared/app.constants';
import * as fromRoot from '../../../shared/reducers/index';

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ProfileComponent extends BaseComponent implements OnInit, OnDestroy {
  // Private Fields
  private _userFullName: string;
  private _userCompName: string;
  private _empImageUrl: string;
  private _menuOpen: boolean = false;
  private _showPasswordUpdateForm: boolean = false;
  private _resetPasswordSuccessPopup: boolean = false;
  private _lightClass: AeClassStyle = AeClassStyle.Light;
  private _userFullName$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private _updatedUserFullNameSubscription: Subscription;
  // End of Private Fields

  // Public Properties
  get userFullName$(): BehaviorSubject<string> {
    return this._userFullName$;
  }

  get showPasswordUpdateForm(): boolean{
    return this._showPasswordUpdateForm;
  }

  get empImageUrl(){
    return this._empImageUrl;
  }
  set empImageUrl(val){
    this._empImageUrl=val;
  }

  get userFullName(){
    return this._userFullName;
  }

  get userCompName(){
    return this._userCompName;
  }
  set userCompName(val){
    this._userCompName=val;
  }
  /**
    * Trigger click event on profile section
    * 
    * @type {EventEmitter<any>}
    * @memberOf ProfileComponent
    */
  @Output()
  aeClick: EventEmitter<any> = new EventEmitter<any>();
  // Public Properties

  // Constructor
  constructor(protected _localeService: LocaleService, protected _translationService: TranslationService, protected _cdRef: ChangeDetectorRef,
    private _claimsHelper: ClaimsHelperService, private _router: Router, private _elementRef: ElementRef
    , private _authService: AuthorizationService
    , private _storageService: StorageService
    , private _cookieService: CookieService
    , private _store: Store<fromRoot.State>) {
    super(_localeService, _translationService, _cdRef);

    var fullName = _claimsHelper.getUserFullName();
    this._userFullName$.next(fullName);
    this._userCompName = _claimsHelper.getCompanyName();
    this._empImageUrl = _claimsHelper.getEmpPictureUrl();
    if (isNullOrUndefined(fullName)) {
      fullName = '';
    }

    this._userFullName = fullName;
  }
  // End of constructor

  // Private methods
  /**
  * Used to return user full name
  * 
  * method
  * 
  * @memberOf GreetingComponent
  */
  getUserFullName(): string {
    return this._userFullName;
  }

  changeUserPassword() {
    this._showPasswordUpdateForm = true;
  }


  onChangePasswordCancel(event: any) {
    this._showPasswordUpdateForm = event;

  }

  get resetPasswordSuccessPopup(): boolean {
    return this._resetPasswordSuccessPopup;
  }

  get lightClass(): AeClassStyle {
    return this._lightClass;
  }

  getSlideoutState(): string {
    return this._showPasswordUpdateForm ? 'expanded' : 'collapsed';
  }

  showChangePasswordSlider(): boolean {
    return this._showPasswordUpdateForm;
  }
  onResetPasswordSuccess(event: any) {
    this._resetPasswordSuccessPopup = event;
    this._showPasswordUpdateForm = false;
  }

  modalClosed() {
    this._resetPasswordSuccessPopup = false;
    this._store.dispatch(new PasswordResetConfimration());
  }

  onRelogin(e) {
    this._resetPasswordSuccessPopup = false;
    this.logout();
  }
  /**
  * Used to return company name
  * 
  * method
  * 
  * @memberOf GreetingComponent
  */
  getCompanyName(): string {
    return this._userCompName;
  }
  /**
  * Used to return profile image avatar size
  * 
  * method
  * 
  * @memberOf GreetingComponent
  */
  getImageSize(): AeImageAvatarSize {
    return AeImageAvatarSize.small;
  }
  /**
  * Used to return profile image url
  * 
  * method
  * 
  * @memberOf GreetingComponent
  */
  getProfileImageUrl(): string {
    //TODO:Need to replace this with image download handler
    if (isNullOrUndefined(this._empImageUrl)) {
      return fromConstants.defaultImage;
    }
    else {
      return `/filedownload?documentId=${this._empImageUrl}`;//replace with image handler code.
    }
  }
  /**
   * Used to handle profile link click event to navigate to employee profile page
   * 
   * method
   * 
   * @memberOf GreetingComponent
   */
  gotoEmpProfile(e) {
    if (!StringHelper.isNullOrUndefinedOrEmpty(this._claimsHelper.getEmpId())) {
      this._router.navigate(['/employee/personal']);
    }
  }

  // Private Methods
  _onClick(event: MouseEvent) {
    this._menuOpen = !this._menuOpen;
    this.aeClick.emit(event);
  }

  /**
   * Logout
   * 
   * @private
   * 
   * @memberOf ProfileComponent
   */
  logout() {
    this._storageService.remove('identity');
    this._cookieService.remove('token');
    this._authService.SignOut();
  }

  /**
  * Used to return 'person__dropdown--open' class for profile
  * 
  * method
  * 
  * @memberOf ProfileComponent
  */
  getStyle(): string {
    if (this._menuOpen) {
      return "person__dropdown--open";
    }
  }

  // End of private methods

  // Public methods
  ngOnInit(): void {
    this._updatedUserFullNameSubscription = this._store.let(fromRoot.getUserFullNameData).subscribe((val) => {
      if (val) {
        this._userFullName$.next(val);
      }
    });
  }

  ngOnDestroy(): void {
    if (this._updatedUserFullNameSubscription) {
      this._updatedUserFullNameSubscription.unsubscribe();
    }
  }

  isGroupServiceOwner(): boolean {
    return this._claimsHelper.canAccessGroupCompanies();
  }

  hasEmployeeAccount():boolean{
    return !StringHelper.isNullOrUndefinedOrEmpty(this._claimsHelper.getEmpId());
  }
  isHSConsultant(): boolean {
    return this._claimsHelper.isHSConsultant();
  }

  accessOSV() {
    return fromConstants.offlineAppUrl + '/#/sitevisit/launch';
  }
  
  resetOSVPIN() {
    return fromConstants.v1AppUrl + '/#/createPin';
  }
  
  // End of public methods
  @HostListener('document:click', ['$event'])
  public onClick(event: MouseEvent) {
    let clickedThis = this._elementRef.nativeElement.contains(event.target);
    if (!clickedThis) {
      this._menuOpen = false;
    }
  }
}
