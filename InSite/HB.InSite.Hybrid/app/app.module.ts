import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { TNSFontIconModule } from 'nativescript-ngx-fonticon';
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptUISideDrawerModule } from "nativescript-ui-sidedrawer/angular";

import { AppRoutingModule } from "./app.routing";
import { AppComponent } from "./app.component";

import { MainViewComponent } from "./main/main-view.component";
import { ChooseFile } from "~/choosefile/choose_file.component";
import { AppHeaderComponent } from "~/layout/header/app-header.component";
import { HBSearchBarComponent } from "~/layout/search/hb-search-bar.component";
import { StoreModule } from '@ngrx/store';
import { reducers } from './core/redux';
import { WebViewService } from '~/core/web-view/webview.service';
import { NavigationDrawerComponent } from '~/layout/navigation-drawer/navigation-drawer.component';
import { FirebaseRemoteNotifications } from "~/app.notifications";

// Uncomment and add to NgModule imports if you need to use two-way binding
// import { NativeScriptFormsModule } from "nativescript-angular/forms";

// Uncomment and add to NgModule imports  if you need to use the HTTP wrapper
// import { NativeScriptHttpModule } from "nativescript-angular/http";

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        NativeScriptCommonModule,
        NativeScriptUISideDrawerModule,
        AppRoutingModule,
        TNSFontIconModule.forRoot({
            'fa': './fonts/font-awesome.css',
            'mdi': './fonts/material-design-icons.css'
        }),
        StoreModule.forRoot(reducers)
    ],
    declarations: [
        AppComponent,
        NavigationDrawerComponent,
        ChooseFile,
        AppHeaderComponent,
        HBSearchBarComponent,
        MainViewComponent
    ],
    entryComponents: [],
    providers: [
        WebViewService,
        FirebaseRemoteNotifications
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
/*
Pass your application module to the bootstrapModule function located in main.ts to start your app
*/
export class AppModule {
}
