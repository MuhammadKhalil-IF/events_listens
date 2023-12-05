const { Client } = require('pg');
const { user, host, database, port } = require('../config/config');
const fs = require('fs');
const { parse } = require("csv-parse");


let client; 
/*********************************************** DB-connection ***********************************************/
async function dbConnections() {
  try {
    client = new Client({
      user: user,
      host: host,
      database: database,
      password: 'root',
      port: port,
    });
    await client.connect();

    console.log("Postgres Is Connected With Event Logs!");
  } catch (error) {
    console.error(error);
  }
  
}

/************************************************ Insertion ***********************************************/
async function insertIntoDB(eventslogs,tableName) {
  try {
    await client.query('BEGIN');
    for (const data of eventslogs) {
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

/************************************************* Update  ************************************************/
async function updateData(eventslogs, tableName) {
  try {
    await client.query('BEGIN');
    for (const data of eventslogs) {
      const query = {
        text: `
          UPDATE ${tableName} 
          SET name = $2, image = $3, description = $4, zone = $5, size = $6, type = $7, poi = $8
          WHERE token_id = $1;
        `,
        values: [
          data.token_id,
          data.name,
          data.image,
          data.description,
          data.Zone,
          data.Size,
          data.Type,
          data.POI
        ],
      };
      const res = await client.query(query);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error executing queries', error);
  }
}

/********************************************* getTokenIdsFromTable  ***************************************/
async function getTokenIdsFromTable(tableName) {
  try {
    await client.query('BEGIN');
    const query = {
      text: `SELECT token_id FROM ${tableName}`,
    };
    const result = await client.query(query);
    const record=result.rows.map(row => row.token_id);
    return record
 
  } catch (error) {
    console.error('Error retrieving token IDs', error);
    throw error;
  }
}
/*********************************************** getAllData  ***********************************************/

async function getAllData(tableName) {
  try {
    const query = {
      text: `SELECT * FROM ${tableName}`, 
    };
    const result = await client.query(query);
    const records = result.rows; 
    return records;
  } catch (error) {
    console.error('Error retrieving data', error);
    throw error;
  }
}




/************************************************ READ the CSV *********************************************/
function readCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const sizeAndTokenIds = [];
    let isFirstRow = true;
    fs.createReadStream(filePath)
      .pipe(parse({ delimiter: ',' }))
      .on('data', function (row) {
        if (isFirstRow) {
          isFirstRow = false;
          return;
        }

        const size = row[10] ? row[10].trim() : ''; 
        const token_id = row[12] ? row[12].trim() : ''; 

        sizeAndTokenIds.push({ size, token_id });
      })
      .on('end', function () {
        resolve(sizeAndTokenIds);
      })
      .on('error', function (error) {
        reject(error);
      });
  });
}
/****************************************** Update single column Excel *************************************/
async function excelDataToDB(tableName, filePath) {
  try {
    const eventslogs = await readCsvFile(filePath); // Read CSV file
    await client.query('BEGIN');

    for (const data of eventslogs) {
      const query = {
        text: `
          UPDATE ${tableName} 
          SET xlsx_size = $2
          WHERE token_id = $1;
        `,
        values: [
          data.token_id,
          data.size 
        ],
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
  client,
  dbConnections,
  getTokenIdsFromTable,
  insertIntoDB,
  updateData,
  excelDataToDB,
  getAllData,
  
};



