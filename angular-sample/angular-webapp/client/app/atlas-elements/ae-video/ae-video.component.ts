import { AtlasError } from '../../shared/error-handling/atlas-error';
import { AeVideoStyleMode } from '../common/ae-videostyle-mode';
import { AeVideoPlayMode } from '../common/ae-videoplay-mode';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ModalDialogSize } from '../common/modal-dialog-size.enum';
import { StringHelper } from '../../shared/helpers/string-helper';
import { BaseElement } from '../common/base-element';
import { AeIconSize } from '../common/ae-icon-size.enum';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'ae-video',
  templateUrl: './ae-video.component.html',
  styleUrls: ['./ae-video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeVideoComponent extends BaseElement implements OnInit {

  /** Private variable declarations - start. */
  private _thumbnailSrc: string;
  private _altText: string;
  private _videoSrc: string;
  private _autoplay: boolean = true;
  private _width: number = 640;
  private _height: number = 390;
  private _trustedUrl: SafeResourceUrl;
  private _playMode: AeVideoPlayMode = AeVideoPlayMode.Popup;
  private _videoStyle: AeVideoStyleMode = AeVideoStyleMode.Thumbnail;
  private _linkText: string;
  private _videoId: string;
  /** Private variable declarations - end. */


  /** Public variable declaration - start   */
  get width(): number{
    return this._width;
  }

  get height(): number{
    return this._height;
  }
  public iconSize: AeIconSize = AeIconSize.big;
  public modalSize: ModalDialogSize = ModalDialogSize.default;
  public showDialog: boolean = false;
  /** Public variable declaration - end   */
  
  /** Input parameters of AeVideoComponent - start*/
  /**
   * To determine video need to play automatically or it needs user action.
   * 
   * @type: boolean
   * get/set property
   * 
   * @memberOf AeVideoComponent
   */
  @Input()
  get autoplay() {
    return this._autoplay;
  }
  set autoplay(val: boolean) {
    this._autoplay = StringHelper.coerceBooleanProperty(val);
  }

  /**
   * displays alternative text when provided thumnail image is broken/not available.
   * 
   * @type :string
   * get/set property
   * 
   * @memberOf AeVideoComponent
   */
  @Input('alt')
  get altText() {
    return !StringHelper.isNullOrUndefinedOrEmpty(this._altText) ? this._altText : null;
  }
  set altText(val: string) {
    this._altText = val;
  }

  /**
   * to display the thumbnail image refers to preview of a video
   * It displays provided thumbnail image, if thumnail image is not provided
   * then it will extract thumbnail image from supplied video. 
   * 
   * @type: string
   * get/set property
   * 
   * @memberOf AeVideoComponent
   */
  @Input()
  get thumbnailSrc() {
    return !StringHelper.isNullOrUndefinedOrEmpty(this._thumbnailSrc) ? this._thumbnailSrc : null;
  }
  set thumbnailSrc(val: string) {
    this._thumbnailSrc = val;
  }

  /**
   * url of video that it supposed to play.
   * 
   * @type: string
   * get/set property
   * 
   * @memberOf AeVideoComponent
   */
  @Input('src')
  get videoSrc() {
    return !StringHelper.isNullOrUndefinedOrEmpty(this._videoSrc) ?
      this._autoplay ? `${this._videoSrc}?autoplay=1` : this._videoSrc
      : null;
  }
  set videoSrc(val: string) {
    this._videoSrc = val;
  }

  /**
   * Determines whether to open the video player in popup or in new tab.
   * AeVideoPlayMode.Popup - opens video player in popup
   * AeVideoPlayMode.Fullscreen - opens in new tab
   * 
   * @type AeVideoPlayMode
   * 
   * @memberOf AeVideoComponent
   */
  @Input('mode')
  get playMode() {
    return this._playMode;
  }
  set playMode(val: AeVideoPlayMode) {
    this._playMode = val;
  }

  /**
   * Determines whether to show thumnail image with play button or anchor link with provided link text.
   * AeVideoStyleMode.Thumbnail - shows thumbnail image with play icon.
   * AeVideoStyleMode.Link - shows anchor link with supplied link text.
   * 
   * @type AeVideoStyleMode
   * 
   * @memberOf AeVideoComponent
   */
  @Input()
  get videoStyle() {
    return this._videoStyle;
  }
  set videoStyle(val: AeVideoStyleMode) {
    this._videoStyle = val;
  }

  /**
   * it displays as text when when AeVideoStyleMode is AeVideoStyleMode.Link
   * 
   * @type string
   * get/set property
   * 
   * @memberOf AeVideoComponent
   */
  @Input()
  get linkText() {
    return !StringHelper.isNullOrUndefinedOrEmpty(this._linkText) ? this._linkText : null;
  }
  set linkText(val: string) {
    this._linkText = val;
  }


  /** generates id/name for play icon.
   * 
   * 
   * @type: string
   * get property
   * 
   * @memberOf AeVideoComponent
   */
  get iconId(){
    return `${this.id}_playicon`;
  }

  /**
   * Trusted version of supplied of video url.
   * 
   * @type SafeResourceUrl
   * get/set property
   * @memberOf AeVideoComponent
   */
  get trustedUrl() {
    return this._trustedUrl;
  }
  set trustedUrl(val: SafeResourceUrl) {
    this._trustedUrl = val;
  }
  /** Input parameters of AeVideoComponent - end*/  

  /** Output parameters of AeVideoComponent - start*/
  /**
   * Emitter which is used to emit the model close event.
   * 
   * @type {EventEmitter<any>}
   * @memberOf AeVideoComponent
   */
  @Output() aeClose: EventEmitter<any> = new EventEmitter<any>();
  /** Output parameters of AeVideoComponent - end*/  

  /**
   * Creates an instance of AeVideoComponent.
   * @param {DomSanitizer} sanitizer 
   * 
   * @memberOf AeVideoComponent
   */
  constructor(private sanitizer: DomSanitizer) { super(); }  

  /** Private methods implementation - Start */
  /**
   *  Determines current video style is AeVideoStyleMode.Link or not
   * 
   * @private
   * @returns {boolean} 
   * 
   * @memberOf AeVideoComponent
   */
  isLinkStyle():boolean {
    return this.videoStyle == AeVideoStyleMode.Link;
  }
  
  /**
   *  Determines current video style is AeVideoStyleMode.Thumbnail or not
   * 
   * @private
   * @returns {boolean} 
   * 
   * @memberOf AeVideoComponent
   */
  isThumbnailStyle():boolean {
    return this.videoStyle == AeVideoStyleMode.Thumbnail;
  }

  /**
   * Utility method which checks part of string is available in main string or not.
   * 
   * @private
   * @param {string} str 
   * @param {string} substr 
   * @returns 
   * 
   * @memberOf AeVideoComponent
   */
  contains(str: string, substr: string) {
    return (str.indexOf(substr) > -1);
  }

  /**
   * To get the video id from supplied video url
   * 
   * @private
   * @param {string} url 
   * @returns string
   * 
   * @memberOf AeVideoComponent
   */
  private getIdFromURL(url: string) {
    let youtubeRegexp = /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*?[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/ig;
    let id = url.replace(youtubeRegexp, '$1');
    if (this.contains(id, ';')) {
      let pieces = id.split(';');
      if (this.contains(pieces[1], '%')) {
        let uriComponent = decodeURIComponent(id.split(';')[1]);
        id = ('http://youtube.com' + uriComponent)
          .replace(youtubeRegexp, '$1');
      } else {
        id = pieces[0];
      }
    } else if (this.contains(id, '#')) {
      id = id.split('#')[0];
    }
    return id;
  }
  /** Private methods implementation - End */

  /** Public methods implementation - Start*/
  /**
   * Video Component initializations goes here.   
   * 
   * 
   * @memberOf AeVideoComponent
   */
  ngOnInit() {
    super.ngOnInit();
    // video url is required to play the video.
    if (!this.videoSrc)
      throw new AtlasError("video url is required");
    
    // converting plain url to trusted url, to avoid the XSS attacks.
    this.trustedUrl = !StringHelper.isNullOrUndefinedOrEmpty(this.videoSrc) ? this.sanitizer.bypassSecurityTrustResourceUrl(this.videoSrc) : null;

    // if thumbnail image is not supplied, get the thumbnail image from supplied video url. 
    if (this.videoStyle == AeVideoStyleMode.Thumbnail && !this.thumbnailSrc) {
      this._videoId = this.getIdFromURL(this.videoSrc);
      if (!StringHelper.isNullOrUndefinedOrEmpty(this._videoId)) {
        this.thumbnailSrc = `http://img.youtube.com/vi/${this._videoId}/0.jpg`;
      }
    }

    if(this.videoStyle == AeVideoStyleMode.Link && !this.linkText){
      this.linkText=this._videoSrc;
    }
  }

  /**
   * Opens the video player in popup/newtab.
   * Triggers when user clicks on link text or play button on thumbnail image.
   * 
   * @param {any} e 
   * @returns 
   * 
   * @memberOf AeVideoComponent
   */
  openVideoModal(e) {
    if (!this.videoSrc) return;
    if (this.playMode == AeVideoPlayMode.Popup)
      this.showDialog = true;
    else if (this.playMode == AeVideoPlayMode.Fullscreen){
      window.open(this.videoSrc, '_blank');
    }
  }

  /**
   * Emits callback when user closes the popup modal where youtube video is used to play.
   * 
   * @param {any} e 
   * 
   * @memberOf AeVideoComponent
   */
  modalClosed(e) {
    this.showDialog = false;
    this.aeClose.emit({ event: e });
  }
  /** Public methods implementation - End*/
}
