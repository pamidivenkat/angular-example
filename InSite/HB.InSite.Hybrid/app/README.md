# HB.InSite.Hybrid

This repo serves as the starting point for NativeScript’s [Angular Getting Started Guide](https://docs.nativescript.org/angular/tutorial/ng-chapter-0).

Please file any issues with this template on the [NativeScript/docs repository](https://github.com/nativescript/docs), which is where the tutorial content lives.

### Tips
 
In your views, do not use self-closing XML like <Label [text]="binding" />. Instead close all elements with a discrete closing tag: <Label [text]="binding"></Label> 

If you're planning to add NativeScript to an existing Angular "web" codebase, keep in mind window does not exist in NativeScript, therefore ensure to remove any explicit dependencies on the browser's global window object in your code.

Learn from the nativescript-angular project examples on the NativeScript Angular examples repository

Instead of using Angular's `ROUTER_PROVIDERS` and `ROUTER_DIRECTIVES`, use these:

import {NS_ROUTER_PROVIDERS, NS_ROUTER_DIRECTIVES} from 'nativescript-angular/router';
 

Tricks
