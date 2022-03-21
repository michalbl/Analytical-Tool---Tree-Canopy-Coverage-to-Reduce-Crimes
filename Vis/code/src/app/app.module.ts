import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TabsModule } from 'ngx-bootstrap/tabs/';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { AlertModule } from 'ngx-bootstrap/alert';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { HomeComponent } from './home/home.component';
import { DiscoverComponent } from './discover/discover.component';
import { ModelComponent } from './model/model.component';
import { PlanComponent } from './plan/plan.component';
import { MapComponent } from './map/map.component';
import { ScatterPlotComponent } from './scatter-plot/scatter-plot.component';
import { HistogramComponent } from './histogram/histogram.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DiscoverComponent,
    ModelComponent,
    PlanComponent,
    MapComponent,
    ScatterPlotComponent,
    HistogramComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    AlertModule.forRoot(),
    TooltipModule.forRoot(),
    AppRoutingModule
  ],
  providers: [BsModalService],
  bootstrap: [AppComponent]
})
export class AppModule { }
