import { Component, ElementRef, Input, ViewChild, AfterViewInit, AfterViewChecked, OnDestroy  } from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.css']
})
export class HistogramComponent implements AfterViewChecked, OnDestroy {

  @Input()
  id = "";
  @Input()
  title = "";

  binOptions = [10, 20, 30];
  selectedBin = 10;

  private _data: Array<number> = [];
  @Input()
  set data(data) {
    if(!data || !data.length) {
      return;
    }
    this._data = data;
    this.dataFetched = true;
    this.dataChanged = true;
    this.checkBeforeRecreate();
  }

  @ViewChild('chart', {static: false})
  private chartContainer: ElementRef;
  divWidth = 0;
  dataFetched = false;
  dataChanged = false;
  chartCreated = false;

  constructor() { }

  subscriptions: Subscription[] = [];
  ngAfterViewInit () {
    this.checkBeforeRecreate();
  }
  ngAfterViewChecked() {
    this.checkBeforeRecreate();
  }
  ngOnDestroy() {
    this.subscriptions.forEach(x => x.unsubscribe());
  }

  createChart() {
    let margin = {top: 10, right: 20, bottom: 50, left: 50};
    let width = 0;
    let height = 0;
    if(this.divWidth < 400) {
      width = 350; height = 240;
    }
    else if(this.divWidth < 450) {
      width = 400; height = 260;
    }
    else if(this.divWidth < 500) {
      width = 450; height = 320;
    }
    else if(this.divWidth < 550) {
      width = 500; height = 350;
    }
    else if(this.divWidth < 600) {
      width = 550; height = 370;
    }
    else if(this.divWidth < 650) {
      width = 600; height = 400;
    }
    else if(this.divWidth < 700) {
      width = 650; height = 420;
    }
    else if(this.divWidth < 750) {
      width = 700; height = 450;
    }
    else if(this.divWidth < 800) {
      width = 700; height = 470;
    }
    else if(this.divWidth < 850) {
      width = 800; height = 500;
    }
    else if(this.divWidth < 900) {
      width = 850; height = 520;
    }
    else if(this.divWidth < 950) {
      width = 900; height = 600;
    }
    else {
      width = 960; height = 620;
    }
    width = width - margin.left - margin.right,
    height = height - margin.top - margin.bottom;
    let chart = d3.select("#hist" + this.id);
    chart.select("*").remove();
    let svg = chart
              .append('svg')
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                  .attr("id", "g" + this.id)
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
    
    
    let minX = d3.min(this._data, d => d);
    let maxX = d3.max(this._data, d => d);

    
        
    let x = d3.scaleLinear()
    .domain(d3.extent(this._data)).nice()
    .range([0, width]);

    let hist = d3.histogram()
    .value(d => {return d;})
    .thresholds(x.ticks(this.selectedBin))
      (this._data);

    let y = d3.scaleLinear()
    .domain([0, d3.max(hist, d => d.length)]).nice()
    .range([height, 0])


    //add dots    
    svg.selectAll("rect")
        .data(hist)
        .enter()
        .append("rect")
        .attr('fill', "#7A99AC")
        .attr("x", d => x(d.x0) + 1)
        .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
        .attr("y", d => y(d.length))
        .attr("height", d => y(0) - y(d.length));

      svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
      svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    this.chartCreated = true;
  }
  
  checkBeforeRecreate() {
    if(!this.dataFetched) {
      return;
    }
    if(!this.chartContainer) {
      return;
    }
    let width = this.chartContainer.nativeElement.offsetWidth;
    if(width != 0 && (width != this.divWidth || this.dataChanged || !this.chartCreated)) {
      this.divWidth = width;
      this.createChart();
      this.dataChanged = false;
    }
  }
  binClicked(bin) {
    this.selectedBin = bin;
    this.dataChanged = true;
    this.checkBeforeRecreate();
  }
}
