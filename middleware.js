const axios = require('axios')
const https = require('https');
require('dotenv').config();

const headers = {
    'Authorization': `${process.env.APIKEY}`, //add api key
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }

const agent = new https.Agent({
    rejectUnauthorized: false
  });

  const uri = process.env.SO_URI

module.exports = {
  async createObject(payload) {
    try {
      const response = await axios.post(`${uri}`, payload, { headers, httpsAgent: agent })
        if(response.status == 201){
            console.log('Inserted '+payload['SO_NUMBER'])
        }
      return response.data
      
    } catch (error) {
        if (error.response) {
            // The request was made, but the server responded with an error status code
            console.error(`Error response status: ${error.response.status}`);
            console.error(`Error response data:`, error.response.data);
        
            // Check if the error message contains a duplicate key message
            const duplicateKeyMessage = "Database duplicate key in";
            if (
              Array.isArray(error.response.data.message) &&
              error.response.data.message.some(message => message.includes(duplicateKeyMessage))
            ) {
              // Handle the error condition for duplicate key
              console.error(`Duplicate SO NUMBER [${payload['SO_NUMBER']}] error condition detected.`);
            }
          } else if (error.request) {
            // The request was made, but no response was received
            console.error(`No response received:`, error.request);
          } else {
            // Something happened in setting up the request that triggered an error
            console.error(`Error setting up the request:`, error.message);
          }
    }
  }
  ,
  //refactoreds
  async getObject() {
    try {
      const response = await axios.get(`${uri}`, { headers, httpsAgent: agent })
      return response.data
    } catch (error) {
      console.error(error)
    }
  }
};