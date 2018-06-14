import { TranslationModule } from 'angular-l10n';
import { ScrollIntoViewDirective } from './directives/scroll-into-view-directive';
import { AeAsyncPipe } from './ae-async/ae-async.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreInjectorComponent } from './testing/mocks/components/store-injector/store-injector.component';


const sharedModules: any[] = [
    ScrollIntoViewDirective
    ,TranslationModule
];
 


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    AeAsyncPipe
    , ScrollIntoViewDirective, StoreInjectorComponent
  ],
  exports: [sharedModules],
  providers: []
})
export class AtlasSharedModule { }
