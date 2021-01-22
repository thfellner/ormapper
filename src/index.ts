import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { Entity } from './metadata/Entity'
import { Person } from './example/Person'
import { Select } from './util/Querybuilder'
import { Connection } from './manager/Connection'
import { createConnection } from './manager/Connection'
import { Repository } from './manager/Repository'

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

  let repo: Repository<Person> = connection.getRepository(Person);

  let person = await repo.findAll();
  repo.remove(person[0]);
}
//let preson  = new Person()

//console.log(Object.values(preson)[0])


test();
//console.log(new Select("test").where("asdf", "=", "test").where("asdf2", "!=", "test2"))

//(async () => {
//console.log(await(await openDb).all('SELECT * FROM tbl'))
//})()