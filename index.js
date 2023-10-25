const fs = require('fs-extra');
const path = require('path');
const ExcelJS = require('exceljs');
const middleware = require('./middleware');

const unprocessedFolder = './files/unprocessed';
const processedFolder = './files/processed';
const failedFolder = './files/failed';

fs.ensureDirSync(processedFolder);
fs.ensureDirSync(failedFolder);

const processExcelFile = async (file) => {
  const filePath = path.join(unprocessedFolder, file);

  if (path.extname(file) !== '.xlsx') {
    return;
  }

  try {
    console.log(`Processing: ${file}`);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.getWorksheet(1);

    const result = [];

    // Assuming the first row contains headers
    const headers = worksheet.getRow(1).values;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        return; // Skip the header row
      }

      const dataItem = {};

      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber];
        dataItem[header] = cell.value;
      });

      result.push(dataItem);
    });

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
      }
      // Add a 3-second delay before processing the next data item
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await middleware.createObject(payload);
    }

    const destinationPath = path.join(processedFolder, file);
    fs.moveSync(filePath, destinationPath);
    console.log(`Processed: ${file}`);
  } catch (error) {
    const destinationPath = path.join(failedFolder, file);
    fs.moveSync(filePath, destinationPath);
    console.error(`Failed: ${file}`);
    console.error(error);
  }
};

const processNewFilesInUnprocessedFolder = () => {
  fs.watch(unprocessedFolder, { persistent: true }, async (eventType, filename) => {
    if (eventType === 'rename' && filename && path.extname(filename) === '.xlsx') {
      const filePath = path.join(unprocessedFolder, filename);
      if (fs.existsSync(filePath)) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        processExcelFile(filename);
      }
    }
  });
};

fs.readdirSync(unprocessedFolder).forEach(processExcelFile);
processNewFilesInUnprocessedFolder();
