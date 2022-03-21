import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import * as d3 from 'd3';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }

  getTopojson():Observable<any> {
    return this.http.get('./assets/london.json').pipe(shareReplay());
  }
  getData(): Promise<d3.DSVRowArray<string>> {
    return d3.csv('./assets/VegetationCrimesVis.csv')
  }
  getModelData():Promise<d3.DSVRowArray<string>> {
    return d3.csv('./assets/GWR_Coefficients - LSOA Violence.csv');
  }
}
