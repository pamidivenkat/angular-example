import { HelpArea, HelpContent } from '../models/helparea';
import { AtlasApiRequestWithParams, AtlasApiResponse } from '../../shared/models/atlas-api-response';
import { type } from '../../shared/util';
import { Article } from '../models/article';
import { Action } from '@ngrx/store';
import * as Immutable from 'immutable';



export const ActionTypes = {
    LOAD_LATEST_RELEASES: type('[Help] load latest releases'),
    LOAD_LATEST_RELEASES_COMPLETE: type('[Help] load latest releases complete'),
    LOAD_SELECTED_ARTICLE_BODY: type('[Help] load selected article body'),
    LOAD_SELECTED_ARTICLE_BODY_COMPLETE: type('[Help] load selected article body complete'),
    LOAD_HELP_AREAS: type('[Help] load help areas info'),
    LOAD_HELP_AREAS_COMPLETE: type('[Help] load help areas info complete'),
    LOAD_HELP_AREAS_CONTENT: type('[Help] load help areas content'),
    LOAD_HELP_AREAS_CONTENT_COMPLETE: type('[Help] load help areas content complete'),
    LOAD_HELP_AREAS_CONTENT_BODY: type('[Help] load help areas content body'),
    LOAD_HELP_AREAS_CONTENT_BODY_COMPLETE: type('[Help] load help areas content body complete'),
    LOAD_HELP_AREAS_SEARCH_CONTENT: type('[Help] load help areas search content'),
    LOAD_HELP_AREAS_SEARCH_CONTENT_COMPLETE: type('[Help] load help areas search content complete'),
    LOAD_HELP_SEARCH_AREAS_CONTENT_BODY: type('[Help] load help search areas content body'),
    LOAD_HELP_SEARCH_AREAS_CONTENT_BODY_COMPLETE: type('[Help] load help search areas content body complete'),
    LOAD_ALL_HELP_CONTENTS: type('[Help] load all help contents'),
    LOAD_ALL_HELP_CONTENTS_COMPLETE: type('[Help] load all help contents complete'),
    ADD_HELP_CONTENT: type('[Help] add help content')
    , ADD_HELP_CONTENT_COMPLETE: type('[Help] add help content complete')
    , UPDATE_HELP_CONTENT: type('[Help] update help content')
    , UPDATE_HELP_CONTENT_COMPLETE: type('[Help] update help content complete')
    , REMOVE_HELP_CONTENT: type('[Help] remove help content')
    , REMOVE_HELP_CONTENT_COMPLETE: type('[Help] remove help content complete')
}
export class LoadLatestReleasesAction implements Action {
    type = ActionTypes.LOAD_LATEST_RELEASES;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadLatestReleasesCompleteAction implements Action {
    type = ActionTypes.LOAD_LATEST_RELEASES_COMPLETE;
    constructor(public payload: AtlasApiResponse<Article>) {
    }
}
export class LoadSelectedArticleBodyAction implements Action {
    type = ActionTypes.LOAD_SELECTED_ARTICLE_BODY;
    constructor(public payload: string) {
    }
}

export class LoadSelectedArticleBodyCompleteAction implements Action {
    type = ActionTypes.LOAD_SELECTED_ARTICLE_BODY_COMPLETE;
    constructor(public payload: Article) {
    }
}
export class LoadHelpAreasAction implements Action {
    type = ActionTypes.LOAD_HELP_AREAS;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}
export class LoadHelpAreasActionCompleteAction implements Action {
    type = ActionTypes.LOAD_HELP_AREAS_COMPLETE;
    constructor(public payload: Immutable.List<HelpArea>) {
    }
}

export class LoadHelpAreaContentsAction implements Action {
    type = ActionTypes.LOAD_HELP_AREAS_CONTENT
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}
export class LoadHelpAreasContentActionCompleteAction implements Action {
    type = ActionTypes.LOAD_HELP_AREAS_CONTENT_COMPLETE
    constructor(public payload: Immutable.List<HelpContent>) {
    }
}

export class LoadHelpAreaContentBodyAction implements Action {
    type = ActionTypes.LOAD_HELP_AREAS_CONTENT_BODY
    constructor(public payload: string) {
    }
}
export class LoadHelpAreasContentBodyCompleteAction implements Action {
    type = ActionTypes.LOAD_HELP_AREAS_CONTENT_BODY_COMPLETE
    constructor(public payload: HelpContent) {
    }
}
export class LoadHelpAreaSearchContentAction implements Action {
    type = ActionTypes.LOAD_HELP_AREAS_SEARCH_CONTENT
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}
export class LoadHelpAreasSearchContentCompleteAction implements Action {
    type = ActionTypes.LOAD_HELP_AREAS_SEARCH_CONTENT_COMPLETE
    constructor(public payload: Immutable.List<HelpContent>) {
    }
}
export class LoadHelpSearchAreaContentBodyAction implements Action {
    type = ActionTypes.LOAD_HELP_SEARCH_AREAS_CONTENT_BODY
    constructor(public payload: string) {
    }
}
export class LoadHelpSearchAreasContentBodyCompleteAction implements Action {
    type = ActionTypes.LOAD_HELP_SEARCH_AREAS_CONTENT_BODY_COMPLETE
    constructor(public payload: HelpContent) {
    }
}
export class LoadAllHelpContentsAction implements Action {
    type = ActionTypes.LOAD_ALL_HELP_CONTENTS;
    constructor(public payload: AtlasApiRequestWithParams) {
    }
}

export class LoadAllHelpContentsCompleteAction implements Action {
    type = ActionTypes.LOAD_ALL_HELP_CONTENTS_COMPLETE;
    constructor(public payload: AtlasApiResponse<HelpContent>) {
    }
}
export class AddHelpContentAction implements Action {
    type = ActionTypes.ADD_HELP_CONTENT;
    constructor(public payload: HelpContent) {
    }
}

export class AddHelpContentActionComplete implements Action {
    type = ActionTypes.ADD_HELP_CONTENT_COMPLETE;
    constructor(public payload: HelpContent) {
    }
}
export class UpdateHelpContentAction implements Action {
    type = ActionTypes.UPDATE_HELP_CONTENT;
    constructor(public payload: HelpContent) {
    }
}

export class UpdateHelpContentActionComplete implements Action {
    type = ActionTypes.UPDATE_HELP_CONTENT_COMPLETE;
    constructor(public payload: HelpContent) {
    }
}
export class RemoveHelpContentAction implements Action {
    type = ActionTypes.REMOVE_HELP_CONTENT;
    constructor(public payload: string) {
    }
}

export class RemoveHelpContentActionComplete implements Action {
    type = ActionTypes.REMOVE_HELP_CONTENT_COMPLETE;
    constructor(public payload: string) {
    }
}
