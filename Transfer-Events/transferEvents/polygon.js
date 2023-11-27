const { createAlchemyWeb3 } = require('@alch/alchemy-web3');
const { polygonContractABI, polygonContractAddress, rpcURL } = require('../config/config');
const {createCsvFile} =require('../util/util');
const {insertIntoDB} = require('./util/pg_Connection')
const web3 = createAlchemyWeb3(rpcURL);
const contract = new web3.eth.Contract(polygonContractABI, polygonContractAddress);

async function getAllTransferEvents(fromBlock, toBlock, chunkSize = 1000) {
  let from = fromBlock;
  const allEvents = [];
  try {
    while (from <= toBlock) {
      const to = Math.min(from + chunkSize - 1, toBlock);
      const events = await contract.getPastEvents('Transfer', {
        fromBlock: from,
        toBlock: to,
      });

      allEvents.push(...events);
      from += chunkSize;

      console.log(`Fetched events from block ${from - chunkSize} to block ${to}`);
    }
    return allEvents;
  } catch (error) {
    console.error('Error fetching Transfer events:', error);
    throw error;
  }
}

async function PolygonEvents() {
  const fromBlock =   29653422; 
  const latestBlock = 30200001; 
  //   const latestBlock = await web3.eth.getBlockNumber(); 
  const events = await getAllTransferEvents(fromBlock, latestBlock);
  console.log(`Total events fetched: ${events.length}`);

  const tokenMap = new Map();

  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    const tokenId = event.returnValues.tokenId;

    if (!tokenMap.has(tokenId)) {
      tokenMap.set(tokenId, {
        token_id: tokenId,
        from_address: event.address,
        to_address: event.returnValues.to,
        blockNumber: event.blockNumber,
      });
    }
  }

  const csvData = Array.from(tokenMap.values())
  .map(event => ({
    token_id: event.token_id,
    from_address: event.from_address,
    to_address: event.to_address,
  }));



  const fields = ['token_id', 'from_address', 'to_address'];
  insertIntoDB( csvData,"polygon_events")
  createCsvFile(csvData, fields, 'polygonEventListen');


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