import { Entity as EntityClass } from "../metadata/Entity";
/**
 * Decorator for the Primary Keys
 */
export function PrimaryKey() : PropertyDecorator {
    return function (target: any, property: string) : void {
        Reflect.defineMetadata("field", "pk", target, property);
        addFields(target, property);
    };
}

/**
 * Decorator for normal Columns
 */
export function Column() : PropertyDecorator {
    return function (target: any, property: string) : void {
        Reflect.defineMetadata("field", "", target, property);
        addFields(target, property);
    };
}

/**
 * Decorator for OneToMany Columns
 */
export function OneToMany() : PropertyDecorator {
    return function (target: any, property: string) : void {
        Reflect.defineMetadata("field", "1toN", target, property);
        addFields(target, property);
    };
}

/**
 * Decorator for ManyToOne Columns
 */
export function ManyToOne() : PropertyDecorator {
    return function (target: any, property: string) : void {
        
        Reflect.defineMetadata("field", "fk", target, property);
        addFields(target, property);
    };
}

/**
 * Decorator for ManyToMany Columns
 */
export function ManyToMany() : PropertyDecorator {
    return function (target: any, property: string) : void {
        Reflect.defineMetadata("field", "MtoN", target, property);
        addFields(target, property);
    };
}

/**
 * function for adding fields using reflect metadata
 */
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

/**
 * Decorator for the Entities turning each class into an entity
 */
export function Entity<T extends { new(...args: any[]): {} }>(constructor: T) {
    const entity = new EntityClass(constructor);

    return class extends constructor {
        entity = entity;
    }

}