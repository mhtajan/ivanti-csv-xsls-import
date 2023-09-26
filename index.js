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
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);

    // Extract the first sheet (you can modify this if needed)
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert the worksheet to an array of objects, using the first row as headers
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Remove the first element (headers) from the data array
    const headers = data.shift();

    // Create an array of objects with headers as keys and rows as values
    const result = data.map((row) => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });

    // Perform your processing logic here (e.g., logging or further operations)
    console.log(`Processing: ${file}`);
    //console.log(result);

    // Process each data object asynchronously
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

// Process Excel files in the unprocessed folder
fs.readdirSync(unprocessedFolder).forEach(processExcelFile);

console.log('Processing complete.');
