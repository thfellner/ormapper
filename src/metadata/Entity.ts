

export class Entity {


    //fields: string[];
    table: any;

    constructor(table: any) {
        this.table = table;
        console.log(Object.getOwnPropertyNames(table))
    }
    
}