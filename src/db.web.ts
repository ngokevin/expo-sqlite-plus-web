// absurd-sql adapter.
import {initBackend} from 'absurd-sql/dist/indexeddb-main-thread';
import Knex from './knex';

import Worker from 'worker-loader!./db.worker.web.js';

const knex = Knex({client: 'sqlite3'});

const worker = new Worker();
initBackend(worker);

// Wait for worker to ready.
const ready = new Promise(resolve => {
  function setReady ({data}) {
    if (data !== 'ready') { return; }
    resolve(true);
    worker.removeEventListener('message', setReady);
  }
  worker.addEventListener('message', setReady);
});

async function exec (query: string) {
  await ready;

  return new Promise(resolve => {
    const queryId = Math.floor(Math.random() * 100000);

    function listener ({data}) {
      const {id, result} = data;
      if (id !== queryId) { return; }
      worker.removeEventListener('message', listener);
      resolve(result);
    }

    worker.addEventListener('message', listener);
    worker.postMessage({query, id: queryId});
  });
}

// Format SQL return results to JSON.
function toJSON (data) {
  return data.map(({columns, values}) => {
    return values.map(val => {
      const row = {};
      for (let i = 0; i < columns.length; i++) {
        row[columns[i]] = val[i];
      }
      return row;
    });
  });
}

// Wrapper around exec.
async function get (query) {
  return toJSON(await exec(query));
}

(async function createTables () {
  await exec(
    knex.schema.createTableIfNotExists('user', function (table) {
      table.string('id').primary();
    }).toString()
  );
})();

export default {
  exec,
  get,
  knex
};
