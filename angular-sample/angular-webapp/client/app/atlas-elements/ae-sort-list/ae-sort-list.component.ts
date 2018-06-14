import { AeListComponent } from '../ae-list/ae-list.component';
import { StringHelper } from '../../shared/helpers/string-helper';
import { BaseElement } from '../common/base-element';
import { BaseElementGeneric } from '../common/base-element-generic';
import { AeListItem } from '../common/models/ae-list-item';
import { ChangeDetectorRef, ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, OnChanges, Renderer2, ElementRef } from '@angular/core';
import { DragulaService } from 'ng2-dragula/ng2-dragula';
import { DragulaModule } from 'ng2-dragula/ng2-dragula';
import * as Immutable from 'immutable';

/**
 * Atlas List Component that displays provided items in a list manner. 
 * 
 * @export
 * @class AeSortListComponent
 * @extends {AeListComponent}
 */
@Component({
  selector: 'ae-sort-list',
  templateUrl: './ae-sort-list.component.html',
  styleUrls: ['./ae-sort-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeSortListComponent extends AeListComponent {

  constructor(public cdr: ChangeDetectorRef
    , private dragulaService: DragulaService
    , public eleRef: ElementRef
    , public renderer: Renderer2) {
    super(cdr, eleRef, renderer);
    dragulaService.drop.subscribe(value => this.onDrop(value));
    dragulaService.setOptions('bag-one', {
      invalid: () => false,
      accepts: (el, target, source, sibling) => el.classList.contains('sort-item'),
      direction: 'vertical'
    })
  }


  onDrop(value: any) {
    // do something
    //HACK to update the order index of the item and supply fresh list to the component
    const [bagName, e, el] = value;
    let movedFromOrderIndex = e.dataset.orderindex;
    let dropedItem = (value[2].querySelectorAll('.gu-transit')[0]);
    let droppeditemModifiedOrderIndex: number;
    let droppeditemOriginalOrderIndex: number;
    droppeditemOriginalOrderIndex = dropedItem.dataset.orderindex;
    value[2].querySelectorAll('.sort-item').forEach((elm, index) => {
      if (elm.dataset.orderindex == movedFromOrderIndex) {
        droppeditemModifiedOrderIndex = index;
      }
    });
    //increase the order index for the items which are > movedFromOrderIndex < droppeditemOrderIndex to one
    //decrease the order index for the items which are > droppeditemOrderIndex and < array size
    var mmutableArray = this.items.toArray();
    mmutableArray.forEach((item, index) => {
      if (droppeditemModifiedOrderIndex > movedFromOrderIndex) {
        //Moving item from top to bottom
        if (item.OrderIndex > movedFromOrderIndex && item.OrderIndex <= droppeditemModifiedOrderIndex) {
          item.OrderIndex = item.OrderIndex - 1;
        }
        else if (item.OrderIndex > droppeditemModifiedOrderIndex && item.OrderIndex <= mmutableArray.length - 1) {
          item.OrderIndex = item.OrderIndex + 1;
        }
        else if (item.OrderIndex == droppeditemOriginalOrderIndex) {
          //Now set the droppeditemOrderIndex to the item which is dropped at the index of 
          item.OrderIndex = droppeditemModifiedOrderIndex;
        }
        else {
          //here do nothing
        }
      }
      if (droppeditemModifiedOrderIndex < movedFromOrderIndex) {
        //Moving item from bottom to top
        if (item.OrderIndex == droppeditemOriginalOrderIndex) {
          //Now set the droppeditemOrderIndex to the item which is dropped at the index of 
          item.OrderIndex = droppeditemModifiedOrderIndex;
        }
        else if (item.OrderIndex >= droppeditemModifiedOrderIndex && item.OrderIndex <= mmutableArray.length - 1) {
          item.OrderIndex = item.OrderIndex + 1;
        }
        else {
          //DO nothing
        }
      }
    });
    mmutableArray.sort(function (l, r) {
      return l.OrderIndex - r.OrderIndex;
    }
    );
    //After sorting update the OrderIndex with the arrayIndex
    mmutableArray.forEach((item, index) => {
      item.OrderIndex = index;
    })

    this.items = Immutable.List<AeListItem>(mmutableArray);
    this.cdr.markForCheck();
    this.onAeItemsReOrdered.emit({ reOrdereditems: this.items });
  }

  ngOnChanges() {
  }
  /**
  * Informs the component when the action link is clicked.
  * 
  * @type {EventEmitter<any>}
  * @memberOf AeSortListComponent
  */
  @Output() onAeItemRemove: EventEmitter<any> = new EventEmitter<any>();

  /**
    * Informs the component when the action link is clicked.
    * 
    * @type {EventEmitter<any>}
    * @memberOf AeSortListComponent
    */
  @Output() onAeItemsReOrdered: EventEmitter<any> = new EventEmitter<any>();



  /** This method gets called when user clicks on action link.
   * 
   * 
   * @param {any} item 
   * @param {any} e 
   * 
   * @memberOf AeSortListComponent
   */
  onAeRemove(item: AeListItem, e: any) {
    this.items = this.items.remove(item.OrderIndex);
    this.cdr.markForCheck();
    this.onAeItemRemove.emit({ itemsAfterRemoval: this.items, removedItem: item, event: e });
  }

}
