const { ethers } = require("ethers");
const { EthContractABI, EthContractAddress } = require('../config/config');
const { createCsvFile } = require('../util/util');
const {insertIntoDB}=require('../util/pg_Connection')

const provider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/DYuH74SNIuDXG6YYdE1tV-5gohEkVAs-");
const contract = new ethers.Contract(EthContractAddress, EthContractABI, provider);

async function ethereumEvents() {
  try {
    const events = await contract.queryFilter("Transfer");
    const filteredEvents = events.map(event => {
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
      return {
        token_id: decimalValue,
        from_address: event.address,
        to_address: toAddress,
      };
    });
    
    insertIntoDB(filteredEvents,"ethereum_events");
    const fields = ['token_id', 'from_address', 'to_address'];
    createCsvFile(filteredEvents, fields, 'ethereumEventListen');
  } catch (error) {
    console.error('Error fetching Transfer events:', error);
  }
}

module.exports = {
  ethereumEvents
};
