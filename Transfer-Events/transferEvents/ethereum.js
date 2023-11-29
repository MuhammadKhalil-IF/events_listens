
const { ethers } = require("ethers");
const { createCsvFile,readCsvFile } = require('../util/util');
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




/******************** Get the token-Uri *********************/

async function tokenIds() {
  try {
    const path = '../csv/ganda.csv';
    const valuesAtIndex0 = await readCsvFile(path);
    const numbersArray = valuesAtIndex0.map((str) => Number(str));
    if (isNaN(numbersArray[0])) {
      numbersArray.shift(); 
    }
    // console.log(numbersArray)
    return numbersArray;
  } catch (error) {
    console.error("Error fetching token URI:", error);
  }
}

// function extractNumber(){
// var txt = "#div-name-1234-characteristic:561613213213";
// var numb = txt.match(/\d/g);
// numb = numb.join("");
// console.log(numb);
// }

async function hitAPis() {
  try {
    const base = "https://api.cryptoverse.biz/metadata/";
    const tokensIds = await tokenIds();

    const extractedData = await Promise.all(tokensIds.map(async (tokenID, index) => {
      if (!isNaN(tokenID)) {
        const url = base + tokenID;
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          const { name, image, attributes } = data;
          const extractedObject = {
            name,
            image,
            Zone: null,
            Size: null,
            Type: null,
            POI: []
          };

          attributes.forEach(attribute => {
            const { trait_type, value } = attribute;
            if (trait_type === 'Zone') {
              extractedObject.Zone = value;
            } else if (trait_type === 'Size') {
              extractedObject.Size = value;
            } else if (trait_type === 'Type') {
              extractedObject.Type = value;
            } else if (trait_type === 'POI') {
              extractedObject.POI.push(value);
            }
          });

          return extractedObject;
        } catch  {
          console.log(`Error fetching token metadata for ID ${tokenID}:`);
          return null;
        }
      } else {
        console.warn(`Invalid ID at index ${index}: ${tokenID}`);
        return null;
      }
    }));

    const filteredData = extractedData.filter(item => item !== null);
    console.log(filteredData);
    return filteredData;
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    return [];
  }
}









  tokenIds();
  hitAPis()
// module.exports = {
//   ethereumEvents
// };