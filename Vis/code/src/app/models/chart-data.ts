export class ChartData {
    id: string;
    name: string;
    x: number;
    y: number;

    public static getData(allData, idName: string, nameName: string, xName: string, yName: string) {
        let data : ChartData[]= [];
        for(let d of allData) {
            let item = new ChartData();
            item.id = d[idName];
            item.name = d[nameName];
            item.x = d[xName];
            item.y = d[yName];
            data.push(item);
        }
        return data;
    }
}
