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



async function getData(){
  await dbConnections();
  await generateCSVFromDB("ethereum_events","EthereumFetchFromDB");
  await generateCSVFromDB("polygon_events","PolygonFetchFromDB");
}


getData()
module.exports = {
  createCsvFile,
  generateCSVFromDB
  
};
