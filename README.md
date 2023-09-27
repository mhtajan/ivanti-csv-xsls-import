# Ivanti Data Import Node.js Application

## Overview

The Ivanti Data Import Node.js Application is a background tool designed to automate the process of importing data from CSV and Excel files into the Ivanti API. This application is intended to run as a service, periodically importing data without user intervention.

## Features

- Automate the import of data from CSV and Excel files into your Ivanti instance.
- Map CSV/Excel columns to Ivanti API fields for each import job.
- Perform data validation before submission to ensure data integrity.
- Log import progress and errors for auditing purposes.
- Supports various authentication methods for Ivanti API access.
- Configurable scheduling for automated imports.

## Getting Started

### Prerequisites

Before deploying and using the Ivanti Data Import Node.js Application, make sure you have the following:

- Node.js and npm (Node Package Manager) installed on your server.
- Access to the Ivanti API and the necessary authentication credentials.
- CSV/Excel files containing the data to be imported.
- A server or environment for hosting and running the application.

### Installation and Deployment

1. Clone this repository to your server.

   ```bash
   git clone https://github.com/your-repo/ivanti-data-import-app.git
   cd ivanti-data-import-app
   ```

2. Install the required Node.js packages using npm.

   ```bash
   npm install axios dotenv fs-extra xlsx
   ```

3. Create a `.env` file in the root directory of the application and configure it with your environment-specific settings. Here's an example `.env` file:

   ```dotenv
   SO_URI=tenantURL/odata/businessobject/SO_NUMBER_TESTS
   APIKEY=APIKEY
   ```

4. Create the following folders in the application directory to manage processed, unprocessed, and failed files:

   - `processed`: To store successfully processed files.
   - `unprocessed`: To store files waiting for processing.
   - `failed`: To store files that failed to import.

5. Start the application.

   ```bash
   npm start
   ```

6. The application will run in the background, periodically checking for new import jobs and executing them according to the configured schedule.

## Configuration

You can customize the behavior of the application by adjusting the values in the `.env` file. Here are some key environment variables you can set:

- `SO_URI`: The URL of your Ivanti API endpoint.
- `APIKEY`: Your API key for authentication.
