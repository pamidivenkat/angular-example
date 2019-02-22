import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator, MatSort, MatTableDataSource } from "@angular/material";

const TABLE_DATA = [
  {
    id: 1,
    ssku: "1211",
    vsku: 34343,
    category: "test1",
    subCategory: "subtest1",
    brand: "brand1",
    itemName: "item1",
    mrp: 25
  },
  {
    id: 2,
    ssku: "1211",
    vsku: 34343,
    category: "test2",
    subCategory: "subtest2",
    brand: "brand2",
    itemName: "item2",
    mrp: 24
  },
  {
    id: 3,
    ssku: "1211",
    vsku: 34343,
    category: "test3",
    subCategory: "subtest3",
    brand: "brand3",
    itemName: "item3",
    mrp: 29
  },
  {
    id: 4,
    ssku: "1211",
    vsku: 34343,
    category: "test4",
    subCategory: "subtest4",
    brand: "brand4",
    itemName: "item4",
    mrp: 55
  }
];

@Component({
  selector: "app-catalog",
  templateUrl: "./catalog.component.html",
  styleUrls: ["./catalog.component.scss"]
})
export class CatalogComponent implements OnInit {
  dataSource: MatTableDataSource<any>;
  displayedColumns: Array<string> = [
    "id",
    "ssku",
    "vsku",
    "category",
    "subCategory",
    "brand",
    "itemName",
    "mrp",
    "actions"
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor() {
    this.dataSource = new MatTableDataSource(TABLE_DATA);
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onTabChange(event) {}
}
