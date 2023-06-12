import {v4 as uuidv4} from 'uuid';
const { exec } = require('child_process');
import path from 'path';
import db from './db';

const handler = {};

handler.getAll = function() {

  return db.query('SELECT * FROM twitter_operation')
    .then(result => {
      const operations = result.rows;
      console.log(`Number of operations found: ${operations.length} on twitter_operation table.\n`);
      return operations;
    })
    .catch(err => {
      console.log(`Error while getting operations by query: ${err}`);
      return [];
    });
};

handler.getAllDt = function() {
  return db.query('SELECT start_time, * FROM dataset_operation')
    .then(result => {
      const operations = result.rows.map(row => {
        return { ...row, start_time: row.start_time };
      });

      console.log(`Number of operations found: ${operations.length} on dataset_operation table.\n`);
      return operations;
    })
    .catch(err => {
      console.log(`Error while getting operations by query: ${err}`);
      return [];
    });
};



handler.getAllCompleted = function() {
  let text = 'SELECT * FROM twitter_operation WHERE status = $1';
  let values = ['Completed'];

  return db.query(text, values)
      .then(function(operation) {
          console.log(`Number of operations found: ${operation.length}`);
          return operation;
      })
      .catch(function(err) {
          console.log(`ERROR while getting operations by query: ${err}`);
          return [];
      });
};



handler.findById = function(id) {
  return db.query('SELECT * FROM twitter_operation WHERE op_id = $1', [id])
    .then(result => {
      if (result.rowCount > 0) {
        console.log(`Operation found with id "${id}"\n`);
      }
      return result.rows;
    })
    .catch(err => {
      console.log(`Error while getting operation by id: ${err}`);
      return [];
    });
};

handler.findByIdDt = function(id) {
  return db.query('SELECT * FROM dataset_operation WHERE op_dt_id = $1', [id])
    .then(result => {
      if (result.rowCount > 0) {
        console.log(`Operation found with id "${id}"\n`);
      }
      return result.rows;
    })
    .catch(err => {
      console.log(`Error while getting operation by id: ${err}`);
      return [];
    });
};

handler.findByQuery = function(query) {
  return db.query('SELECT * FROM twitter_operation WHERE query = $1', [query])
    .then(result => {
      if (result.rowCount > 0) {
        console.log(`Operations found for query "${query}"`);
      }
      return result.rows;
    })
    .catch(err => {
      console.log(`Error while getting operation by query: ${err}`);
      return [];
    });
};

handler.startDtOperation = async function(params) {
  console.log("Starting")
  console.log(params.dt_query);

  if(!params.dt_query || !params.dt_query.trim()){
    throw `query is not valid ${params.dt_query}`
}
await checkProcessRunning().catch(() => {
  throw 'Another operation is running right now. Please try again!';
});

if(await queryExists(params.dt_query,'dataset_operation')){
  throw `Query already exists: ${params.dt_query}. Please try again!`;
}else{
  console.log('query does not exist');
}
  let operation_id = uuidv4();
  let sent_path = `${params.dt_query}_${operation_id}.json`;
  let wcloud_path = `${params.dt_query}_wcloud.json`;

  let operation = await initTable(operation_id,params.dt_query,'dataset_operation').catch(() => {
    throw 'error when inserting query info into database';
});

await executeQuery(operation_id, params.dt_query, sent_path, wcloud_path)
.then(async () => {
   console.log('model execution started');
}).catch(async (err) => {
    console.log(`ERROR while executing model ${err}`);
     await endTable(operation_id, 'Failed','dataset_operation');
});
return operation.rows[0];
}

async function executeQuery(operation_id, query, sent_path, wcloud_path) {
  const scriptPath = path.resolve(__dirname);
  console.log(scriptPath);
  let cmd = `cd ${scriptPath} && bash query.sh "${query}" "../results/dataset/${sent_path}" "../results/dataset/${wcloud_path}"`;
  console.log(cmd);
  const ls = exec(cmd);
    
  ls.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
  });
  
  ls.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
      endTable(operation_id, 'Failed','dataset_operation');
  });
  
  ls.on('close', (code) => {
      if (code == 0){
          endTable(operation_id, 'Completed','dataset_operation',sent_path, wcloud_path);
      }else if(code === 1){
        endTable(operation_id, 'Noresult','dataset_operation'); 
      }else {
        endTable(operation_id, 'Failed','dataset_operation');
      }
      console.log(`child process exited with code ${code}`);
  })
}

handler.startOperation = async function(params){
    console.log("Starting")

    console.log(params.query);

    if(!params.query || !params.query.trim()){
        throw `Query is not valid ${params.query}`
    }

    await checkProcessRunning().catch(() => {
      throw 'Another operation is running right now. Please try later.';
  });

    if(await queryExists(params.query,'twitter_operation')){
        throw `Query already exists ${params.query}.`;
    }else{
        console.log('query does not exist');
    }

    let operation_id = uuidv4();
    let sent_path = `${params.query}_${operation_id}.json`;
    let wcloud_path = `${operation_id}_wordcloud.json`;

    sent_path = sent_path.replace(/ /g, '_');
    wcloud_path = wcloud_path.replace(/ /g, '_');

    // insert row for initial operation state
    let operation = await initTable(operation_id,params.query,'twitter_operation').catch(() => {
        throw 'error when inserting query info into database';
    });
    // run the model on python
    await executeModel(params.query, sent_path, wcloud_path, operation_id)
    .then(async () => {
       console.log('Model execution started');
    }).catch(async (err) => {
        console.log(`ERROR while executing model ${err}`);
         await endTable(operation_id, 'Failed','twitter_operation');
    });
    return operation.rows[0];
}

async function executeModel(query, sent_path, wcloud_path, operation_id){
    const scriptPath = path.resolve(__dirname);
    console.log(scriptPath);
    let cmd = `cd ${scriptPath} && bash query2.sh "${query}" "../results/twitter/${sent_path}" "../results/twitter/${wcloud_path}"`;
    console.log(cmd);

    const ls = exec(cmd);
    
    ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    
    ls.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        endTable(operation_id, 'Failed','twitter_operation');
    });
    
    ls.on('close', (code) => {
        if (code == 0){
            endTable(operation_id, 'Completed','twitter_operation',sent_path, wcloud_path);
        }else{
            endTable(operation_id, 'Failed','twitter_operation');
        }
        console.log(`child process exited with code ${code}`);
    })
}


    
async function queryExists(query, table) {
  let text;
  let values;
  if(table === 'twitter_operation') {
   text = `SELECT COUNT(op_id) FROM ${table} WHERE query = $1 AND status = $2`;
   values = [query, 'Failed'];
  }
  else if(table ==='dataset_operation') {
    text = `SELECT COUNT(op_dt_id) FROM ${table} WHERE query = $1 AND status IN ($2, $3)`;
    values = [query, 'Completed','Noresult'];
  }
  let operation = db.query(text, values)
  return operation
    .then(result => {
      let count = parseInt(result.rows[0].count);
      if (count > 0) {
        return true;
      }
      return false;
    }).catch(err => {
      console.log(`ERROR while getting operation by query: ${err}`);
      return false;
    });
}


async function checkProcessRunning() {
  return new Promise((resolve, reject) => {
    exec(`tasklist /FI "IMAGENAME eq python.exe" /NH /FO CSV`, (error, stdout) => {
      if (error) {
        reject(new Error(`Error checking for Python process: ${error}`));
        return;
      }
      const lines = stdout.trim().split("\n");
      for (const line of lines) {
        const fields = line.trim().split(",");
        const imageName = fields[0].replace(/"/g, "");
        
        if (imageName === "python.exe") {
          reject(new Error(`Python process is already running`));
          return;
        }
      }
      resolve();
    });
  });
}

async function initTable(operation_id, query, table) {
  let insertQuery;
  let values;
  
  if (table === 'twitter_operation') {
    insertQuery = `INSERT INTO ${table}(op_id, status, query, start_time) values($1, $2, $3, CURRENT_DATE) RETURNING *`;
    values = [operation_id, 'Pending', query];
  } else if (table === 'dataset_operation') {
    insertQuery = `INSERT INTO ${table}(op_dt_id, status, query, start_time) values($1, $2, $3, CURRENT_DATE) RETURNING *`;
    values = [operation_id, 'Pending', query];
  }
  
  let operation = await db.query(insertQuery, values)
    .then(result => {
      if (result.rowCount > 0) {
        return result;
      } else {
        throw new Error('No rows were inserted.');
      }
    })
    .catch(err => {
      console.log(`ERROR while inserting row: ${err}`);
      throw err;
    });

  return operation;
}


async function endTable(operation_id, status, table, sent_path = null, wcloud_path = null) {
  let updateQuery;
  let values;

  if(table === 'twitter_operation') {
    updateQuery = `UPDATE ${table} SET status = $1, sent_path = $2, wcloud_path = $3, end_time = CURRENT_DATE WHERE op_id = $4`;
    values = [status, sent_path, wcloud_path, operation_id];
  }
  else if (table === 'dataset_operation') {
    updateQuery = `UPDATE ${table} SET status = $1, sent_path = $2, wcloud_path = $3, end_time = CURRENT_DATE WHERE op_dt_id = $4`;
    values = [status, sent_path, wcloud_path, operation_id];
  }

  let operation = db.query(updateQuery,values)
    .then(result => {
      if (result.rowCount > 0) {
        console.log(true);
      } else {
        throw new Error('No rows were updated.');
      }
    })
    .catch(err => {
      console.log(`ERROR while updating row: ${err}`);
      throw err;
    });

  return operation;
}


export default handler;