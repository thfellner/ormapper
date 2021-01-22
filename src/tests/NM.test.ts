import { expect } from 'chai';

import { Entity } from '../metadata/Entity'
import { Field } from '../metadata/Field';
import { Connection, createConnection } from '../manager/Connection';
import { Repository } from '../manager/Repository';
import { Parent } from './models/Parent';
import { Child } from './models/Child';

describe('OneToMany', function() {
    let childRepo: Repository<Child>;
    let parentRepo: Repository<Parent>;
    before(async function() {
      let connection = await createConnection({
        filename: 'db/test.db',
        models: [Child, Parent]
      });
      parentRepo = connection.getRepository(Parent);
      childRepo = connection.getRepository(Child);
    });

    beforeEach(async function() {
      let people = await childRepo.findAll();
      await childRepo.removeMultiple(people);
      childRepo.cache.clear();
      let people2 = await parentRepo.findAll();
      await parentRepo.removeMultiple(people2);
      parentRepo.cache.clear();
    });
    

    it('One to Many', async function() {
      let parent = new Parent();
      parent.age = 22;
      parent.firstName = "Thomas";
      parent.lastName = "Fellner";
      parent.id = "1";

      
      let child = new Child();
      child.age = 20;
      child.firstName = "Max";
      child.lastName = "Mustermann";
      child.id = "2";
      child.parent = parent;
      parent.children = [child]

      await childRepo.save(child);
      await parentRepo.save(parent);
      
      // use findOneReload so it does not take the cached one from the previous save
      let c = await childRepo.findOneReload("2");
      expect(c).eql(child);
      expect(c.parent).eql(parent);
      expect(childRepo.cache.has('2')).to.be.true
    });

    /*
    it('Many to One', async function() {
      let parent = new Parent();
      parent.age = 22;
      parent.firstName = "Thomas";
      parent.lastName = "Fellner";
      parent.id = "1";

      
      let child = new Child();
      child.age = 20;
      child.firstName = "Max";
      child.lastName = "Mustermann";
      child.id = "2";
      child.parent = parent;
      parent.children = [child]

      await childRepo.save(child);
      await parentRepo.save(parent);
      
      // use findOneReload so it does not take the cached one from the previous save
      let p = await parentRepo.findOneReload("1");

      expect(p).eql(parent);
      expect(p.children).eql([child]);
      expect(parentRepo.cache.has('1')).to.be.true
    });*/
  });