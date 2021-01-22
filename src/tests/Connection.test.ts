import { expect } from 'chai';

import { Person } from './models/person'
import { Entity } from '../metadata/Entity'
import { Field } from '../metadata/Field';
import { Connection, createConnection } from '../manager/Connection'

describe('Connection', function() {
    it('Can Create Connection', function() {
      createConnection({
        filename: 'db/test.db',
        models: [Person]
      }).then(function (done) {
        expect(done).instanceOf(Connection);
      });
    });
  });