import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AeDraggableDirective } from './ae-draggable/ae-draggable.directive';
import { AeDroppableDirective } from './ae-droppable/ae-droppable.directive';
import { AeDragDropService } from './services/ae-drag-drop.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    AeDraggableDirective
    , AeDroppableDirective
  ],
  exports: [
    AeDraggableDirective
    , AeDroppableDirective
  ],
  providers: [AeDragDropService]
})
export class AeDragDropModule { }
