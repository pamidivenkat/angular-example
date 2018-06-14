import { BehaviorSubject } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import { ChartData } from '../common/ae-chart-data';
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnInit,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import * as d3 from 'd3';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as Immutable from 'immutable';
import { BaseElement } from '../common/base-element';

@Component({
    selector: 'ae-chart',
    templateUrl: './ae-chart.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AeChartComponent extends BaseElement implements OnInit, AfterContentInit, OnChanges {
    private _width: number = 300;
    private _height: number = 300;
    private _data: Immutable.List<ChartData>;
    private _chartData: ChartData[];
    private _chartType: string;
    @ViewChild("chartContainer") element: ElementRef;
    private host: any;
    private svg: any;
    private htmlElement: HTMLElement;
    private pie: any;
    private _text: string;
    private _textColor: string;

    @Input('text')
    get Text(): string {
        return this._text;
    }
    set Text(val: string) {
        this._text = val;
    }

    @Input('textColor')
    get TextColor(): string {
        return this._textColor;
    }
    set TextColor(color: string) {
        this._textColor = color;
    }

    @Input('width')
    get Width() {
        return this._width;
    }
    set Width(width: number) {
        this._width = width;
    }

    @Input('height')
    get Height() {
        return this._height;
    }
    set Height(height: number) {
        this._height = height;
    }

    @Input('data')
    get Data() {
        return this._data;
    }
    set Data(data: Immutable.List<ChartData>) {
        this._data = data;
    }

    @Input('chartType')
    get ChartType() {
        return this._chartType;
    }
    set ChartType(chartType: string) {
        this._chartType = chartType;
    }

    constructor() {
        super();
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.triggerRenderChart();
    }

    triggerRenderChart() {
        if (this._data && this._data.count() > 0) {
            this._chartData = this._data.toArray();
            this.renderChart();
        }
    }

    ngAfterContentInit() {
        this.htmlElement = this.element.nativeElement;
        this.host = d3.select(this.htmlElement);
        this.triggerRenderChart();
    }

    renderChart() {
        switch (this._chartType) {
            case 'Donut':
                this.renderDonutPie();
                break;
        }
    }

    renderDonutPie() {
        const radius = Math.min(this._width, this._height) / 2;
        const innerRadius = radius * 0.8;
        const outerRadius = radius * 0.45;
        this.drawPie(innerRadius, outerRadius);
    }

    private drawPie(innerRadius: number, outerRadius: number) {
        if (this.host) {
            this.host.html("");
            const color = d3Scale.scaleOrdinal().range(this._chartData.map(x => x.Color));
            const arc = d3Shape.arc()
                .outerRadius(innerRadius)
                .innerRadius(outerRadius)

            this.pie = d3Shape.pie()
                .sort(null)
                .value((d: any) => d.Value);
            this.svg = this.host.append('svg')
                .attr('width', this._width)
                .attr('height', this._height)
                .attr("stroke", "white")
                .attr("stroke-width", 2.6)
                .append("g")
                .attr("transform", "translate(" + this._width / 2 + "," + this._height / 2 + ")");

            let g = this.svg.selectAll(".arc")
                .data(this.pie(this._chartData))
                .enter()
                .append("g")
                .attr("class", "arc");

            g.append("path")
                .attr("d", arc)
                .style("fill", (d: any) => color(d.data.Color))
                .append("title")
                .text(function (d) {
                    if (!isNullOrUndefined(d.data) && !isNullOrUndefined(d.data.Text) && d.data.Text.length > 0) {
                        return d.data.Text + ' - ' + d.data.Value;
                    }
                    else {
                        return "";
                    }
                });

            this.svg
                .append("text")
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "central")
                .attr("stroke", color(this._textColor))
                .attr("fill", color(this._textColor))
                .text(this._text)
                .attr("font-size", "30px")
        }
    }
}