
const {getTokenIdsFromTable,updateData}=require('../util/pg_Connection')
const { createCsvFile } = require('../util/csvUtil');

/******* Opertion which extract the name,image,POI  fields data  *******/
const extractNameAndImage = (originalName, originalImage, originalType, originalPOI) => {
  const nameMatch = originalName.match(/^([^#]+)/); // Updated regex pattern to capture only the desired part before '#'
  const imageNameMatch = originalImage.match(/\/([^/]+)$/);
  const name = nameMatch ? nameMatch[1].trim() : null; // Use captured group [1] for the name
  const image = imageNameMatch ? imageNameMatch[1].trim() : null;
  const type = Array.isArray(originalType) ? originalType.join(', ') : originalType;
  const POI = Array.isArray(originalPOI) ? originalPOI.join(', ') : originalPOI;
  return { name, image, type, POI };
};

async function apiResponses(tableName,filename) {
    try {
      const tokensIds = await getTokenIdsFromTable(tableName)
      const base = "https://api.cryptoverse.biz/metadata/";
      const extractedData = [];
      // console.log(tokensIds)
  for (let index = 0; index < tokensIds.length; index++) {
      const tokenID = tokensIds[index];
      console.log(index,"/",tokensIds.length)
      if (!isNaN(tokenID)) {
      const url = base + tokenID;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        const { name, image,description, attributes } = data;
        const extractedObject = {
          token_id: tokenID, 
          name,
          image,
          description,
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
        const{name: extractedName, image: extractedImage, type: extractedType, POI: extractedPOI} = extractNameAndImage(name, image, extractedObject.Type, extractedObject.POI);
        extractedObject.name = extractedName;
        extractedObject.image = extractedImage;
        extractedObject.Type = extractedType;
        extractedObject.POI = extractedPOI;
        extractedData.push(extractedObject);

       
      } catch {
        console.log(`Error fetching token metadata for ID ${tokenID}:`);
        extractedData.push(null);
      }
    } else {
      console.warn(`Invalid ID at index ${index}: ${tokenID}`);
      extractedData.push(null);
    }
  }
      const filteredData = extractedData.filter(item => item !== null);
      const fields = ['token_id','name', 'image', 'description','Zone','Size','Type','POI'];
      // await  createCsvFile(filteredData, fields, filename);
      await  updateData(filteredData, tableName);
      // console.log(filteredData);
      return filteredData;
    } catch (error) {
      console.error("Error fetching token metadata:", error);
      return [];
    }
  }

module.exports = {
       apiResponses
};