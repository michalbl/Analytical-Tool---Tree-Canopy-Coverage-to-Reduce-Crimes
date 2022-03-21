import { Component, TemplateRef, ViewChild, OnInit } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DataService } from '../data.service';
import { ModelItem } from '../models/model-item';
import { Lsoa } from '../models/lsoa';
import { find, ignoreElements } from 'rxjs/operators';
import { HighlightDelayBarrier } from 'blocking-proxy/built/lib/highlight_delay_barrier';
import { getQueryPredicate } from '@angular/compiler/src/render3/view/util';
import { ConstantsService } from '../constants.service';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.css']
})
export class PlanComponent implements OnInit {
  allLsoaData: Lsoa[] = [];
  allData : ModelItem[] = [];
  mapData: Lsoa[] = [];
  scale = "";
  selectedID = "";
  selectedLsoa: ModelItem = new ModelItem();
  plannedValue = 0;
  hasFilterLsoas = false;

  @ViewChild('planMap', {static: false}) planMap: MapComponent;
  @ViewChild('predictMap', {static: false}) predictMap: MapComponent;

  @ViewChild('modal', { static: false }) modal: ModalDirective;
  constructor(
    private dataSvc: DataService
  ) {}

  ngOnInit() {
    this.scale = ConstantsService.SCALE_LOG;
    this.dataSvc.getData().then(d => this.dataFetched(d));
  }
  dataFetched(d) {
    if(!d) {
      return;
    }
    let crimeTypes = [];
    crimeTypes.push(ConstantsService.CRIME_VIOLENCE);
    this.allLsoaData = Lsoa.getData(d, false, crimeTypes);
    this.dataSvc.getModelData().then(d => this.modelFetched(d));
  }
  modelFetched(d) {
    if(!d) {
      return;
    }
    this.allData = ModelItem.getData(d, this.allLsoaData);
    this.mapData = ModelItem.getPlannedLsoaData(this.allData);
  }
  areaClicked(id) {
    this.selectedID = id;
    this.selectedLsoa = this.allData.find(x => x.id === id);
    this.plannedValue = Number((this.selectedLsoa.plannedCanopyPercent).toFixed(2));
    this.modal.show();
  }
  submitClicked() {
    if((this.plannedValue == null || this.plannedValue == undefined) || isNaN(this.plannedValue) || this.plannedValue < 0 || this.plannedValue > 100){
      return;
    }
    this.selectedLsoa.predict(this.plannedValue);
    let mapItem = this.mapData.find(x => x.id === this.selectedID);
    mapItem =  ModelItem.getPlannedLsoa(this.selectedLsoa);
    for(let i = 0; i < this.mapData.length; i++) {
      if(this.mapData[i].id === this.selectedID) {
        this.mapData[i] = mapItem;
        break;
      }
    }
    mapItem = this.mapData.find(x => x.id === this.selectedID);
    this.modal.hide();
    this.planMap.data = this.mapData;
    this.predictMap.data = this.mapData;
    this.hasFilterLsoas = true;
  }
  filterPlannedLosas() {
    return this.allData.filter(x => x.isPlanned);
  }
  resetClicked() {
    if(!confirm("Are you sure you want to reset all planned changes?")) {
      return;
    }
    for(let item of this.allData) {
      if(item.isPlanned) {
        item.removePrediction();
      }
    }
    this.mapData = ModelItem.getPlannedLsoaData(this.allData);
    this.hasFilterLsoas = false;
  }

}
