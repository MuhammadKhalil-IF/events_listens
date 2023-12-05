
const fs = require('fs');

const { ethereum} = require('./transferEvents/ethereum'); 
const { polygon } = require('./transferEvents/polygon'); 
const {dbConnections} = require('./util/pg_Connection');
const {client,excelDataToDB}=require('./util/pg_Connection');

/************************************************* Create the Empty Directory *************************************************/
const csvDirectoryPath = './csv';

if (!fs.existsSync(csvDirectoryPath)) {
  fs.mkdirSync(csvDirectoryPath);
}

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

/****
 * if you want to read any file convert it into csv and update  put updated data into database using these 2 line of code 
 * 
 * dbConnections();
 * UpdateDataExcelToDB('ethereum_events', './csv/lands_data.csv');
 */


async function main() {
  await dbConnections();
  await ethereum();
  await polygon();
  // await UpdateDataExcelToDB('ethereum_events', './csv/lands_data.csv');
  // await UpdateDataExcelToDB('ethereum_events', './csv/lands_data.csv');
  
}

main().catch((error) => {
  console.error('Error in main function:', error);
});




// "start": "nodemon main.js",

