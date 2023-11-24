
const { Client } = require('pg');
const {client} =require('../util/pg_Connection');

async function insertIntoDB(dummyData) {
    try {
      await client.query('BEGIN');
      for (const data of dummyData) {
        const query = {
          text: `INSERT INTO polygon_events (token_id, from_address, to_address) VALUES ($1, $2, $3)`,
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
    insertIntoDB
  };
  