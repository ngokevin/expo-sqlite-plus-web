## expo-sqlite-plus-web

Rough source code to get sqlite working on both React Native and
Web with a single interface.

### Expo / React Native

Uses `expo-sqlite`.

### Web

Uses `absurd-sql` with sql.js (WASM) and IndexedDB backend purely for byte storage.

### Querying

Uses a forked knex.js that strips everything out except for sqlite3 query building.

### Usage

```ts
import db from './db';

const query = db.knex('user').where({id: 'foo'}).toString();
db.get(query);
```
