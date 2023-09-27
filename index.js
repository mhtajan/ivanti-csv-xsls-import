const fs = require('fs-extra');
const path = require('path');
const XLSX = require('xlsx');
const middleware = require('./middleware');

const unprocessedFolder = './files/unprocessed';
const processedFolder = './files/processed';
const failedFolder = './files/failed';

// Ensure the "processed" and "failed" folders exist
fs.ensureDirSync(processedFolder);
fs.ensureDirSync(failedFolder);

const processExcelFile = async (file) => {
  const filePath = path.join(unprocessedFolder, file);

  if (path.extname(file) !== '.xlsx') {
    return; // Skip files with extensions other than .xlsx
  }

  try {
  
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });


    const headers = data.shift();

    // Create an array of objects with headers as keys and rows as values
    const result = data.map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });


    console.log(`Processing: ${file}`);

    for (const dataItem of result) {
      const payload = {
        description: dataItem.Description,
        SO_NUMBER: dataItem['Sales Doc.'],
        clientName: dataItem['Client Name'],
        billToPartyCode: dataItem['Bill-To Party Code'],
        billParty: dataItem['Bill-To Party'],
        PO_NUMBER: dataItem['PO Number'],
        currency: dataItem.Currency,
        ContactPerson: dataItem['Contact Person to Receive the Invoice'],
        contactNumber: dataItem['Contact Number'],
        addressOfInvoice: dataItem['Address to send the invoice'],
        emailAddress: dataItem['E-Mail Address'],
      };

      // Add a 3-second delay before processing the next data item
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await middleware.createObject(payload);
    }

    // If processing is successful, move the file to the processed folder
    const destinationPath = path.join(processedFolder, file);
    fs.moveSync(filePath, destinationPath);
    console.log(`Processed: ${file}`);
  } catch (error) {
    // If an error occurs during processing, move the file to the failed folder
    const destinationPath = path.join(failedFolder, file);
    fs.moveSync(filePath, destinationPath);
    console.error(`Failed: ${file}`);
    console.error(error); // Log the error for debugging purposes
  }
};

// Function to process new files in the unprocessed folder
const processNewFilesInUnprocessedFolder = () => {
  fs.watch(unprocessedFolder, { persistent: true }, async (eventType, filename) => {
    if (eventType === 'rename' && filename && path.extname(filename) === '.xlsx') {
      // Check if the file actually exists before processing it
      const filePath = path.join(unprocessedFolder, filename);
      if (fs.existsSync(filePath)) {
        // Add a 3-second delay before processing the new file
        await new Promise((resolve) => setTimeout(resolve, 3000));
        processExcelFile(filename);
      }
    }
  });
};



fs.readdirSync(unprocessedFolder).forEach(processExcelFile);
processNewFilesInUnprocessedFolder();
