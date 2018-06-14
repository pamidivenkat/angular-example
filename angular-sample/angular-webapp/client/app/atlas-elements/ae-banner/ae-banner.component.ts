import { ChangeDetectionStrategy, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { BaseElement } from '../common/base-element';
import { AeBannerTheme } from '../common/ae-banner-theme.enum';

/**
 * Atlas Banner Component that represents a banner with banner title and banner image. 
 * This component can display list of items with icons, below to banner title.
 * 
 * @export
 * @class AeBannerComponent
 * @extends {BaseElement}
 */
@Component({
  selector: 'ae-banner',
  templateUrl: './ae-banner.component.html',
  styleUrls: ['./ae-banner.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class AeBannerComponent extends BaseElement {
  // Private Fields
  private _titleText: string = "Title Text";
  private _imageText: string = "";
  private _bannerTheme: AeBannerTheme = AeBannerTheme.Default;
  private _backgroundImage: string;
  // End of Private Fields

  // Public Properties
  /**
   * Holds banner title text.
   * 
   * get/setter property
   * 
   * @memberOf AeBannerComponent
   */
  @Input('titleText')
  get titleText() {
    return this._titleText;
  }
  set titleText(val: string) {
    this._titleText = val;
  }
  /**
   * Holds banner theme name, to apply different set of background and text color for banner.
   * 
   * get/setter property
   * 
   * @memberOf AeBannerComponent
   */
  @Input('bannerTheme')
  get bannerTheme() {
    return this._bannerTheme;
  }
  set bannerTheme(val: AeBannerTheme) {
    this._bannerTheme = val;
  }
  /**
   * Holds background image url for the banner.
   * 
   * get/setter property
   * 
   * @memberOf AeBannerComponent
   */
  @Input('backgroundImage')
  get backgroundImage() {
    return this._backgroundImage;
  }
  set backgroundImage(val: string) {
    this._backgroundImage = val;
  }
  /**
   * Holds banner image text.
   * 
   * get/setter property
   * 
   * @memberOf AeBannerComponent
   */
  @Input('imageText')
  get imageText() {
    return this._imageText;
  }
  set imageText(val: string) {
    this._imageText = val;
  }
  // End of Public Properties

  // Private Methods
  /**
   * Used to return the background image url, for the banner.
   * 
   * method
   * 
   * @memberOf AeBannerComponent
   */
  getBackgroundImageUrl(): string {
    return "url(" + this._backgroundImage + ")";
  }
  /**
   * Used to return flag whether banner theme is black or not.
   * 
   * method
   * 
   * @memberOf AeBannerComponent
   */
  isBannerThemeBlack(): boolean {
    return this._bannerTheme == AeBannerTheme.Black;
  }
  /**
   * Used to return flag whether banner theme is blue or not.
   * 
   * method
   * 
   * @memberOf AeBannerComponent
   */
  isBannerThemeBlue(): boolean {
    return this._bannerTheme == AeBannerTheme.Blue;
  }
  /**
   * Used to return flag whether banner theme is gray or not.
   * 
   * method
   * 
   * @memberOf AeBannerComponent
   */
  isBannerThemeGray(): boolean {
    return this._bannerTheme == AeBannerTheme.Gray;
  }
  /**
   * Used to return flag whether banner theme is green or not.
   * 
   * method
   * 
   * @memberOf AeBannerComponent
   */
  isBannerThemeGreen(): boolean {
    return this._bannerTheme == AeBannerTheme.Green;
  }
  /**
   * Used to return flag whether banner theme is pink or not.
   * 
   * method
   * 
   * @memberOf AeBannerComponent
   */
  isBannerThemePink(): boolean {
    return this._bannerTheme == AeBannerTheme.Pink;
  }
  /**
   * Used to return flag whether banner theme is default or not.
   * 
   * method
   * 
   * @memberOf AeBannerComponent
   */
  isBannerThemeDefault(): boolean {
    return this._bannerTheme == AeBannerTheme.Default;
  }
  // End of Private Methods

}