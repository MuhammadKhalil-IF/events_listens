const { createAlchemyWeb3 } = require('@alch/alchemy-web3');
const { polygonContractABI, polygonContractAddress, rpcURL } = require('../config/config');
const { createCsvFile } = require('../util/util');
const {insertIntoDB}=require('../util/pg_Connection')

const web3 = createAlchemyWeb3(rpcURL);
const contract = new web3.eth.Contract(polygonContractABI, polygonContractAddress);

async function PolygonEvents() {
  try {
    const events = await contract.getPastEvents('Transfer', {
      fromBlock: 		50129140,
       toBlock: 	50294125,
      // toBlock: 50259424,
    });
    const tokenMap = new Map();
    events.forEach(event => {
      const tokenId = event.returnValues.tokenId;
      tokenMap.set(tokenId, {
        token_id: tokenId,
        from_address: event.address,
        to_address: event.returnValues.to,
        // blockNumber: event.blockNumber,
      });
    });
    const filteredEvents = Array.from(tokenMap.values());


    insertIntoDB(filteredEvents,"polygon_events");


    const fields = ['token_id', 'from_address', 'to_address'];
    createCsvFile(filteredEvents, fields, 'polygonEventListen');
  } catch (error) {
    console.error('Error fetching Transfer events:', error);
  }
}

module.exports = {
  PolygonEvents
};
