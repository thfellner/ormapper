import sqlite3 from 'sqlite3'
import { Database, open } from 'sqlite'

import { Repository } from "./Repository";
import { Entity } from '../metadata/Entity';
import { CreateTable } from '../util/Querybuilder';
import { table } from 'console';


export class Connection {

    repositories: Map<new() => Object, Repository<any>> = new Map();
    connection: any;

    constructor(connection: any) {
        this.connection = connection;
    }


    getRepository (table: new() => Object){
        if (this.repositories.has(table)) {
            return this.repositories.get(table)
        } else {
            
            let newRepo: Repository<typeof table> = new Repository<typeof table>(table)
            this.repositories.set(table, newRepo);
        }
    }

}

export async function createConnection(connectionObj: {filename: string, models?: (new() => Object)[]}) {
    const conn = new Connection(await open({
        filename: connectionObj.filename,
        driver: sqlite3.Database
    }))

    if (connectionObj.models !== undefined) {
        connectionObj.models.forEach(async model => {
            const modelEntity: Entity = Object.getOwnPropertyDescriptor(new model(), 'entity').value as Entity
            const tableQuery: CreateTable = new CreateTable(modelEntity.tableName)
            modelEntity.primaryKeys.forEach(field => {
                tableQuery.primaryKey(field)
            });

            modelEntity.fields.forEach(field => {
                tableQuery.column(field)
            });

            tableQuery.end();

            console.log(tableQuery.query)

            await conn.connection.exec(tableQuery.query)
        });
    }

    return conn
    
}