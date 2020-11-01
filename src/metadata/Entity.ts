
import 'reflect-metadata';
import { Field } from "./Field";

export class Entity {


    tableName: string;
    tableType: new() => Object;
    fields: Field[];
    primaryKeys : Field[];

    constructor(table: new() => Object) {
        this.tableType = table;
        this.tableName = table.name

        //console.log(Reflect.getMetadata("table", table))

        //let t = Reflect.getMetadata("design:paramtypes", table);
        //console.log(t)

        this.primaryKeys = [];
        this.fields = [];
        let instance: any = new table();

        const fields: string[] = Reflect.getMetadata("fields", instance);

        fields.forEach(field => {
            let fieldInfo = Reflect.getMetadata("field", instance, field);

            
            if (fieldInfo === "pk") {
                //console.log(field, "pk")
                this.primaryKeys.push(new Field(field, Reflect.getMetadata("design:type", instance, field)))
            } else {
                this.fields.push(new Field(field, Reflect.getMetadata("design:type", instance, field)))
            }
        });
    }
    
}