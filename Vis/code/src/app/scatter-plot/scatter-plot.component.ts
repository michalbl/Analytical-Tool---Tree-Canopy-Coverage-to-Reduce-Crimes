import { Component, ElementRef, Input, ViewChild, AfterViewInit, AfterViewChecked, OnDestroy  } from '@angular/core';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { ChartData } from '../models/chart-data';

@Component({
  selector: 'app-scatter-plot',
  templateUrl: './scatter-plot.component.html',
  styleUrls: ['./scatter-plot.component.css']
})
export class ScatterPlotComponent implements AfterViewChecked, OnDestroy  {

  @Input()
  id = "";
  @Input()
  title = "";
  @Input()
  xTitle = "";
  @Input()
  yTitle = "";

  private _data: ChartData[] = [];
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
    let margin = {top: 10, right: 5, bottom: 50, left: 80};
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
    let chart = d3.select("#chart" + this.id);
    chart.select("*").remove();
    let svg = chart
              .append('svg')
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                  .attr("id", "g" + this.id)
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
    
    
    let minX = d3.min(this._data, d => d.x);
    let maxX = d3.max(this._data, d => d.x);
    let minY = d3.min(this._data, d => d.y);
    let maxY = d3.max(this._data, d => d.y);
        
    let x = d3.scaleLinear().domain([0, maxX]).range([0,width]);
    let y = d3.scaleLinear().domain([minY, maxY]).range([height,0]);

    let lg = this.doRegression(minX, minY);       

    //add axis titles
    svg.append("text")
    .attr("x", width/2)
    .attr("y", height + 40)
    .attr("font-size", "16px")
    .attr("font-family", "Arial")
    .attr("text-anchor", "middle")
    .text(this.xTitle);
    svg.append("text")
        .attr("y", - 60)
        .attr("x",0 - (height / 2))
        .attr("font-size", "16px")
        .attr("font-family", "Arial")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text(this.yTitle);

    //add dots    
    svg.selectAll("circle")
        .data(this._data, d => {return d['id'];})
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("r", 3)
        .attr('fill', "#7A99AC")
        .attr("cy", d => { return y(d.y); })
        .attr("cx", d => { return x(d.x); })
        .append("title")
        .text(d => { return d.name; });

        //add regression equation
        svg.append("text")
            .attr('x', width - 180)
            .attr('y', 30)
            .attr("font-size", "11px")
            .attr("font-family", "Arial")
            .attr("text-anchor", "left")
            .attr("font-weight", "bold")
            .text("y = " + lg.slope.toFixed(4) + "x + " + lg.intercept.toFixed(4));

    //add R-squared
    svg.append("text")
        .attr('x', width - 180)
        .attr('y', 45)
        .attr("font-size", "11px")
        .attr("font-family", "Arial")
        .attr("text-anchor", "left")
        .attr("font-weight", "bold")
        .text("R2 = " + lg.rSquared.toFixed(4));
    
    //add regression line    
    svg.append("line")
        .attr("class", "regression")
        .attr('stroke-width', '3px')
        .attr('stroke', 'red')
        .attr('stroke-dasharray', '10,5')
        .attr("x1", x(lg.ptA.x))
        .attr("y1", y(lg.ptA.y))
        .attr("x2", x(lg.ptB.x))
        .attr("y2", y(lg.ptB.y));

      svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
      svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    this.chartCreated = true;
  }

  doRegression(minX, minY){
    let xVals: number[] = this._data.map(x => x.x);
    let yVals: number[] = this._data.map(x => x.y);
    let xSum = 0;
    let ySum = 0;
    let xySum = 0;
    let xxSum = 0;
    let count = 0;

    let x = 0;
    let y = 0;
    let valLenght = xVals.length;

    if (valLenght != yVals.length) {
        throw new Error('The parameters xVals and yVals need to have same size!');
    }

    for (let i = 0; i < valLenght; i++) {
        x = xVals[i];
        y = yVals[i];
        xSum += x;
        ySum += y;
        xxSum += x*x;
        xySum += x*y;
        count++;
    }

    //Calculate m and b (y = x * m + b)
    let m = (count*xySum - xSum*ySum) / (count*xxSum - xSum*xSum);
    let b = (ySum/count) - (m*xSum)/count;

    
    //calculate R2
    let yBar: number = ySum / valLenght;
    // let yHats = [];
    let yHatDelta = 0;
    let yDelta = 0;
    for (let i = 0; i < valLenght; i++) {
      yDelta += Math.pow((yVals[i] - yBar), 2);
      yHatDelta += Math.pow(xVals[i] * m + b - yBar, 2);
    }
    let rSquared = yHatDelta / yDelta;
    
    return {
      slope: m,
      intercept: b,
         ptA : {
        x: minX,
        y: m * minX + b
      },
      ptB : {
        y: minY,
        x: (minY - b) / m
      },
      rSquared: rSquared
    }

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
}
