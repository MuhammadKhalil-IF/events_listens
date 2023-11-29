const ethers = require("ethers");

const { EthContractABI, EthContractAddress ,rpcURL} = require('../config/config');


async function getTransfer() {
    try {
        const provider = new ethers.providers.JsonRpcProvider('https://eth-mainnet.g.alchemy.com/v2/DYuH74SNIuDXG6YYdE1tV-5gohEkVAs-');
        const contract = new ethers.Contract(EthContractAddress, EthContractABI, provider);

        contract.on("Transfer", (from, to, value, event) => {
            let transferEvent = {
                from: from,
                to: to,
                value: value,
                eventData: event,
            }
            console.log(JSON.stringify(transferEvent, null, 4))
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

getTransfer();
