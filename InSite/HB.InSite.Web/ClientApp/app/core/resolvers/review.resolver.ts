import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from "@angular/router";
import { Observable } from "rxjs";

import { ReviewService } from "./../services/review.service";

@Injectable()
export class ReviewResolver implements Resolve<any> {
  constructor(private _reviewService: ReviewService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> {
      const id = +route.paramMap.get("id");
      return this._reviewService.getReviewById(id, true);
  }
}
