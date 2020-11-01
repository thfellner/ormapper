import { Entity as EntityClass } from "../metadata/Entity";

export function PrimaryKey() : PropertyDecorator {
    return function (target: any, property: string) : void {
        Reflect.defineMetadata("field", "pk", target, property);
        addFields(target, property);
    };
}

export function Column() : PropertyDecorator {
    return function (target: any, property: string) : void {
        Reflect.defineMetadata("field", "", target, property);
        addFields(target, property);
    };
}

function addFields(target: any, property: any) : void {
    // get own fields from the target
    let fields = Reflect.getOwnMetadata("fields", target);
    if (!fields) {
        // merge with inherited fields, if available.
        fields = Reflect.hasMetadata("fields", target)
            ? Reflect.getMetadata("fields", target).slice(0)
            : [];

        // define own fields on the target
        Reflect.defineMetadata("fields", fields, target);
    }

    // record fields
    fields.push(property);
}

export function Entity<T extends { new(...args: any[]): {} }>(constructor: T) {
    const entity = new EntityClass(constructor);

    return class extends constructor {
        entity = entity;
    }

}