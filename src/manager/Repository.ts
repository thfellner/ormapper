import { util } from "chai";
import { Entity } from "../metadata/Entity";
import { Parent } from "../tests/models/Parent";
import { Delete, Insert, Select, Update } from "../util/Querybuilder";
import { Connection } from "./Connection";
/**
 * Repository holding the main logic behind caching, managing database objects and creating the queries
 */
export class Repository<T> {

    // cached objects
    cache: Map<any, T> = new Map();
    connection: Connection;
    objectEntity: Entity;

    constructor(model: new () => Object, connection: Connection) {
        // need to use any here so tmpModel can be indexed by []
        const tmpModel: any = new model();
        this.objectEntity = tmpModel['entity'] as Entity

        this.connection = connection;
    }

    /**
     * convert multiple database objects to entity Objects used when finding something in the database
     * @param dbObjects plain javascript object array
     */
    private async convertDatabaseToEntityObjects(dbObjects: any[]) {
        let entityObjects: T[] = [];
        dbObjects.forEach(async element => {
            let entityObject = await this.convertDatabaseToEntityObject(element)
            entityObjects.push(entityObject);
        });
        return entityObjects;
    }

    
    /**
     * convert a single database objects to entity Objects used when finding something in the database
     * @param dbObjects plain javascript object array
     */
     private async convertDatabaseToEntityObject(dbObject: any) {
        if (dbObject == null) {
            return null
        } else {
            // need to use any here so entityObject and element can be indexed by [] and assigned a value
            let entityObject: any = new this.objectEntity.tableType();

            for (let key in dbObject) {
                if (key.endsWith("_FK")) {
                    //entityObject[key] = this.connection.getRepository(this.objectEntity.foreignKeys) dbObject[key]
                    let fkType = this.objectEntity.foreignKeys[0].type;
                    if (fkType != null) {
                        let fk = await this.connection.getRepository(fkType).findOne(dbObject[key]);
                        entityObject[this.objectEntity.foreignKeys[0].name] = fk;
                    }
                } else {
                    entityObject[key] = dbObject[key];
                }
            }

            this.objectEntity.onetonArray.concat(this.objectEntity.mtonArray).forEach(async element => {
                // https://stackoverflow.com/questions/35022658/how-do-i-get-array-item-type-in-typescript-using-the-reflection-api
                // https://github.com/microsoft/TypeScript/issues/7169
                // It is currently not possible to get the type of the array.
                // so I've hit a stop where my javascript/typescript knowledge is not big enough to overcome this.

                let foreignRepository = this.connection.getRepository(element.type.constructor.name);
                let foreignObjects = await foreignRepository.findAll();
                console.log(foreignObjects)
                // take some of the foreignobjects filtered by the primary keys reduced by comparing the primary keys of the current object and the filter object
                entityObject[element.name] = foreignObjects.filter(foreignObject => {
                        this.objectEntity.primaryKeys.forEach((val) => {
                                return foreignObject[this.objectEntity.tableName][val.name] === entityObject[val.name]
                    });
                });
            });
            entityObject['entity'] = this.objectEntity;

            return entityObject;
        }
    }

    /**
     * Find the primary key values for any object of this repository
     * @param object with the type of this repository
     */
    private pkValues(object: T) {
        return this.objectEntity.primaryKeys.map((x) => (object as any)[x.name])
    }

    /**
     *  Add a non null object to the cache if it is no in there already
     * @param object with the type of this repository
     */
    private addToCache (object: T) {
        if(object != null && !this.cache.has(this.pkValues(object))) {
            this.cache.set(this.pkValues(object).join(), object);
        }
    }

    /**
     * Find all objects from this repository in the database and convert them to entity objects
     */
    async findAll () : Promise<T[]> {
        const select: Select = new Select(this.objectEntity.tableName);

        let entityObjects: T[] = await this.convertDatabaseToEntityObjects(await this.connection.getAll(select.query));

        entityObjects.forEach(element => {
            this.addToCache(element);
        });

        return entityObjects;
    }

    /**
     * Find multiple objects from this repository in the database and convert them to entity objects
     * @param ks the keys to search
     */
    async findMultiple (ks: any[]) : Promise<any[]>  {
        let entityObjects = Promise.all(ks.map(async x => await this.findOne(x)));
        return entityObjects;
    }

    /**
     * Find one object from this repository in the database and convert them to entity objects
     * In case there are mutliple primary keys you can either join them by , or pass them as an array
     * @param k array of primary keys, joined primary keys or singular primary key
     */
    async findOne (k: any) : Promise<T>  {
        if (k instanceof Array) {
            k = k.join();
        }

        if (this.cache.has(k)){
            return this.cache.get(k);
        } else {
            return this.findOneReload(k);
        }
    }

    /**
     * Find one Object without using the cache, but updating it afterwards
     * @param k 
     */
    async findOneReload(k: any) {
        const select: Select = new Select(this.objectEntity.tableName);
        if (k instanceof Array) {
            for (let i = 0; i < this.objectEntity.primaryKeys.length; i++) {
                select.whereEqual(this.objectEntity.primaryKeys[i].name, k[i])
                
            }
        } else {
            select.whereEqual(this.objectEntity.primaryKeys[0].name, k.toString())
        }
        let dbObject = await this.connection.connection.get(select.query);
        let entityObject = await this.convertDatabaseToEntityObject(dbObject);
        this.addToCache(entityObject);
        return entityObject;
    }

    /**
     * Save an entity object to the database
     * @param object to save
     */
    async save (object: T){

        //let mightAlreadyExist = await this.findOneReload(this.pkValues(object))
        //if (mightAlreadyExist != null) {
        //    return mightAlreadyExist;
        //}

        this.addToCache(object);
        const insert: Insert = new Insert(this.objectEntity.tableName);
        this.objectEntity.getAllExceptForeign().forEach(field => {
            // get the value of the field to save
            const value = Object.getOwnPropertyDescriptor(object, field.name).value as string

            insert.set(field.name, value);
        });
        this.objectEntity.foreignKeys.forEach(field => {
            const foreignClass = Object.getOwnPropertyDescriptor(object, field.name).value as string
            
            if (field.type != Array) {
                const foreignEntity = (foreignClass as any)['entity'] as Entity;
                foreignEntity.primaryKeys.forEach(foreignKey => {
                    const value = Object.getOwnPropertyDescriptor(foreignClass, foreignKey.name).value as string
                    insert.set(foreignEntity.tableName + "_" + foreignKey.name + "_FK", value)
                })
            }
        })
        insert.end()

        await this.connection.executeQuery(insert.query)
    }

    /**
     * Save multiple database objects to the database
     * @param objects to save
     */
    async saveMultiple (objects: T[]){
        objects.forEach(async object => {
            await this.save(object);
        });
    }

    /**
     * Update an object in the database
     * @param object to update
     * @param updateKeys plain javascript object in key value format with the Column and Value pairs
     */
    async update (object: T, updateKeys: any){
        const updateQuery: Update = new Update(this.objectEntity.tableName);
        this.cache.delete(this.pkValues(object).join())
        
        Object.keys(updateKeys).forEach((key: any) => {
            updateQuery.set(key, updateKeys[key]);
            (object as any)[key] = updateKeys[key];

        });

        await this.connection.executeQuery(updateQuery.query);
        await this.findOneReload(this.pkValues(object).join());
    }

    /**
     * Remove a singular entity object
     * @param object to remove
     */
    async remove (object: any) {
        const deleteQuery: Delete = new Delete(this.objectEntity.tableName);
        this.objectEntity.primaryKeys.forEach(pk => {
            deleteQuery.whereEqual(pk.name, object[pk.name])
        });
        
        await this.connection.executeQuery(deleteQuery.query)
        this.cache.delete(this.pkValues(object).join())
    }

    /**
     * Remove multiple entity Objects
     * @param objects to remove
     */
    async removeMultiple (objects: T[]){
        objects.forEach(async object => {
            await this.remove(object);
        });
    }

}