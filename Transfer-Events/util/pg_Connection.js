const { Client } = require('pg');
const { user, host, database, password, port } = require('../config/config');

let client; 

async function dbConnections() {
  try {
    client = new Client({
      user: user,
      host: host,
      database: database,
      password: password,
      port: port,
    });
    await client.connect();
    console.log("Postgres Is Connected With Event Logs!");
  } catch (error) {
    console.error(error);
  }
  
}


async function insertIntoDB(dummyData,tableName) {
    try {
      await client.query('BEGIN');
      for (const data of dummyData) {
        const query = {
          text: `INSERT INTO ${tableName} (token_id, from_address, to_address) VALUES ($1, $2, $3)`,
          values: [data.token_id, data.from_address, data.to_address],
        };
        const res = await client.query(query);
        
        
      }
      await client.query('COMMIT'); 
    } catch (error) {
      await client.query('ROLLBACK'); 
      console.error('Error executing queries', error);
    }
  }

  
module.exports = {
  dbConnections,
  insertIntoDB,
  client
};



