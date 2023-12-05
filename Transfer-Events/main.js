
const fs = require('fs');

const { ethereum} = require('./transferEvents/ethereum'); 
const { polygon } = require('./transferEvents/polygon'); 
const {dbConnections} = require('./util/pg_Connection')

/************************************************* Create the Empty Directory *************************************************/
const csvDirectoryPath = './csv';

if (!fs.existsSync(csvDirectoryPath)) {
  fs.mkdirSync(csvDirectoryPath);
}


async function main() {
  await dbConnections();
  // await ethereum();
  await polygon();
  
}

main();

// "start": "nodemon main.js",

