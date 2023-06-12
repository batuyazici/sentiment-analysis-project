const { Pool, types } = require('pg');

const pool = new Pool();

// Register a custom type parser for the date type
types.setTypeParser(types.builtins.DATE, (value) => value);

export default {
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  },
};
