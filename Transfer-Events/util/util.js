const fs = require('fs');
const path = require('path');
const { parseAsync } = require('json2csv');
const { parse } = require("csv-parse");

function createCsvFile(data, fields, fileName) {
  const jsonData = JSON.stringify(data, null, 2);
  const directoryPath = path.join(__dirname, '..', 'csv');
  const csvFilePath = path.join(directoryPath, `${fileName}.csv`);
  /***
   * Check if the directory exists
   ***/
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }

  parseAsync(jsonData, { fields })
    .then(csv => {
      fs.writeFile(csvFilePath, csv, 'utf8', (err) => {
        if (err) {
          console.error('Error writing CSV file:', err);
        } else {
          console.log(`**** ${fileName} CSV File Created Successfully ****`);
        }
      });
    })
    .catch(err => console.error('Error parsing JSON to CSV:', err));
}



function readCsvFile(path) {
  return new Promise((resolve, reject) => {
    const firstColumnValues = [];

    fs.createReadStream(path)
      .pipe(parse({ delimiter: ',' }))
      .on('data', function (row) {
        if (row && row.length > 0) {
          firstColumnValues.push(row[0].trim()); 
        }
      })
      .on('end', function () {
        resolve(firstColumnValues); 
      })
      .on('error', function (error) {
        reject(error); 
      });
  });
}
module.exports = {
  createCsvFile,
  readCsvFile
};
