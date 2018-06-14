import { HelpSearchContentComponent } from './components/help-search-content/help-search-content.component';
import {
    WhatsNewLatestReleasesComponent
} from './components/whats-new-latest-releases/whats-new-latest-releases.component';
import { HelpContainerComponent } from './containers/help-container/help-container.component';
import { AuthGuard } from '../shared/security/auth.guard';
import { Routes } from '@angular/router';
import { ManageHelpContentComponent } from "./components/manage-help-content/manage-help-content.component";
import { WhatsNewArticleDetailsComponent } from "./components/whats-new-article-details/whats-new-article-details.component";


export const routes: Routes = [
    {
        path: '', component: HelpContainerComponent, canActivate: [AuthGuard], resolve: {}

    }
    , { path: 'latest-releases', component: WhatsNewLatestReleasesComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Latest releases' } }
    , { path: 'search-help-content/:searchKey', component: HelpSearchContentComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Help - Search results' } }
    , { path: 'managehelpcontent', component: ManageHelpContentComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Help content - Manage' } }
    , { path: 'article-details/:id', component: WhatsNewArticleDetailsComponent, canActivate: [AuthGuard], data: { preload: false, title: 'Help article - Details' } }


];