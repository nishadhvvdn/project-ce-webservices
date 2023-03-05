var express = require('express');
var router = express.Router();
var axios = require('axios')
var https = require("https");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

router.get('/', async function  (req, res){
  try{ 
    var options = {
      'method': 'GET',
      'url': process.env.admin_url,
      'headers': {
        'X-API-KEY': process.env.admin_api_key,
        'Content-Type': 'application/json'
      },
      'httpsAgent': httpsAgent
    };
    const result = await axios(options);
    res.send(result.data)
  }
catch(e){
  res.json({
    "type": false,
    "Message": "Something went wrong : " + e.name + " " + e.message
})
}
})

module.exports = router;
