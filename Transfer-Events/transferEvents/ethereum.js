const { ethers } = require("ethers");
const { createCsvFile } = require('../util/util');
const {insertIntoDB}=require('../util/pg_Connection')
const { EthContractABI, EthContractAddress } = require('../config/config');
const provider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/DYuH74SNIuDXG6YYdE1tV-5gohEkVAs-");
const contract = new ethers.Contract(EthContractAddress, EthContractABI, provider);


/************************************************* Events Listener *************************************************/
async function ethereumEvents() {
    try {
      const events = await contract.queryFilter("Transfer");
      const filteredEventsMap = new Map();
      const multipleOccurrenceIds = new Map();
      events.forEach(event => {
        const args = event.args;
        let decimalValue = null;
        if (args && Array.isArray(args)) {
          const bigNumberArg = args.find(arg => arg && arg._hex);
  
          if (bigNumberArg) {
            const hexValue = bigNumberArg._hex;
            decimalValue = ethers.BigNumber.from(hexValue).toString();
          }
        }
        const toAddress = ethers.utils.getAddress("0x" + event.topics[2].slice(26));
        const currentEvent = {
          token_id: decimalValue,
          from_address: event.address,
          to_address: toAddress,
          blockNumber: event.blockNumber,
        };
        if (filteredEventsMap.has(decimalValue)) {
          if (!multipleOccurrenceIds.has(decimalValue)) {
            multipleOccurrenceIds.set(decimalValue, [filteredEventsMap.get(decimalValue)]);
          }
          multipleOccurrenceIds.get(decimalValue).push(currentEvent);
        }
        filteredEventsMap.set(decimalValue, currentEvent);
      });
  
      const filteredEvents = Array.from(filteredEventsMap.values());
      
  
      const multipleOccurrences = Array.from(multipleOccurrenceIds.values())
        .filter(events => events.length > 1);
      
      console.log("IDs occurring multiple times:", multipleOccurrences);
      insertIntoDB(filteredEvents, "ethereum_events");
      const fields = ['token_id', 'from_address', 'to_address'];
      createCsvFile(filteredEvents, fields, 'ethereumEventListen');
      console.log("*********** ENDED ************")
    } catch (error) {
      console.error('Error fetching Transfer events:', error);
    }
  }
  

module.exports = {
  ethereumEvents
};
