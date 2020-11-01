import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { Entity } from './metadata/Entity'
import { Person } from './example/Person'
import { Select } from './util/Querybuilder'
import { Connection } from './manager/Connection'
import { createConnection } from './manager/Connection'

export async function openDb () {
  return open({
    filename: 'db/test.db',
    driver: sqlite3.Database
  })
}

async function test() {
  //const db = await openDb()
  //console.log(await db.all('SELECT * FROM tbl'));
  //return await db.all('SELECT * FROM tbl')
  const connection = await createConnection({
    filename: 'db/test.db',
    models: [Person]
  })

  
  console.log(connection)

  connection.getRepository(Person);
}
//let preson  = new Person()

//console.log(Object.values(preson)[0])


test();
//console.log(new Select("test").where("asdf", "=", "test").where("asdf2", "!=", "test2"))

//(async () => {
//console.log(await(await openDb).all('SELECT * FROM tbl'))
//})()