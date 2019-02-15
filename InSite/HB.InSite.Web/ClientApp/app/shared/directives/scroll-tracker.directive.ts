import { Directive, EventEmitter, HostListener, Output } from "@angular/core";

@Directive({
  selector: "[appScrollTracker]"
})
export class ScrollTrackerDirective {
  @Output()
  scrollEnd = new EventEmitter<any>();
  @Output()
  scrolling = new EventEmitter<boolean>();
  @Output()
  scrollTop = new EventEmitter<number>();

  @HostListener("window:scroll", ["$event"])
  onScroll(event) {
    let tracker = event.target.scrollingElement ? event.target.scrollingElement : document.documentElement;
    let endReached = false;

    let limit = tracker.scrollHeight - tracker.clientHeight;
    // console.log(tracker.scrollHeight, tracker.clientHeight, limit, tracker.scrollTop);
    if (Math.round(tracker.scrollTop) === Math.round(limit) || limit < tracker.scrollTop) {
      endReached = true;
    } else {
      endReached = false;
    }

    if (tracker.scrollTop > tracker.scrollHeight / 4) {
      this.scrolling.emit(true);
    }

    this.scrollEnd.emit({
      pos: event.target.scrollTop,
      endReached
    });

    this.scrollTop.emit(tracker.scrollTop);
  }
}
