async function listenAndStoreEvents(fromBlock, chunkSize = 10000) {
  const latestBlock = await web3.eth.getBlockNumber();
  let currentBlock = fromBlock;

  while (currentBlock <= latestBlock) {
    const toBlock = Math.min(currentBlock + chunkSize - 1, latestBlock);
    const events = await getAllTransferEvents(currentBlock, toBlock);
    await storeEventsInDB(events);

    console.log(`Processed events from block ${currentBlock} to ${toBlock}`);
    currentBlock += chunkSize;
  }
}

async function getAllTransferEvents(fromBlock, toBlock) {
  const events = await contract.getPastEvents('Transfer', {
    fromBlock: fromBlock,
    toBlock: toBlock,
  });
  return events;
}

async function storeEventsInDB(events) {
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

  const eventData = Array.from(tokenMap.values()).map(event => ({
    token_id: event.token_id,
    from_address: event.from_address,
    to_address: event.to_address,
    blockNumber: event.blockNumber,
  }));

  try {
    // Insert eventData into the database using your DB insertion method
    await insertIntoDB(eventData, 'polygon_events');
  } catch (error) {
    console.error('Error storing events in the database:', error);
    throw error;
  }
}

// Usage
const fromBlock = 29653422;
listenAndStoreEvents(fromBlock, 10000); // Start fetching events in chunks of 10,000
