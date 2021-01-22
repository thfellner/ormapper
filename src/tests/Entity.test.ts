import { expect } from 'chai';

import { Person } from './models/person'
import { Entity } from '../metadata/Entity'
import { Field } from '../metadata/Field';

describe('Entity and Fields', function() {
    it('Entity Exists', function() {
      let person: any  = new Person();
      
      expect(person['entity']).to.be.an("object");
    });
    
    it('Entity Has Correct Table Name', function() {
      let person: any  = new Person();
      
      expect((person['entity'] as Entity).tableName).to.equal("Person");
    });
    
    it('Entity Has Correct Fields', function() {
      let person: any  = new Person();
      
      // map fields array to an array with just names, as we are not testing types here
      // also use .eql (deeply equal) instead of equal as this tests each element instead of the object/array itself
      expect((person['entity'] as Entity).fields.map(x => x.name)).to.eql([ 'firstName', 'lastName', 'age' ]);
    });

    it('Entity Has Correct Primary Keys', function() {
      let person: any  = new Person();
      
      // map fields array to an array with just names, as we are not testing types here
      // also use .eql (deeply equal) instead of equal as this tests each element instead of the object/array itself
      expect((person['entity'] as Entity).primaryKeys.map(x => x.name)).to.eql([ 'id' ]);
    });

    it('Entity Field Has Correct Type', function() {
      let person: any  = new Person();
      
      expect(((person['entity'] as Entity).fields[0].type)).to.equal(String);
    });
  });