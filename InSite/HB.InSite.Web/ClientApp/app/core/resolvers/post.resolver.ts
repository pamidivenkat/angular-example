import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot
} from "@angular/router";
import { Observable } from "rxjs";

import { PostService } from "./../services/post.service";

@Injectable()
export class PostResolver implements Resolve<any> {
  constructor(private _postService: PostService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> {
    const id = +route.paramMap.get("id");
    return this._postService.getPostById(id, true);
  }
}
