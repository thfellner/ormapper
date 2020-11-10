import { Entity } from "../metadata/Entity";
import { Insert, Select } from "../util/Querybuilder";
import { Connection } from "./Connection";

export class Repository<T> {

    objects: T[];
    connection: Connection;
    objectEntity: Entity;

    constructor(model: new () => Object, connection: Connection) {
        // need to use any here so tmpModel can be indexed by []
        const tmpModel: any = new model();
        this.objectEntity = tmpModel['entity'] as Entity

        this.connection = connection;

        this.objects = [];
    }

    private convertDatabaseToEntityObjects(dbObjects: any[]) {
        let entityObjects: T[] = [];
        dbObjects.forEach(element => {
            // need to use any here so entityObject and element can be indexed by [] and assigned a value
            let entityObject: any = new this.objectEntity.tableType();

            for (let key in element) {
                entityObject[key] = element[key];
            }

            entityObjects.push(entityObject);
        });
        return entityObjects;
    }


    async findAll () : Promise<T[]> {
        const select: Select = new Select(this.objectEntity.tableName);

        let entityObjects: T[] = this.convertDatabaseToEntityObjects(await this.connection.getAll(select.query));

        return entityObjects;
    }

    findOne (n: number) : T {
        return this.objects[n];
    }

    async save (object: T){
        this.objects.push(object);

        const insert: Insert = new Insert(this.objectEntity.tableName);
        this.objectEntity.getAllFields().forEach(field => {
            const value = Object.getOwnPropertyDescriptor(object, field.name).value as string

            insert.set(field.name, value);
        });
        insert.end()

        await this.connection.executeQuery(insert.query)
    }

    remove (object: T) {
        if (this.objects.includes(object)) {
            this.objects.splice(this.objects.indexOf(object), 1);
        } else {
            throw Error("This object is not in our records");
        }
    }

}