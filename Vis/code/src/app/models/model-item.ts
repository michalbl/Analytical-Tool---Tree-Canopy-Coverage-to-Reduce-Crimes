import { Lsoa } from './lsoa';


export class ModelItem {
    id: string;
    name: string;
    canopyPercent: number;
    canopyPercentBeta: number;
    constSum: number;
    population: number;
    totalCrimes: number;
    crimeRate: number;
    crimeRateLog: number;
    plannedCanopyPercent: number;
    modelCrimeRate: number;
    modelCrimeRateLog: number;
    modelTotalCrimes: number;
    predictedCrimeRate: number;
    predictedCrimeRateLog: number;
    predictedTotalCrimes: number;
    isPlanned: boolean;

    public static getData(allData, allLsoas: Lsoa[]): ModelItem[] {
        let data : ModelItem[]= [];
        for(let d of allData) {
            let item = new ModelItem();
            item.id = d['lsoa_code'];
            let lsoa = allLsoas.find(x => x.id === item.id);
            item.name = lsoa.name;
            item.canopyPercent = lsoa.canopyPercent;
            item.canopyPercentBeta = +d['curio_canopy_percentage'];
            let densityBeta = +d['Population Density;Persons per hectare;2012'];
            let ownerBeta = +d['owner_occupied'];
            let intercept = +d['intercept'];
            item.constSum = intercept + densityBeta * lsoa.density + ownerBeta * lsoa.ownerOccupied;
            item.population = lsoa.population;
            item.totalCrimes = lsoa.totalCrimes;
            
            item.crimeRate = (item.totalCrimes / item.population);
            item.crimeRateLog = Math.log(item.crimeRate);
            
            item.plannedCanopyPercent = item.canopyPercent;
            item.predictedCrimeRate = item.crimeRate;
            item.predictedTotalCrimes = item.totalCrimes;
            item.predictedCrimeRateLog = item.crimeRateLog;

            
            item.modelCrimeRateLog = item.constSum + item.canopyPercent * item.canopyPercentBeta;
            item.modelCrimeRate = Math.exp(item.modelCrimeRateLog);
            item.modelTotalCrimes = Math.round(item.modelCrimeRate * item.population);

            data.push(item);
        }
        return data;
    }
    public predict(plannedCanopyPercent) {
        this.isPlanned = true;
        this.plannedCanopyPercent = plannedCanopyPercent;
        this.predictedCrimeRateLog = this.constSum + this.plannedCanopyPercent * this.canopyPercentBeta;
        this.predictedCrimeRate = Math.exp(this.predictedCrimeRateLog);
        this.predictedTotalCrimes = Math.round(this.predictedCrimeRate * this.population);
    }
    public removePrediction() {
        this.isPlanned = false;
        this.plannedCanopyPercent = this.canopyPercent;
        this.predictedCrimeRateLog = this.crimeRateLog;
        this.predictedCrimeRate = this.crimeRate;
        this.predictedTotalCrimes = this.totalCrimes;
    }
    public static getActualLsoaData(modelItems: ModelItem[]): Lsoa[] {
        let lsoas : Lsoa[]= [];
        for(let d of modelItems) {
            lsoas.push(this.getActualLsoa(d));
        }
        return lsoas;
    }
    public static getActualLsoa(modelItem: ModelItem): Lsoa {
        let item = new Lsoa();
        item.id = modelItem.id;
        item.name = modelItem.name;
        item.canopyPercent = modelItem.canopyPercent;
        item.population = modelItem.population;
        item.totalCrimes = modelItem.totalCrimes;
        item.crimeRateLinear = modelItem.crimeRate;
        item.crimeRateSqrt = Math.sqrt(modelItem.crimeRate);
        item.crimeRateLog  = modelItem.crimeRateLog;
        return item;
    }
    
    public static getPlannedLsoaData(modelItems: ModelItem[]): Lsoa[] {
        let lsoas : Lsoa[]= [];
        for(let d of modelItems) {
            lsoas.push(this.getPlannedLsoa(d));
        }
        return lsoas;
    }
    public static getPlannedLsoa(modelItem: ModelItem): Lsoa {
        let item = new Lsoa();
        item.id = modelItem.id;
        item.name = modelItem.name;
        item.canopyPercent = modelItem.plannedCanopyPercent;
        item.population = modelItem.population;
        item.totalCrimes = modelItem.predictedTotalCrimes;
        item.crimeRateLinear = modelItem.predictedCrimeRate;
        item.crimeRateSqrt = Math.sqrt(modelItem.predictedCrimeRate);
        item.crimeRateLog  = modelItem.predictedCrimeRateLog;
        return item;
    }
}
