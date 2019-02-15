import { select } from "@angular-redux/store";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { FlatTreeControl } from "@angular/cdk/tree";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material";
import { Observable, of } from "rxjs";
import { distinctUntilChanged, filter } from "rxjs/operators";

import { FolderFlatNode, FolderNode } from "../../core/models/folder";
import { BookmarkService } from "../../core/services/bookmark.service";
import { MatTreeService } from "../../core/services/mat-tree.service";

export const RATING_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ViewFoldersComponent),
  multi: true
};

@Component({
  selector: "app-view-folders",
  templateUrl: "./view-folders.component.html",
  styleUrls: ["./view-folders.component.scss"],
  animations: [
    trigger("fade", [
      state("void", style({ height: 0, opacity: 0 })),
      transition("void => *", [animate(".2s ease-in")]),

      transition("* => void", [animate(".2s ease-out")])
    ])
  ]
})
export class ViewFoldersComponent implements OnInit, ControlValueAccessor {
  // Private Fields
  private _selectedFolder: FolderFlatNode;
  private _showFolders: boolean = false;
  private _rootFolder: FolderFlatNode;

  flatNodeMap: Map<FolderNode, FolderFlatNode> = new Map<FolderNode, FolderFlatNode>();

  // End of Private Fields

  // Public properties
  treeControl: FlatTreeControl<FolderFlatNode>;
  treeFlattener: MatTreeFlattener<FolderNode, FolderFlatNode>;
  dataSource: MatTreeFlatDataSource<FolderNode, FolderFlatNode>;

  @Input("showFolders")
  set showFolders(value: boolean) {
    this._showFolders = value;
  }
  get showFolders(): boolean {
    return this._showFolders;
  }

  @select(["identity", "userFolders"])
  private _folders$: Observable<any>;

  set selectedFolder(value: FolderFlatNode) {
    this._selectedFolder = value;
    this._propagateChange(value);
    this._propagateTouch(value);
  }
  get selectedFolder(): FolderFlatNode {
    return this._selectedFolder;
  }
  // End of Public properties

  // Public Output bindings
  @Output() onFolderSelected = new EventEmitter<FolderFlatNode>();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(private _matTreeService: MatTreeService, private _bookmarkService: BookmarkService) {
    this._folders$
      .pipe(
        distinctUntilChanged(),
        filter(folders => !(folders instanceof HttpErrorResponse))
      )
      .subscribe(folders => {
        if (folders) {
          this._matTreeService.initialize(folders);
        }
      });

    this.treeFlattener = new MatTreeFlattener(this._transformer, this._getLevel, this._isExpandable, this._getChildren);

    this.treeControl = new FlatTreeControl<FolderFlatNode>(this._getLevel, this._isExpandable);

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    this._matTreeService.dataChange.subscribe(data => {
      this.dataSource.data = data;
      const node = data.find(f => f.id === 0);
      this._selectedFolder = this._rootFolder = this.flatNodeMap.get(node);
    });
  }
  // End of constructor

  // Private methods
  private _propagateChange = (_: any) => {};
  private _propagateTouch = (_: any) => {};

  writeValue(obj) {
    this._selectedFolder = obj;
  }

  registerOnChange(fn: any): void {
    this._propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._propagateTouch = fn;
  }

  private _getLevel = (node: FolderFlatNode) => node.level;

  private _isExpandable = (node: FolderFlatNode) => node.expandable;

  private _getChildren = (node: FolderNode): Observable<Array<FolderNode>> => of(node.children);

  private _transformer = (node: FolderNode, level: number) => {
    let folderFlatNode: FolderFlatNode = new FolderFlatNode();
    folderFlatNode.expandable = !!node.children;
    folderFlatNode.folderName = node.folderName;
    folderFlatNode.level = level;
    folderFlatNode.id = node.id;
    this.flatNodeMap.set(node, folderFlatNode);
    return folderFlatNode;
  };

  private _searchTree(node, id) {
    let result = null;
    if (node.id == id) {
      return node;
    } else if (node.children != null) {
      for (let i = 0; result == null && i < node.children.length; i++) {
        result = this._searchTree(node.children[i], id);
      }
      return result;
    }
    return result;
  }
  // End of private methods

  // Public methods
  ngOnInit() {
    if (this._bookmarkService.selectedFolderId) {
      let node = this._searchTree(this.dataSource.data[0], this._bookmarkService.selectedFolderId);
      if (node) {
        this.selectFolder(this.flatNodeMap.get(node));
      }
    }
  }

  hasChild = (_: number, _nodeData: FolderFlatNode) => {
    return _nodeData.expandable;
  };

  selectFolder(node: FolderFlatNode) {
    this._selectedFolder = this._selectedFolder.id === node.id ? this._rootFolder : node;
    this.onFolderSelected.emit(this._selectedFolder);
  }
  // End of public methods
}
