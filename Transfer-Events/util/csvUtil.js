const fs = require('fs');
const path = require('path');
const { parseAsync } = require('json2csv');
const { parse } = require("csv-parse");
const fsPromise = require('fs').promises;
const { getAllData,dbConnections} = require('./pg_Connection'); 
/************************************************* CREATE the CSV *************************************************/
async function createCsvFile(data, fields, fileName) {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    const directoryPath = path.join(__dirname, '..', 'csv');
    const csvFilePath = path.join(directoryPath, `${fileName}.csv`);

    try {
      await fsPromise.access(directoryPath);
    } catch (err) {
      await fsPromise.mkdir(directoryPath, { recursive: true });
    }

    const csv = await parseAsync(jsonData, { fields });
    await fsPromise.writeFile(csvFilePath, csv, 'utf8');
    console.log(`**** ${fileName} CSV File Created Successfully ****`);
  } catch (error) {
    console.error('Error writing CSV file:', error);
  }
}

/************************************************* Merge the CSV *************************************************/
async function generateCSVFromDB(tableName, fileName) {
  try {
    const dataFromDB = await getAllData(tableName);
    console.log(dataFromDB);
    const fields = ['token_id', 'from_address', 'to_address', 'name', 'image', 'description', 'zone', 'size', 'type', 'poi','xlsx_size']; 
    await createCsvFile(dataFromDB, fields, fileName);
  } catch (error) {
    console.error('Error generating CSV from database:', error);
  }
}

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



/***
 * if the data from event $ from the apis properly fetched then you can just execute these 5 line to make csvs with database tables fields
 * 
 * async function getData(){
 * await dbConnections();
 * await generateCSVFromDB("ethereum_events","EthereumFetchFromDB");
 * await generateCSVFromDB("polygon_events","PolygonFetchFromDB");
 *  }
 * 
 * 
 */


module.exports = {
  createCsvFile,
  generateCSVFromDB
  
};
