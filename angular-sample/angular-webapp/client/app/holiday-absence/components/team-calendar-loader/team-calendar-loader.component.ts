import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject } from "rxjs/Rx";

@Component({
  selector: 'team-calendar-loader',
  templateUrl: './team-calendar-loader.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./team-calendar-loader.component.scss']
})
export class TeamCalendarLoaderComponent implements OnInit {

  private _isLoaded$: BehaviorSubject<boolean>;
  private _isLoaded: boolean = false;
 
  @Input('isLoaded')
  set isLoaded(val: BehaviorSubject<boolean>) {
    this._isLoaded$ = val;
  }
  get isLoaded() {
    return this._isLoaded$;
  }
  
  constructor(private _router: Router,
    private _route: ActivatedRoute) { }

  ngOnInit() {
    this._isLoaded$
      .subscribe(x => {
        this._isLoaded = x;
        if (this._isLoaded) {
          this._loadCalendar();
        } 
      });
  }


  private _loadCalendar(): void {
    this._router.navigate([('teamcalendar')], { relativeTo: this._route, skipLocationChange: true });
  }

}
