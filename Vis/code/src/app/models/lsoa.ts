export class Lsoa {
    id: string;
    name: string;
    vegPercent: number;
    canopyPercent: number;
    population: number;
    density: number;
    ownerOccupied: number;
    totalCrimes: number;
    crimeRateLinear: number;
    crimeRateSqrt: number;
    crimeRateLog: number;

    public static getData(allData, allCrimes: boolean = true, crimeTypes: string[] = []): Lsoa[] {
        let data : Lsoa[]= [];
        for(let d of allData) {
            let item = new Lsoa();
            item.id = d['lsoa_code'];
            item.name = d['lsoa11nm'];
            item.vegPercent = +d['percentage_vegetation_cover'];
            item.canopyPercent = +d['curio_canopy_percentage'];
            item.population = +d['2011 Census Population;Age Structure;All Ages'] / 1000;
            item.density = +d['Population Density;Persons per hectare;2012'];
            item.ownerOccupied = +d['owner_occupied'];
            if(allCrimes) {
                item.totalCrimes = +d['SumOfCrimes'];
            }
            else {
                item.totalCrimes = 0;
                for(let crimeType of crimeTypes) {
                    item.totalCrimes += +d[crimeType];
                }
            }
            item.crimeRateLinear = item.totalCrimes / item.population;
            item.crimeRateSqrt = Math.sqrt(item.crimeRateLinear);
            if(item.totalCrimes === 0) {
                item.crimeRateLog  = 0;
            }
            else {
                item.crimeRateLog = Math.log(item.crimeRateLinear);
            }
            data.push(item);
        }
        return data;
    }
}
