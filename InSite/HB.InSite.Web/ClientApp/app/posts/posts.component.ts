import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Post } from '../core/models/post';
import { PostService } from '../core/services/post.service';
import { BaseComponent } from '../shared/base-component';

@Component({
  selector: "app-posts",
  templateUrl: "./posts.component.html",
  styleUrls: ["./posts.component.scss"]
})
export class PostsComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _dataLoading: boolean = false;
  private _maxId: number;
  // End of Private Fields

  // Public properties
  @Input() posts: Array<Post>;
  @Input() showPosts: boolean;
  public hasPosts: Observable<boolean>;

  get dataLoading(): boolean {
    return this._dataLoading;
  }
  // End of Public properties

  // Public Output bindings
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(private _postService: PostService) {
    super();
  }
  // End of constructor

  // Private methods
  // End of private methods

  // Public methods
  ngOnInit() {}
  // End of public methods
}
