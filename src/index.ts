import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { Entity } from './metadata/Entity'
import { Person } from './example/Person'

export async function openDb () {
  return open({
    filename: 'db/test.db',
    driver: sqlite3.Database
  })
}

async function test() {
  const db = await openDb()
  console.log(await db.all('SELECT * FROM tbl'));
  return await db.all('SELECT * FROM tbl')
}

new Entity(new Person("Name", "test"));

console.log(test());

//(async () => {
//console.log(await(await openDb).all('SELECT * FROM tbl'))
//})()