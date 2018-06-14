import { Article } from '../models/article';
import { Action } from "@ngrx/store";
import * as helpActions from '../actions/help.actions';
import { Observable } from "rxjs/Observable";
import * as Immutable from 'immutable';
import { PagingInfo } from "../../atlas-elements/common/models/ae-paging-info";
import { isNullOrUndefined } from "util";
import { HelpContent, HelpArea } from "../models/helpArea";
import { DataTableOptions } from "../../atlas-elements/common/models/ae-datatable-options";
import { extractDataTableOptions } from "../../shared/helpers/extract-helpers";

export interface HelpState {
    Status: boolean;
    Articles: Immutable.List<Article>;
    SelectedArticle: Article
    SelectedArticleLoading: boolean;
    ArticlesPagingInfo: PagingInfo;
    HelpAreas: Immutable.List<HelpArea>,
    HelpContent: Immutable.List<HelpContent>,
    HelpSearchContent: Immutable.List<HelpContent>,
    HelpSearchContentPagingInfo: PagingInfo;
    HelpAreaLoaded: boolean,
    HelpContentLoaded: boolean,
    HelpContentBodyLoaded: boolean
    AllHelpContents: Immutable.List<HelpContent>;
    AllHelpContentsPagingInfo: PagingInfo;
    AllHelpContentsLoaded: boolean;
    HelpSearchContentLoading: boolean;
}

const initialState = {
    Status: false,
    Articles: null,
    SelectedArticle: null,
    SelectedArticleLoading: false,
    ArticlesPagingInfo: null,
    HelpSearchContentPagingInfo: null,
    HelpAreas: null,
    HelpContent: null,
    HelpSearchContent: null,
    HelpAreaLoaded: false,
    HelpContentLoaded: false,
    HelpContentBodyLoaded: false,
    AllHelpContents: null,
    AllHelpContentsPagingInfo: null,
    AllHelpContentsLoaded: false,
    HelpSearchContentLoading: false
}
export function HelpReducer(state = initialState, action: Action): HelpState {
    switch (action.type) {
        case helpActions.ActionTypes.LOAD_LATEST_RELEASES:
            {
                return Object.assign({}, state, { Articles: null });
            }
        case helpActions.ActionTypes.LOAD_LATEST_RELEASES_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, { Status: true, Articles: Immutable.List<Article>(action.payload.Entities) });

                if (!isNullOrUndefined(state.ArticlesPagingInfo)) {
                    if (action.payload.PagingInfo.PageNumber == 1) {
                        modifiedState.ArticlesPagingInfo.TotalCount = action.payload.PagingInfo.TotalCount;

                    }
                    modifiedState.ArticlesPagingInfo.PageNumber = action.payload.PagingInfo.PageNumber;
                    modifiedState.ArticlesPagingInfo.Count = action.payload.PagingInfo.Count;
                }
                else {
                    modifiedState.ArticlesPagingInfo = action.payload.PagingInfo;
                }
                return modifiedState;


            }
        case helpActions.ActionTypes.LOAD_ALL_HELP_CONTENTS:
            {
                return Object.assign({}, state, { AllHelpContentsLoaded: false });
            }
        case helpActions.ActionTypes.LOAD_ALL_HELP_CONTENTS_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, { AllHelpContentsLoaded: true, AllHelpContents: Immutable.List<HelpContent>(action.payload.Entities) });
                if (!isNullOrUndefined(state.AllHelpContentsPagingInfo)) {
                    if (action.payload.PagingInfo.PageNumber == 1) {
                        modifiedState.AllHelpContentsPagingInfo.TotalCount = action.payload.PagingInfo.TotalCount;

                    }
                    modifiedState.AllHelpContentsPagingInfo.PageNumber = action.payload.PagingInfo.PageNumber;
                    modifiedState.AllHelpContentsPagingInfo.Count = action.payload.PagingInfo.Count;
                }
                else {
                    modifiedState.AllHelpContentsPagingInfo = action.payload.PagingInfo;
                }
                return modifiedState;

            }
        case helpActions.ActionTypes.LOAD_SELECTED_ARTICLE_BODY:
            {
                return Object.assign({}, state, { SelectedArticle: null, SelectedArticleLoading: true });
            }

        case helpActions.ActionTypes.LOAD_SELECTED_ARTICLE_BODY_COMPLETE:
            {
                let modifiedState = Object.assign({}, state);
                modifiedState.SelectedArticle = action.payload
                modifiedState.SelectedArticleLoading = false
                return Object.assign({}, modifiedState);
            }
        case helpActions.ActionTypes.LOAD_HELP_AREAS:
            {
                return Object.assign({}, state, { HelpAreaLoaded: false });
            }
        case helpActions.ActionTypes.LOAD_HELP_AREAS_COMPLETE:
            {
                return Object.assign({}, state, { HelpAreaLoaded: true, HelpAreas: Immutable.List<HelpArea>(action.payload.Entities), });
            }
        case helpActions.ActionTypes.LOAD_HELP_AREAS_CONTENT:
            {
                return Object.assign({}, state, { HelpContentLoaded: false });
            }
        case helpActions.ActionTypes.LOAD_HELP_AREAS_CONTENT_COMPLETE:
            {
                return Object.assign({}, state, { HelpContentLoaded: true, HelpContent: Immutable.List<HelpContent>(action.payload.Entities) });
            }
        case helpActions.ActionTypes.LOAD_HELP_AREAS_CONTENT_BODY:
            {
                return Object.assign({}, state, { HelpContentBodyLoaded: false });
            }
        case helpActions.ActionTypes.LOAD_HELP_AREAS_CONTENT_BODY_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, { HelpContentBodyLoaded: true });
                let selectedHelpContentIndex: number;
                if (!isNullOrUndefined(action.payload)) {
                    selectedHelpContentIndex = modifiedState.HelpContent.findIndex(s => s.Id == action.payload.Id);
                    modifiedState.HelpContent = modifiedState.HelpContent.update(selectedHelpContentIndex, value => value = action.payload);
                }
                return modifiedState;
            }
        case helpActions.ActionTypes.LOAD_HELP_AREAS_SEARCH_CONTENT:
            {
                return Object.assign({}, state, { HelpSearchContentLoading: true, HelpSearchContent: Immutable.List([]) });
            }
        case helpActions.ActionTypes.LOAD_HELP_AREAS_SEARCH_CONTENT_COMPLETE:
            {

                let modifiedState = Object.assign({}, state, { HelpSearchContentLoading: false, HelpSearchContent: Immutable.List<HelpContent>(action.payload.Entities) });

                if (!isNullOrUndefined(state.HelpSearchContentPagingInfo)) {
                    if (action.payload.PagingInfo.PageNumber == 1) {
                        modifiedState.HelpSearchContentPagingInfo.TotalCount = action.payload.PagingInfo.TotalCount;

                    }
                    modifiedState.HelpSearchContentPagingInfo.PageNumber = action.payload.PagingInfo.PageNumber;
                    modifiedState.HelpSearchContentPagingInfo.Count = action.payload.PagingInfo.Count;
                }
                else {
                    modifiedState.HelpSearchContentPagingInfo = action.payload.PagingInfo;
                }
                return modifiedState;
            }
        case helpActions.ActionTypes.LOAD_HELP_SEARCH_AREAS_CONTENT_BODY:
            {
                return Object.assign({}, state);
            }
        case helpActions.ActionTypes.LOAD_HELP_SEARCH_AREAS_CONTENT_BODY_COMPLETE:
            {
                let modifiedState = Object.assign({}, state);
                let selectedHelpContentIndex: number;
                if (!isNullOrUndefined(action.payload)) {
                    selectedHelpContentIndex = modifiedState.HelpSearchContent.findIndex(s => s.Id == action.payload.Id);
                    if (selectedHelpContentIndex !== -1) {
                        modifiedState.HelpSearchContent = modifiedState.HelpSearchContent.update(selectedHelpContentIndex, value => value = action.payload);
                    }

                }
                return Object.assign({}, modifiedState);

            }
        case helpActions.ActionTypes.ADD_HELP_CONTENT:
            {
                return Object.assign({}, state);
            }
        case helpActions.ActionTypes.ADD_HELP_CONTENT_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                if (!isNullOrUndefined(modifiedState.AllHelpContents)) {
                    modifiedState.AllHelpContents = modifiedState.AllHelpContents.push(action.payload);
                }
                else {
                    let helpcontent = new Array<HelpContent>();
                    helpcontent.push(action.payload);
                    modifiedState.AllHelpContents = Immutable.List<HelpContent>(helpcontent);
                }

                return Object.assign({}, modifiedState);
            }
        case helpActions.ActionTypes.UPDATE_HELP_CONTENT:
            {
                return Object.assign({}, state);
            }
        case helpActions.ActionTypes.UPDATE_HELP_CONTENT_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                let id = action.payload.Id;
                let selectedhelpcontent = modifiedState.AllHelpContents;
                let index = selectedhelpcontent.findIndex(s => s.Id === id);
                if (index !== -1) {
                    modifiedState.AllHelpContents = modifiedState.AllHelpContents.update(index, value => value = action.payload);

                }
                return Object.assign({}, modifiedState);
            }
        case helpActions.ActionTypes.REMOVE_HELP_CONTENT:
            {
                return Object.assign({}, state);
            }
        case helpActions.ActionTypes.REMOVE_HELP_CONTENT_COMPLETE:
            {
                let modifiedState = Object.assign({}, state, {});
                let id = action.payload;
                let selectedhelpcontent = modifiedState.AllHelpContents;
                let index = selectedhelpcontent.findIndex(s => s.Id === id);
                if (index !== -1) {
                    modifiedState.AllHelpContents = Immutable.List<HelpContent>(modifiedState.AllHelpContents.splice(index, 1));
                }
                return Object.assign({}, modifiedState);
            }



        default:
            return state;
    }
}

export function getWhatsNewLatestReleases(state$: Observable<HelpState>): Observable<Immutable.List<Article>> {
    return state$.select(state => state.Articles);
}
export function getWhatsNewLatestReleasesCount(state$: Observable<HelpState>): Observable<number> {
    return state$.select(state => !isNullOrUndefined(state.ArticlesPagingInfo) ? state.ArticlesPagingInfo.TotalCount : 10);
}
export function getHelpAreas(state$: Observable<HelpState>): Observable<Immutable.List<HelpArea>> {
    return state$.select(state => state.HelpAreas);
}
export function getHelpContent(state$: Observable<HelpState>): Observable<Immutable.List<HelpContent>> {
    return state$.select(state => state.HelpContent);
}

export function getHelpAreasProgressStatus(state$: Observable<HelpState>): Observable<boolean> {
    return state$.select(state => state.HelpAreaLoaded);
}
export function getHelpContentProgressStatus(state$: Observable<HelpState>): Observable<boolean> {
    return state$.select(state => state.HelpContentLoaded);
}
export function getHelpContentBodyProgressStatus(state$: Observable<HelpState>): Observable<boolean> {
    return state$.select(state => state.HelpContentBodyLoaded);
}
export function getHelpSearchContent(state$: Observable<HelpState>): Observable<Immutable.List<HelpContent>> {
    return state$.select(state => state.HelpSearchContent);
}
export function getHelpSearchContentCount(state$: Observable<HelpState>): Observable<number> {
    return state$.select(state => !isNullOrUndefined(state.HelpSearchContentPagingInfo) ? state.HelpSearchContentPagingInfo.TotalCount : 10);
}
export function getAllHelpContents(state$: Observable<HelpState>): Observable<Immutable.List<HelpContent>> {
    return state$.select(state => state.AllHelpContents);
}
export function getAllHelpContentsCount(state$: Observable<HelpState>): Observable<number> {
    return state$.select(state => !isNullOrUndefined(state.AllHelpContentsPagingInfo) ? state.AllHelpContentsPagingInfo.TotalCount : 10);
}
export function getAllHelpContentsTableOptions(state$: Observable<HelpState>): Observable<DataTableOptions> {
    return state$.select(state => state && state.AllHelpContentsPagingInfo && extractDataTableOptions(state.AllHelpContentsPagingInfo));
}
export function getAllHelpContentsLoadStatus(state$: Observable<HelpState>): Observable<boolean> {
    return state$.select(s => s.AllHelpContentsLoaded);
};
export function getCurrentWhatsNewLatestReleases(state$: Observable<HelpState>): Observable<Article> {
    return state$.select(state => state.SelectedArticle);
}
export function getSelectedArticleLoadingStatus(state$: Observable<HelpState>): Observable<boolean> {
    return state$.select(s => s && s.SelectedArticleLoading);
}

export function getHelpSearchContentLoadingStatus(state$: Observable<HelpState>): Observable<boolean> {
    return state$.select(s => s && s.HelpSearchContentLoading);
}
