import { NgModule } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { Routes } from "@angular/router";

import { MainViewComponent } from "./main/main-view.component";

const routes: Routes = [
    { path: "", redirectTo: "/mainview", pathMatch: "full" },
    { path: "mainview", component: MainViewComponent }
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }