import { Component, OnInit } from '@angular/core';
import { ConstantsService } from '../constants.service';
import { DataService } from '../data.service';
import { Lsoa } from '../models/lsoa';
import { ChartData } from '../models/chart-data';
import * as d3 from 'd3';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.css']
})
export class DiscoverComponent implements OnInit {

  crimeTypes = <any>[];
  scales = [];
  allCrimes = true;
  selectedScale = "";
  selectedScaleName = "";
  allData = [];
  crimeData = [];
  vegData = [];
  regressionTitle = "";
  regressionXTitle = "";
  regressionYTitle = "";
  regressionData = [];
  histogramTitle = "";
  histogramData = [];
  showComps = false;

  constructor(
    private dataSvc: DataService) { }

  ngOnInit() {
    this.dataSvc.getData().then(d => this.dataFetched(d));
    for(let i = 0; i < ConstantsService.CRIME_TYPES.length; i++) {
      this.crimeTypes.push({"id": "crime_type_" + i, "name": ConstantsService.CRIME_TYPES[i], "checked": true});
    }
    for(let i = 0; i < ConstantsService.SCALES.length; i++) {
      this.scales.push({"id": "scale_" + i, "name": ConstantsService.SCALES[i]});
    }
    this.selectedScale = this.scales[2].id;
    this.selectedScaleName = this.scales[0].name;
  }
  dataFetched(d) {
    if(!d) {
      return;
    }
    this.allData = d;
  }
  submitClicked() {
    this.showComps = true;
    let selectedCrimeTypes = this.crimeTypes.filter(x => x.checked).map(x => x.name);
    this.selectedScaleName = this.scales.find(x => x.id == this.selectedScale).name;
    if(!this.vegData.length) {
      //only fill once
      this.vegData = Lsoa.getData(this.allData, this.allCrimes, selectedCrimeTypes);
    }
    this.crimeData =  Lsoa.getData(this.allData, this.allCrimes, selectedCrimeTypes);
    this.regressionXTitle = "Vegetation %";
    this.regressionYTitle = "Crime Rate (" + this.selectedScaleName + ")";
    this.regressionTitle = this.regressionXTitle + " vs " + this.regressionYTitle;
    let crimeRateVar = this.selectedScaleName === ConstantsService.SCALE_LOG ? 'crimeRateLog' : this.selectedScaleName === ConstantsService.SCALE_SQRT ? 'crimeRateSqrt' : 'crimeRateLinear';
    this.regressionData = ChartData.getData(this.crimeData, 'id', 'name', 'vegPercent', crimeRateVar);

    this.histogramTitle = "Crime Rate (" + this.selectedScaleName + ") Histogram";
    this.histogramData = this.crimeData.map(d => d[crimeRateVar]);
  }

}
