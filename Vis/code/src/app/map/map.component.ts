import { Component, ElementRef, Input, ViewChild, AfterViewChecked, OnDestroy, Output, EventEmitter  } from '@angular/core';
import * as d3 from 'd3';
import d3Tip from "d3-tip"
import * as topojson from 'topojson';
import { DataService } from "../data.service";
import { Subscription } from 'rxjs';
import { ConstantsService } from '../constants.service';
import { Lsoa } from '../models/lsoa';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewChecked, OnDestroy  {

  displayCrime = "CRIME";
  displayVegetation = "VEG";
  displayCanopy = "CANOPY";

  @Input()
  id = "";
  @Input()
  title = "";
  @Input()
  scaleType = ConstantsService.SCALE_LINEAR;

  needNAColor = false;
  naColor = '#887c81';

  dataChanged = false;
  mapCreated = false;

  @Input()
  displayVar: string;
  @Input()
  instructions: string;
  @Input()
  showHandCursor: boolean;

  @Output()
  areaClicked: EventEmitter<string> = new EventEmitter<string>();

  
  greenColors = ['#FDFECD','#E1EABB','#C6D7A9','#ABC498','#8FB086','#749D75','#598A63','#3D7652','#226340', '#07502F'];
  redColors = ['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#DD3A29','#BE2728','#9F1327','#800026'];
  
  private _data: Lsoa[] = [];
  @Input()
  set data(data) {
    if(!data || !data.length) {
      return;
    }
    this.needNAColor = false;
    this._data = data;
    this.dataFetched = true;
    this.dataReady = this.topoDataFetched && this.dataFetched;
    this.dataChanged = true;
    this.checkBeforeRecreate();
  }

  

  @ViewChild('map', {static: false})
  private mapContainer: ElementRef;
  width = 960;
  height = 600;
  scale = 50000;
  xCenter = 0;
  yCenter = 51.48;
  projection = null;
  zoom = null;
  map = null;
  svg = null;
  g = null;
  lsoas = [];
  boroughs = [];
  topoData = [];
  csvData = [];
  divWidth = 0;
  dataReady = false;
  topoDataFetched = false;
  dataFetched = false;
  minValue = 0;
  maxValue = 0;
  divisor = 0;
  legendWidth = 35;
  legendHeight = 10;
  constructor(
    private dataSvc: DataService,
    private constantsSvc: ConstantsService) { }

  subscriptions: Subscription[] = [];
  ngAfterViewInit () {
    this.map = d3.select("#map" + this.id);
    this.svg = this.map
                  .append("svg")
                  .attr("id", "svg" + this.id);
    this.g = this.svg.append("g")
                      .attr("id", "g" + this.id);
    this.subscriptions.push(this.dataSvc.getTopojson().subscribe(data => this.topoJsonFetched(data)));
    this.checkBeforeRecreate();
  }
  ngAfterViewChecked() {
    this.checkBeforeRecreate();
  }
  ngOnDestroy() {
    this.subscriptions.forEach(x => x.unsubscribe());
  }
  topoJsonFetched(data) {
    if(!data) {
      return;
    }
    this.topoData = data;
    this.lsoas = topojson.feature(this.topoData, this.topoData["objects"]["LSOAs"]).features;
    this.boroughs = topojson.mesh(this.topoData, this.topoData["objects"]["boroughs"], (a,b) => { return a !== b; });  
    this.topoDataFetched = true;
    this.dataReady = this.topoDataFetched && this.dataFetched;
  }
  createMap() {
    if(this.divWidth < 400) {
      this.width = 350; this.height = 240; this.scale = 20000; this.xCenter = -0.05; this.yCenter = 51.49;
    }
    else if(this.divWidth < 450) {
      this.width = 400; this.height = 260; this.scale = 20000; this.xCenter = 0; this.yCenter = 51.49;
    }
    else if(this.divWidth < 500) {
      this.width = 450; this.height = 320; this.scale = 25000; this.xCenter = -0.08; this.yCenter = 51.49;
    }
    else if(this.divWidth < 550) {
      this.width = 500; this.height = 350; this.scale = 28000; this.xCenter = -0.08; this.yCenter = 51.49;
    }
    else if(this.divWidth < 600) {
      this.width = 550; this.height = 370; this.scale = 30000; this.xCenter = -0.08; this.yCenter = 51.49;
    }
    else if(this.divWidth < 650) {
      this.width = 600; this.height = 400; this.scale = 30000; this.xCenter = -0.08; this.yCenter = 51.49;
    }
    else if(this.divWidth < 700) {
      this.width = 650; this.height = 420; this.scale = 32000; this.xCenter = -0.08; this.yCenter = 51.49;
    }
    else if(this.divWidth < 750) {
      this.width = 700; this.height = 450; this.scale = 35000; this.xCenter = -0.08; this.yCenter = 51.49;
    }
    else if(this.divWidth < 800) {
      this.width = 700; this.height = 470; this.scale = 37000; this.xCenter = -0.08; this.yCenter = 51.49;
    }
    else if(this.divWidth < 850) {
      this.width = 800; this.height = 500; this.scale = 40000; this.xCenter = -0.08; this.yCenter = 51.49;
    }
    else if(this.divWidth < 900) {
      this.width = 850; this.height = 520; this.scale = 42000; this.xCenter = -0.08; this.yCenter = 51.49;
    }
    else if(this.divWidth < 950) {
      this.width = 900; this.height = 600; this.scale = 50000; this.xCenter = -0.08; this.yCenter = 51.49;
    }
    else {
      this.width = 960; this.height = 620; this.scale = 52000; this.xCenter = 0; this.yCenter = 51.49;
    }
    this.projection = d3.geoMercator()
          .scale(this.scale)
          .center([this.xCenter,this.yCenter])
          .translate([this.width/2,this.height/2]);
        let path = d3.geoPath().projection(this.projection);
        this.zoom = d3.zoom()
        .scaleExtent([1, 40])
        .translateExtent([[0,0], [this.width, this.height]])
        .on("zoom", this.zoomed);
      
        this.svg.select("*").remove();
        this.svg
          .attr("width", this.width)
          .attr("height", this.height)
          .call(this.zoom);

        this.g = this.svg.append("g")
                        .attr("id", "g" + this.id);
        
        this.minValue = 0;
        this.maxValue = 0;
        if(this.displayVar === this.displayCrime) {
          if(this.scaleType === ConstantsService.SCALE_SQRT) {
            this.minValue = d3.min(this._data, d => d.crimeRateSqrt);
            this.maxValue = d3.max(this._data, d => d.crimeRateSqrt);
          } else if(this.scaleType === ConstantsService.SCALE_LOG) {
            this.minValue = d3.min(this._data, d => d.crimeRateLog);
            this.maxValue = d3.max(this._data, d => d.crimeRateLog);
          } else {
            this.minValue = d3.min(this._data, d => d.crimeRateLinear);
            this.maxValue = d3.max(this._data, d => d.crimeRateLinear);
          }
        } else if (this.displayVar === this.displayCanopy) {
          this.minValue = d3.min(this._data, d => d.canopyPercent);
          this.maxValue = d3.max(this._data, d => d.canopyPercent);
        } else {
          this.minValue = d3.min(this._data, d => d.vegPercent);
          this.maxValue = d3.max(this._data, d => d.vegPercent);
        }
        this.divisor = (this.maxValue - this.minValue) / 9;

        //add legend
        let legendVals = [];
        let floorVals = this.displayVar === this.displayCrime && this.scaleType === ConstantsService.SCALE_LINEAR && this.maxValue > 100;
        for(let i = 0; i < 9; i++) {
          legendVals.push({'id': 'leg-' + i, 'value': floorVals ? Math.floor(this.minValue +  this.divisor * i) : (this.minValue +  this.divisor * i).toFixed(2)});
        }
        let legend = this.g.selectAll(".legend-rect, .legend-lbl, .legend-title")
                    .remove();

        let colors = this.displayVar === this.displayCrime ? this.redColors : this.greenColors;

        let legendTitle = "Crime Rate - " + this.scaleType;
        if(this.displayVar === this.displayVegetation) {
          legendTitle = "Vegetation Percentage";
        } else if (this.displayVar === this.displayCanopy) {
          legendTitle = "Canopy Percentage";
        }
        this.g.append("text")
            .attr("class", "legend-title")
            .attr("x", 10)
            .attr("y", this.height - 30)
            .attr("font-size", "11px")
            .attr("font-family", "Arial")
            .attr("text-anchor", "left")
            .text(legendTitle);

        this.g.selectAll('.legend-rect')
            .data(legendVals)
            .enter()
                .append("rect")
                .attr('class', 'legend-rect')
                .attr('x', (d, i) => {return 10 + (this.legendWidth * i);})
                .attr('y', this.height - 20)
                .attr('width', this.legendWidth)
                .attr('height', this.legendHeight)
                .style('fill', (d, i) => { return colors[i];});

        this.g.selectAll('.legend-lbl')
            .data(legendVals)
            .enter()
            .append('text')
                .attr('class', 'legend-lbl')
                .attr('x', (d, i) => {return 10 + (this.legendWidth * i);})
                .attr('y', this.height - 20 + this.legendHeight + 10)
                .attr("font-size", "9px")
                .attr("font-family", "Arial")
                .text(d => d.value);

        this.g.attr("class", "lsoa")
          .selectAll("path")
          .data(this.lsoas)
          .enter().append("path")
            .attr("fill", d => { return this.getLsoaColor(d);})
            .attr("class", "lsoa")
            .attr("d", path)
            .style("cursor", d => {return this.showHandCursor ? "pointer" : "default"})
            .on("click", this.clicked.bind(this))
          .append("title")
            .text(d => {   return this.getTooltip(d); });

      

        this.g.append("path")
          .datum(this.boroughs)
          .attr("class", "borough")
          .attr("d", path);
    this.mapCreated = true;
  }
  getTooltip(d) {
    let item = this._data.find(x => x.id == d.id);
    if(!item) {
      return "LSOA not included - outlier";
    }
    let text = item.name;
    let value = item.vegPercent;
    if(this.displayVar === this.displayCrime) {
      text +=   "\nCrimes Total: " + item.totalCrimes;
      text +=   "\nCrime Rate: " + Number(item.crimeRateLinear).toFixed(2);
      if(this.scaleType === ConstantsService.SCALE_LOG) {
        text += "\nCrime Rate (Log): " + Number(item.crimeRateLog).toFixed(2);
      } else if(this.scaleType === ConstantsService.SCALE_SQRT) {
        text += "\nCrime Rate (Sqrt): " + Number(item.crimeRateSqrt).toFixed(2);
      }
    } else if(this.displayVar === this.displayCanopy) {
      text += "\nCanopy: " + Number(item.canopyPercent).toFixed(2) + "%";
    } else {
    text += "\nVegetation: " + Number(item.vegPercent).toFixed(2) + "%";
  }
    return text;
  }
  getLsoaColor(d) {
    let item = this._data.find(x => x.id == d.id);
    if(!item) {
      this.needNAColor = true;
      return this.naColor;
    }
    let value = item.vegPercent;
    if(this.displayVar === this.displayCrime) {
      if(this.scaleType === ConstantsService.SCALE_SQRT) {
        value = item.crimeRateSqrt;
      } else if(this.scaleType === ConstantsService.SCALE_LOG) {
        value = item.crimeRateLog;
      } else {
        value = item.crimeRateLinear;
      }
    } else if(this.displayVar === this.displayCanopy) {
      value = item.canopyPercent;
    }
    let index = Math.floor((value - this.minValue)/this.divisor);
    if(this.displayVar === this.displayCrime) {
      return this.redColors[index];
    }
    return this.greenColors[index];
  }
  zoomed():void {
    this.g = d3.select("#" + this.id).select("g");
    if(this.g) {
      this.g.attr("transform", d3.event.transform);
    }
  }
  onResize(event) {
    this.checkBeforeRecreate();
  }
  checkBeforeRecreate() {
    if(!this.dataReady) {
      return;
    }
    let width = this.mapContainer.nativeElement.offsetWidth;
    if(width != 0 && (width != this.divWidth || this.dataChanged || !this.mapCreated)) {
      this.divWidth = width;
      this.createMap();
      this.dataChanged = false;
    }
  }
  clicked(event) {
    this.areaClicked.emit(event.id);
  }
  refresh() {
    this.checkBeforeRecreate();
  }
}
