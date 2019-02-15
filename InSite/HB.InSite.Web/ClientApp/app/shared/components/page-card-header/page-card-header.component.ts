import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-page-card-header",
  templateUrl: "./page-card-header.component.html",
  styleUrls: ["./page-card-header.component.scss"]
})
export class PageCardHeaderComponent implements OnInit {
  @Input()
  title: string;
  @Input()
  icon: string;
  @Input()
  postColor: string = "#005487";
  @Input()
  iconClass: string = "card-head-icon";
  @Input()
  titleClass: string = "card-head-title";

  constructor() {}

  ngOnInit() {}
}
