const { createAlchemyWeb3 } = require('@alch/alchemy-web3');
const { polygonContractABI, polygonContractAddress, rpcURL } = require('../config/config');

const web3 = createAlchemyWeb3(rpcURL);
const contract = new web3.eth.Contract(polygonContractABI, polygonContractAddress);

async function getAllTransferEvents(fromBlock, toBlock, chunkSize = 1000) {
  let from = fromBlock;
  const allEvents = [];

  try {
    const promises = [];

    while (from <= toBlock) {
      const to = Math.min(from + chunkSize - 1, toBlock);
      const eventsPromise = contract.getPastEvents('Transfer', {
        fromBlock: from,
        toBlock: to,
      });

      promises.push(eventsPromise);
      from += chunkSize;
    }

    const eventChunks = await Promise.all(promises);
    eventChunks.forEach(events => {
      const transferEvents = events.map(event => ({
        token_id: event.returnValues.tokenId,
        from_address: event.address,
        to_address: event.returnValues.to,
        blockNumber: event.blockNumber,
      }));
      allEvents.push(...transferEvents);
    });

    console.log(`Total events fetched: ${allEvents.length}`);
    return allEvents;
  } catch (error) {
    console.error('Error fetching Transfer events:', error);
    throw error;
  }
}

async function PolygonEvents() {
  const fromBlock = 29653422; 
  const latestBlock = await web3.eth.getBlockNumber(); 

  const events = await getAllTransferEvents(fromBlock, latestBlock);
  return events;
}




PolygonEvents();
// module.exports = {
//   PolygonEvents,
// };
