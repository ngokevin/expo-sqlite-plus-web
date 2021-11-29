import initSqlJs from '@jlongster/sql.js';
import {SQLiteFS} from 'absurd-sql';
import IndexedDBBackend from 'absurd-sql/dist/indexeddb-backend';

async function init () {
  let SQL = await initSqlJs({locateFile: file => '/assets/js/sql.wasm'});
  let sqlFS = new SQLiteFS(SQL.FS, new IndexedDBBackend());
  SQL.register_for_idb(sqlFS);

  SQL.FS.mkdir('/sql');
  SQL.FS.mount(sqlFS, {}, '/sql');

  const path = '/sql/db.sqlite';
  if (typeof SharedArrayBuffer === 'undefined') {
    let stream = SQL.FS.open(path, 'a+');
    await stream.node.contents.readIfFallback();
    SQL.FS.close(stream);
  }

  let db = new SQL.Database(path, {filename: true});
  db.exec(`PRAGMA journal_mode=MEMORY;`);

  // Receive and execute queries.
  self.addEventListener('message', async function ({data}) {
    const {id, query} = data;
    self.postMessage({id, result: await db.exec(query)});
  });

  // Don't send queries until ready.
  self.postMessage('ready');
}

init();