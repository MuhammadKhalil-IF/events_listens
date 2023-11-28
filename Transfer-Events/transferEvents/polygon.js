const { createAlchemyWeb3 } = require('@alch/alchemy-web3');
const { polygonContractABI, polygonContractAddress, rpcURL } = require('../config/config');
const {createCsvFile} =require('../util/util');
const {insertIntoDB}=require('../util/pg_Connection')
const web3 = createAlchemyWeb3(rpcURL);
const contract = new web3.eth.Contract(polygonContractABI, polygonContractAddress);

async function fetchAndStoreEvents(fromBlock, latestBlock, chunkSize = 10000) {
  let from = fromBlock;
  const csvData = [];

  try {
    const idMap = new Map(); // To store the last occurrence of each ID

    while (from <= latestBlock) {
      const to = Math.min(from + chunkSize - 1, latestBlock);
      const events = await contract.getPastEvents('Transfer', {
        fromBlock: from,
        toBlock: to,
      });

      for (const event of events) {
        const tokenId = event.returnValues.tokenId;

        // Update the last occurrence of each ID
        idMap.set(tokenId, {
          token_id: tokenId,
          from_address: event.returnValues.from,
          to_address: event.returnValues.to,
        });
      }

      console.log(`Processed events from block ${from} to block ${to}. Total events: ${idMap.size}`);
      from += chunkSize;
    }

    // Store the last occurrence of each ID in csvData
    for (const idData of idMap.values()) {
      csvData.push(idData);
    }

    return csvData;
  } catch (error) {
    console.error('Error fetching or storing events:', error);
    throw error;
  }
}


async function PolygonEvents() {
  const fromBlock = 29653422;
  const latestBlock = await web3.eth.getBlockNumber();

  const csvData = await fetchAndStoreEvents(fromBlock, latestBlock);

  if (csvData.length > 0) {
    const fields = ['token_id', 'from_address', 'to_address'];
    createCsvFile(csvData, fields, `polygonEventListen_${fromBlock}_${latestBlock}`);
    insertIntoDB(csvData, "polygon_events");
    console.log(`CSV File Created Successfully for range ${fromBlock} to ${latestBlock}. Total events: ${csvData.length}`);
  } else {
    console.log(`No events found for the entire range from ${fromBlock} to ${latestBlock}`);
  }
}

module.exports = {
  PolygonEvents,
};





































































// const { createAlchemyWeb3 } = require('@alch/alchemy-web3');
// const { polygonContractABI, polygonContractAddress, rpcURL } = require('../config/config');
// const { createCsvFile } = require('../util/util');
// const {insertIntoDB}=require('../util/pg_Connection')

// const web3 = createAlchemyWeb3(rpcURL);
// const contract = new web3.eth.Contract(polygonContractABI, polygonContractAddress);

// async function PolygonEvents() {
//   try {
//     const events = await contract.getPastEvents('Transfer', {
//       fromBlock: 		29653422,
//        toBlock: 	"latest",
//     });
//     const tokenMap = new Map();
//     events.forEach(event => {
//       const tokenId = event.returnValues.tokenId;
//       tokenMap.set(tokenId, {
//         token_id: tokenId,
//         from_address: event.address,
//         to_address: event.returnValues.to,
//         blockNumber: event.blockNumber,
//       });
//     });
//     const filteredEvents = Array.from(tokenMap.values());


//     insertIntoDB(filteredEvents,"polygon_events");


//     const fields = ['token_id', 'from_address', 'to_address'];
//     createCsvFile(filteredEvents, fields, 'polygonEventListen');
//   } catch (error) {
//     console.error('Error fetching Transfer events:', error);
//   }
// }

// module.exports = {
//   PolygonEvents
// };