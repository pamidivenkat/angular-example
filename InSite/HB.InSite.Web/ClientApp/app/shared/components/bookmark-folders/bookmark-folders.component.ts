import { select } from "@angular-redux/store";
import { SelectionModel } from "@angular/cdk/collections";
import { FlatTreeControl } from "@angular/cdk/tree";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatDialog, MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material";
import { Observable, of } from "rxjs";
import { distinctUntilChanged, filter, switchMap, takeUntil } from "rxjs/operators";

import { Bookmark, Folder } from "../../../core/models/bookmark";
import { User } from "../../../core/models/user";
import { IdentityActions } from "../../../core/redux/actions/identity.actions";
import { BookmarkService } from "../../../core/services/bookmark.service";
import { SnackbarService } from "../../../core/services/snackbar.service";
import { BaseComponent } from "../../base-component";
import { ModelDialogComponent } from "../model-dialog/model-dialog.component";
import { FolderFlatNode, FolderNode } from "./../../../core/models/folder";
import { MatTreeService } from "./../../../core/services/mat-tree.service";

@Component({
  selector: "app-bookmark-folders",
  templateUrl: "./bookmark-folders.component.html",
  styleUrls: ["./bookmark-folders.component.scss"]
})
export class BookmarkFoldersComponent extends BaseComponent implements OnInit {
  // Private Fields
  private _multiple: boolean = false;
  private _savePending: boolean = false;
  private _user: User;
  private _manageFolders: boolean = false;
  private _folders: Array<Folder> = [];
  private _bookmarks: Array<Bookmark> = [];

  @select(["identity", "user"])
  private _user$: Observable<User>;

  @select(["identity", "bookmarks"])
  private _bookmarks$: Observable<any>;

  @select(["layout", "isMobile"])
  private _isMobile$: Observable<boolean>;

  // End of Private Fields

  // Public properties
  @Input("multiple")
  set multiple(value: boolean) {
    this._multiple = value;
  }
  get multiple(): boolean {
    return this._multiple;
  }

  @Input("folders")
  set folders(value: Array<Folder>) {
    this._folders = value;
  }
  get folders(): Array<Folder> {
    return this._folders;
  }

  @Input("manageFolders")
  set manageFolders(value: boolean) {
    this._manageFolders = value;
  }
  get manageFolders(): boolean {
    return this._manageFolders;
  }

  isMobile: boolean;

  newParentNode: boolean = false;
  editing: boolean = false;
  editingNode: FolderFlatNode = new FolderFlatNode();

  flatNodeMap: Map<FolderFlatNode, FolderNode> = new Map<FolderFlatNode, FolderNode>();
  nestedNodeMap: Map<FolderNode, FolderFlatNode> = new Map<FolderNode, FolderFlatNode>();

  selectedParent: FolderFlatNode | null = null;
  newItemName: string = "";
  treeControl: FlatTreeControl<FolderFlatNode>;
  treeFlattener: MatTreeFlattener<FolderNode, FolderFlatNode>;
  dataSource: MatTreeFlatDataSource<FolderNode, FolderFlatNode>;

  //TODO: Move to constants or settings.
  maxLevels: number = 3;

  checklistFolder = new SelectionModel<FolderFlatNode>(this._multiple);
  // End of Public properties

  // Public Output bindings
  @Output()
  onSelectedFolder = new EventEmitter<any>();
  // End of Public Output bindings

  // Public ViewChild bindings
  // End of Public ViewChild bindings

  // Public ContentChild bindings
  // End of Public ContentChild bindings

  // Constructor
  constructor(
    private _matTreeService: MatTreeService,
    private _bookmarkService: BookmarkService,
    private _snackbar: SnackbarService,
    private _dialog: MatDialog,
    private _identityActions: IdentityActions
  ) {
    super();
    this._user$.pipe(takeUntil(this._destructor$)).subscribe(user => (this._user = user));
    this._bookmarks$
      .pipe(
        distinctUntilChanged(),
        filter(bookmarks => !(bookmarks instanceof HttpErrorResponse))
      )
      .subscribe(bookmarks => {
        if (bookmarks) {
          this._bookmarks = bookmarks;
        }
      });

    this._isMobile$.pipe(distinctUntilChanged()).subscribe(value => {
      this.isMobile = value ? true : false;
    });
  }
  // End of constructor

  // Private methods
  private _getLevel = (node: FolderFlatNode) => {
    return node.level;
  };

  private _isExpandable = (node: FolderFlatNode) => {
    return node.expandable;
  };

  private _getChildren = (node: FolderNode): Observable<FolderNode[]> => {
    return of(node.children);
  };

  private _transformer = (node: FolderNode, level: number) => {
    let flatNode =
      this.nestedNodeMap.has(node) && this.nestedNodeMap.get(node)!.folderName === node.folderName
        ? this.nestedNodeMap.get(node)!
        : new FolderFlatNode();
    flatNode.folderName = node.folderName;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    flatNode.id = node.id;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  private _bookmarksCount(node: FolderFlatNode): number {
    let count: number = this._bookmarks.filter(b => b.folderId === node.id).length;

    this.treeControl.getDescendants(node).forEach(folder => {
      count += this._bookmarks.filter(b => b.folderId === folder.id).length;
    });

    return count;
  }

  private _remove(node: FolderFlatNode, isParent: boolean = false) {
    let bookmarksCount = this._bookmarksCount(node);

    let msg = `Are you sure you want to delete this folder, its subfolders, and bookmarks?`;
    msg += bookmarksCount > 0 ? ` Deleting ${bookmarksCount} item(s)` : "";

    let dialogRef = this._dialog.open(ModelDialogComponent, {
      width: "500px",
      maxHeight: "500px",
      data: {
        name: msg,
        okName: "Remove",
        type: "bookmark"
      }
    });

    dialogRef
      .afterClosed()
      .pipe(
        distinctUntilChanged(),
        filter(response => response),
        switchMap(() => {
          return this._bookmarkService.deleteFolder(node.id).pipe(takeUntil(this._destructor$));
        })
      )
      .subscribe(response => {
        if (response instanceof HttpErrorResponse) {
          this._snackbar.error(response.error);
        } else {
          this._snackbar.success(`${node.folderName} removed`);
          const flatNode = this.flatNodeMap.get(node);
          if (isParent) {
            this._matTreeService.removeParentItem(flatNode);
          } else {
            this._matTreeService.removeItem(flatNode);
          }
          this._identityActions.userFoldersInit(this._user.id);
        }
      });
  }
  // End of private methods

  // Public methods

  ngOnInit() {
    this._matTreeService.initialize(this._folders);

    this.treeFlattener = new MatTreeFlattener(this._transformer, this._getLevel, this._isExpandable, this._getChildren);
    this.treeControl = new FlatTreeControl<FolderFlatNode>(this._getLevel, this._isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    this._matTreeService.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
  }

  addNewFolder(node: FolderFlatNode) {
    if (this._savePending) {
      return;
    }
    const parentNode = this.flatNodeMap.get(node);
    this._matTreeService.insertItem(parentNode!, "");
    this.treeControl.expand(node);

    node.expandable = !!parentNode.children;
    this._savePending = true;
  }

  saveNode(node: FolderFlatNode, name: string) {
    const nestedNode = this.flatNodeMap.get(node);

    this._bookmarkService
      .createFolder(name, nestedNode.parentId)
      .pipe(takeUntil(this._destructor$))
      .subscribe(response => {
        this._savePending = false;
        nestedNode.id = response.id;

        this._matTreeService.updateItem(nestedNode!, name);
        this._identityActions.userFoldersLoad(this._folders, this._user.id);
      });
  }

  removeNode(node: FolderFlatNode) {
    const flatNode = this.flatNodeMap.get(node);
    this._matTreeService.removeItem(flatNode);
    this._savePending = false;
  }

  hasChild = (_: number, _nodeData: FolderFlatNode) => {
    return _nodeData.expandable;
  };

  hasNoContent = (_: number, _nodeData: FolderFlatNode) => {
    return _nodeData.folderName === "";
  };

  descendantsAllSelected(node: FolderFlatNode): boolean {
    if (this.multiple) {
      const descendants = this.treeControl.getDescendants(node);

      return descendants.every(child => this.checklistFolder.isSelected(child));
    } else {
      return this.checklistFolder.isSelected(node);
    }
  }

  descendantsPartiallySelected(node: FolderFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistFolder.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  folderSelectionToggle(node: FolderFlatNode) {
    const descendants = this.treeControl.getDescendants(node);

    if (this.multiple) {
      this.checklistFolder.isSelected(node)
        ? this.checklistFolder.select(...descendants)
        : this.checklistFolder.deselect(...descendants);
    }

    this.checklistFolder.toggle(node);
    this.onSelectedFolder.emit(this.checklistFolder.selected[0]);
  }

  folderChecked(node: FolderFlatNode): boolean {
    return this.checklistFolder.isSelected(node);
  }

  folderChange(node: FolderFlatNode) {
    this.checklistFolder.toggle(node);
    this.onSelectedFolder.emit(this.checklistFolder.selected[0]);
  }

  addNewParent() {
    if (this._savePending) {
      return;
    }
    this.newParentNode = true;
    this._savePending = true;
  }

  saveParentNode(item) {
    this.newParentNode = false;
    let node = new FolderNode();
    node.folderName = item;

    this._bookmarkService
      .createFolder(node.folderName)
      .pipe(takeUntil(this._destructor$))
      .subscribe(folder => {
        node.id = folder.id;
        this._matTreeService.insertParentItem(node);

        let flatNode = new FolderFlatNode();
        flatNode.folderName = node.folderName;
        flatNode.level = 0;
        flatNode.expandable = !!node.children;
        flatNode.id = folder.id;
        this.flatNodeMap.set(flatNode, node);
        this.nestedNodeMap.set(node, flatNode);
        this._savePending = false;

        this._identityActions.userFoldersLoad(this._folders, this._user.id);
      });
  }

  removeParentNode(node) {
    node.value = "";
    this.newParentNode = false;
    this._savePending = false;
  }

  nodeHasChild(node: FolderFlatNode) {
    const folder = this.flatNodeMap.get(node);
    return folder.children && folder.children.length > 0;
  }

  removeFolder(node: FolderFlatNode) {
    this._remove(node);
  }

  removeParentFolder(node: FolderFlatNode) {
    this._remove(node, true);
  }

  editName(node: FolderFlatNode) {
    this.editing = true;
    this.editingNode = node;
  }

  updateNode(node: FolderFlatNode, newName: string) {
    const flatNode = this.flatNodeMap.get(node);

    this._bookmarkService
      .updateFolder(newName, flatNode.id)
      .pipe(takeUntil(this._destructor$))
      .subscribe(response => {
        if (response instanceof HttpErrorResponse) {
          this._snackbar.error(response.statusText);
        } else {
          this._snackbar.success("Folder name updated");
        }
      });
    this.editing = false;
    this.editingNode = new FolderFlatNode();
    this._matTreeService.updateItem(flatNode, newName);
    this._identityActions.userFoldersLoad(this._folders, this._user.id);
  }

  cancel() {
    this.editing = false;
    this.editingNode = new FolderFlatNode();
  }

  // End of public methods
}
