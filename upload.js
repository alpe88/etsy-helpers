const fs = require('fs');
const path = require('path');
const { program } = require('commander');
const fetch = require('node-fetch');

program
  .requiredOption('-p, --folder-path <path>', 'Folder path containing files')
  .parse(process.argv);

const ETSY_API_KEY = '<YOUR_ETSY_API_KEY>';
const ETSY_SHOP_ID = '<YOUR_ETSY_SHOP_ID>';
const ETSY_TOKEN = '<YOUR_ETSY_TOKEN>';

// Function to process files in the folder
async function processFiles(folderPath) {
  fs.readdir(folderPath, async (err, files) => {
    if (err) {
      console.error('Error reading folder:', err);
      return;
    }

    // Filter files based on criteria
    const filteredFiles = files.filter(file => {
      const lowercaseFile = file.toLowerCase();
      return (
        (lowercaseFile.endsWith('.jpg') || lowercaseFile.endsWith('.png')) &&
        lowercaseFile.includes('download')
      );
    });

    // Perform actions on filtered files
    for (const file of filteredFiles) {
      const filePath = path.join(folderPath, file);
      console.log(`Processing file: ${file}`);

      // Read the file as binary data
      const fileData = fs.readFileSync(filePath);

      // Upload the file to Etsy
      const fileId = await uploadFileToEtsy(fileData);

      // Create a digital listing on Etsy
      await createDigitalListingOnEtsy(fileId, file);
    }
  });
}

// Uploads a file to Etsy and returns the file ID
async function uploadFileToEtsy(fileData) {
  const url = `https://api.etsy.com/v3/application/shops/${ETSY_SHOP_ID}/listings/unused/files`;

  const headers = {
    'x-api-key': ETSY_API_KEY,
    Authorization: `Bearer ${ETSY_TOKEN}`,
  };

  const requestOptions = {
    method: 'POST',
    headers,
    body: fileData,
  };

  const response = await fetch(url, requestOptions);
  const data = await response.json();

  if (response.ok) {
    return data.data.id;
  } else {
    throw new Error(`Failed to upload file to Etsy: ${data.error.message}`);
  }
}

// Creates a digital listing on Etsy
async function createDigitalListingOnEtsy(fileId, file) {
  const url = `https://api.etsy.com/v3/application/shops/${ETSY_SHOP_ID}/listings`;

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': ETSY_API_KEY,
    Authorization: `Bearer ${ETSY_TOKEN}`,
  };

  const listingData = {
    title: `Digital Listing - ${file}`,
    description: 'Your listing description goes here',
    is_digital: true,
    files: [
      {
        file_id: fileId,
        rank: 1,
        variation_images: [],
      },
    ],
  };

  const requestOptions = {
    method: 'POST',
    headers,
    body: JSON.stringify(listingData),
  };

  const response = await fetch(url, requestOptions);
  const data = await response.json();

  if (response.ok) {
    console.log(`Listing created on Etsy: ${data.data.id}`);
  } else {
    throw new Error(`Failed to create listing on Etsy: ${data.error.message}`);
  }
}
