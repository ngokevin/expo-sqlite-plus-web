// expo-sqlite adapter.
import * as SQLite from 'expo-sqlite';
import Knex from './knex';

const knex = Knex({client: 'sqlite3'});
const db = SQLite.openDatabase('database');

function exec (query: string) {
  return new Promise(resolve => {
    db.transaction(tx => {
      tx.executeSql(query, null, (transaction, results) => {
        resolve([results.rows._array]);
      });
    });
  });
}

(async function createTables () {
  await exec(
    knex.schema.createTableIfNotExists('user', function (table) {
      table.string('id').primary();
    }).toString()
  );
})();

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

export default {
  exec,
  get: async query => { return toJSON(await exec(query)); },
  knex
};
