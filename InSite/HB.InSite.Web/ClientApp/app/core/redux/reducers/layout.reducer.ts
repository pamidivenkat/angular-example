import { Action } from "redux";

import { LayoutAction, LayoutActions } from "../actions/layout.actions";

interface ISidebars {
    mode?: "over" | "side" | "push";
    isOpen?: boolean;
}

export interface ILayoutState {
    loaded?: boolean;
    menu?: ISidebars;
    side?: ISidebars;
    showHeader?: boolean;
    isMobile?: boolean;

    isScrollEnd?: boolean;
    minHeight?: string;
}

export const INITIAL_STATE: ILayoutState = {
    loaded: false,
    menu: {
        mode: "side",
        isOpen: true
    },
    side: {
        mode: "side",
        isOpen: true
    },
    isMobile: false,
    isScrollEnd: false,
    minHeight: "",
    showHeader: true
};

function isMobileStateToggle(
    isMobile: boolean,
    state: ILayoutState
): ILayoutState {
    const newState: ILayoutState = {
        ...state,
        isMobile
    };
    if (isMobile) {
        if (!state.isMobile) {
            newState.menu.isOpen = false;
            newState.menu.mode = "over";
            newState.side.mode = "push";
            newState.side.isOpen = false;
        }
    } else {
        newState.menu.isOpen = true;
        newState.menu.mode = "side";
        newState.side.mode = "side";
        newState.side.isOpen = true;
    }
    return newState;
}

function toggleNav(isMenu: boolean, payload, state): ILayoutState {
    const prop = isMenu ? "menu" : "side";
    const newState: ILayoutState = { ...state };

    newState[prop].isOpen = payload ? payload[prop].isOpen : !state[prop].isOpen;
    return newState;
}

function updateScroll(payload, state): ILayoutState {
    const newState: ILayoutState = { ...state };
    newState["isScrollEnd"] = payload.isScrollEnd;
    return newState;
}

// A higher-order reducer: accepts an animal type and returns a reducer
// that only responds to actions for that particular animal type.
export function layoutReducer(
    state: ILayoutState = INITIAL_STATE,
    a: Action
): ILayoutState {
    const action = a as LayoutAction;
    switch (action.type) {
        case LayoutActions.LAYOUT_INITIALIZE:
            return {
                ...isMobileStateToggle(action.payload.isMobile, state),
                loaded: true
            };
        case LayoutActions.LAYOUT_TOGGLE_MENU:
            return toggleNav(true, action.payload, state);
        case LayoutActions.LAYOUT_HEADER_DISPLAY:
            return {
                ...state,
                ...action.payload
            };
        case LayoutActions.LAYOUT_TOGGLE_SIDENAV:
            return toggleNav(false, action.payload, state);
        case LayoutActions.LAYOUT_TOGGLE_MOBILE:
            return isMobileStateToggle(
                action.payload ? action.payload.isMobile : !state.isMobile,
                state
            );
        case LayoutActions.LAYOUT_SCROLL_END:
            return updateScroll(action.payload, state);
        case LayoutActions.LAYOUT_MIN_HEIGHT:
            return {
                ...state,
                ...action.payload
            };
    }

    return state;
}
