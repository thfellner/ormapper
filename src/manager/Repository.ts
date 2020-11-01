import { Entity } from "../metadata/Entity";

export class Repository<T> {

    objects: T[];
    objectEntity: Entity;

    constructor(model: new () => Object) {
        // Change
        
        this.objectEntity = Object.getOwnPropertyDescriptor(new model(), 'entity').value as Entity

        console.log(this.objectEntity)
        
        this.objects = [];
    }


    find () : T[] {
        return this.objects;
    }

    findOne (n: number) : T {
        return this.objects[n];
    }

    save (object: T){
        this.objects.push(object);
    }

    remove (object: T) {
        if (this.objects.includes(object)) {
            this.objects.splice(this.objects.indexOf(object), 1);
        } else {
            throw Error("This object is not in our records");
        }
    }

}