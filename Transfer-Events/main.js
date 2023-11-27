
const fs = require('fs');

const { ethereumEvents } = require('./transferEvents/ethereum'); 
const { PolygonEvents } = require('./transferEvents/polygon'); 

const {dbConnections} = require('./util/pg_Connection')

/************************************************* Create the Empty Directory *************************************************/
const csvDirectoryPath = './csv';
if (!fs.existsSync(csvDirectoryPath)) {
  fs.mkdirSync(csvDirectoryPath);
}


async function main() {
  await dbConnections();
  await ethereumEvents();
  await PolygonEvents();
  
}

main();

// "start": "nodemon main.js",

