const {client} = require('./pg_Connection');
const fs = require('fs');
const { parse } = require("csv-parse");

/************************************************* READ the CSV *************************************************/
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
  /************************************************* Update single column Excel *************************************************/
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


   /************************************************* Update single column Excel *************************************************/



  
async function UpdateDataExcelToDB(tableName,filePath) {
  try {
    await excelDataToDB(tableName, filePath);
    console.log('Update completed successfully');
  } catch (error) {
    console.error('Error during update:', error);
  } finally {
    if (client) {
      await client.end(); 
    }
  }
}







async function readCsvandUpdateDB() {
  await UpdateDataExcelToDB('ethereum_events', './csv/lands_data.csv');
  await UpdateDataExcelToDB('ethereum_events', './csv/lands_data.csv');
  
}


readCsvandUpdateDB();