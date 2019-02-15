declare var java: any;
declare var CACurrentMediaTime: any;
declare var  window: any;
// Patch to make redux load
declare var global:any;
global.process = { env: {} };

let anyGlobal = <any>global;

if (!anyGlobal.timers) {
    anyGlobal.timers = new Map();
}

function time() {
    if (anyGlobal.android) {
        return java.lang.System.nanoTime() / 1000000; // 1 ms = 1000000 ns
    } else {
        return CACurrentMediaTime() * 1000;
    }
}

let timerEntry = {
    totalTime: 0,
    count: 0,
    currentStart: time()
};

anyGlobal.timers.set("application-start", timerEntry);

// this import should be first in order to load some required settings (like globals and reflect-metadata)
import { platformNativeScriptDynamic } from "nativescript-angular/platform";
import { AppModule } from "./app.module";

// A traditional NativeScript application starts by initializing global objects, setting up global CSS rules, creating, and navigating to the main page. 
// Angular applications need to take care of their own initialization: modules, components, directives, routes, DI providers. 
// A NativeScript Angular app needs to make both paradigms work together, so we provide a wrapper platform object, platformNativeScriptDynamic, 
// that sets up a NativeScript application and can bootstrap the Angular framework.
platformNativeScriptDynamic().bootstrapModule(AppModule);

