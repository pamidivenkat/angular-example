import { dispatch } from "@angular-redux/store";
import { Injectable } from "@angular/core";
import { FluxStandardAction } from "flux-standard-action";

import { ILayoutState } from "../reducers/layout.reducer";

// Flux-standard-action gives us stronger typing of our actions.
type Payload = ILayoutState;

export type LayoutAction = FluxStandardAction<Payload>;

const LAYOUT_PREFIX = "[LAYOUT] ";

@Injectable()
export class LayoutActions {
  static readonly LAYOUT_INITIALIZE = `${LAYOUT_PREFIX}INITIALIZE`;
  static readonly LAYOUT_TOGGLE_MENU = `${LAYOUT_PREFIX}TOGGLE_MENU`;
  static readonly LAYOUT_TOGGLE_SIDENAV = `${LAYOUT_PREFIX}TOGGLE_SIDENAV`;
  static readonly LAYOUT_TOGGLE_MOBILE = `${LAYOUT_PREFIX}TOGGLE_MOBILE`;
  static readonly LAYOUT_SCROLL_END = `${LAYOUT_PREFIX}SCROLL_END`;
  static readonly LAYOUT_MIN_HEIGHT = `${LAYOUT_PREFIX}MIN_HEIGHT`;
  static readonly LAYOUT_HEADER_DISPLAY = `${LAYOUT_PREFIX}HEADER_DISPLAY`;

  @dispatch()
  public initLayout = (isMobile: boolean): LayoutAction => ({
    type: LayoutActions.LAYOUT_INITIALIZE,
    meta: null,
    payload: { isMobile }
  });

  @dispatch()
  public toggleMenu = (isOpen: boolean = null): LayoutAction => ({
    type: LayoutActions.LAYOUT_TOGGLE_MENU,
    meta: null,
    payload: isOpen !== null ? { menu: { isOpen } } : null
  });

  @dispatch()
  public toggleSideNav = (isOpen: boolean = null): LayoutAction => ({
    type: LayoutActions.LAYOUT_TOGGLE_SIDENAV,
    meta: null,
    payload: isOpen !== null ? { side: { isOpen } } : null
  });

  @dispatch()
  public toggleMobile = (isMobile: boolean = null): LayoutAction => ({
    type: LayoutActions.LAYOUT_TOGGLE_MOBILE,
    meta: null,
    payload: isMobile !== null ? { isMobile } : null
  });

  @dispatch()
  public updateScrollEnd = (isScrollEnd: boolean = null): LayoutAction => ({
    type: LayoutActions.LAYOUT_SCROLL_END,
    meta: null,
    payload: isScrollEnd !== null ? { isScrollEnd } : null
  });

    @dispatch()
    public setHeaderDisplay = (showHeader: boolean = true): LayoutAction => ({
        type: LayoutActions.LAYOUT_HEADER_DISPLAY,
        meta: null,
        payload: { showHeader }
    });

  @dispatch()
  public minHeight = (minHeight: string): LayoutAction => ({
    type: LayoutActions.LAYOUT_MIN_HEIGHT,
    meta: null,
    payload: {
      minHeight: minHeight
    }
  });
}
