import { expect } from 'chai';

import { Person } from './models/person'
import { Entity } from '../metadata/Entity'
import { Field } from '../metadata/Field';
import { Connection, createConnection } from '../manager/Connection';
import { Repository } from '../manager/Repository';

describe('Repository', function() {
    let personRepo: Repository<Person>;
    before(async function() {
      let connection = await createConnection({
        filename: 'db/test.db',
        models: [Person]
      });
      personRepo = connection.getRepository(Person)
    });

    beforeEach(async function() {
      let people = await personRepo.findAll();
      await personRepo.removeMultiple(people);
      personRepo.cache.clear();
    });
    

    it('Repository save and find', async function() {
      let person1 = new Person()
      person1.age = 22;
      person1.firstName = "Thomas";
      person1.lastName = "Fellner";
      person1.id = "1";

      await personRepo.save(person1);
      let p1 = await personRepo.findOne("1");
      expect(p1).eql(person1)
      expect(personRepo.cache.has('1')).to.be.true

    });

    it('Repository save and find mutliple', async function() {
      let person1 = new Person()
      person1.age = 22;
      person1.firstName = "Thomas";
      person1.lastName = "Fellner";
      person1.id = "1";

      
      let person2 = new Person()
      person2.age = 20;
      person2.firstName = "Max";
      person2.lastName = "Mustermann";
      person2.id = "2";

      await personRepo.saveMultiple([person1, person2])
      let p = await personRepo.findMultiple(["1", "2"]);
      expect(p).eql([person1, person2]);
      expect(personRepo.cache.has('1')).to.be.true
      expect(personRepo.cache.has('2')).to.be.true
    });

    it('Repository update', async function() {
      let person1 = new Person()
      person1.age = 22;
      person1.firstName = "Thomas";
      person1.lastName = "Fellner";
      person1.id = "1";

      await personRepo.save(person1);
      let p1 = await personRepo.findOne("1");
      expect(p1).eql(person1)

      await personRepo.update(person1, {id: "3"})
      p1 = await personRepo.findOne("1");
      expect(p1).to.not.eql(person1)
      expect(personRepo.cache.has('1')).to.be.false
      expect(personRepo.cache.has('3')).to.be.true

    });

    it('Repository remove', async function() {
      let person1 = new Person()
      person1.age = 22;
      person1.firstName = "Thomas";
      person1.lastName = "Fellner";
      person1.id = "1";

      await personRepo.save(person1);
      await personRepo.remove(person1);
      let p1 = await personRepo.findOne("1");
      expect(p1).to.be.null
      expect(personRepo.cache.has('1')).to.be.false

    });

    it('Repository remove and find mutliple', async function() {
      let person1 = new Person()
      person1.age = 22;
      person1.firstName = "Thomas";
      person1.lastName = "Fellner";
      person1.id = "1";

      
      let person2 = new Person()
      person2.age = 20;
      person2.firstName = "Max";
      person2.lastName = "Mustermann";
      person2.id = "2";

      await personRepo.saveMultiple([person1, person2])
      await personRepo.remove(person1);
      await personRepo.remove(person2);
      let p1 = await personRepo.findOne("1");
      let p2 = await personRepo.findOne("2");
      expect(p1).to.be.null
      expect(p2).to.be.null
      expect(personRepo.cache.has('1')).to.be.false
      expect(personRepo.cache.has('2')).to.be.false
    });
  });