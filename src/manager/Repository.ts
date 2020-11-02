import { Entity } from "../metadata/Entity";
import { Insert } from "../util/Querybuilder";
import { Connection } from "./Connection";

export class Repository<T> {

    objects: T[];
    connection: Connection;
    objectEntity: Entity;

    constructor(model: new () => Object, connection: Connection) {
        // Change
        this.objectEntity = Object.getOwnPropertyDescriptor(new model(), 'entity').value as Entity

        this.connection = connection;

        this.objects = [];
    }


    find () : T[] {
        return this.objects;
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