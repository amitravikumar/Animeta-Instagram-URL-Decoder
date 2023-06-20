const axios = require("axios");

class Rest {}

Rest.prototype.callApi = async (request) => {
  try {
    //console.log(request);
    let restResult = await axios(request);
    return restResult.data;
  } catch (err) {
    console.log("Error in Rest Call", err);
    return err.response.data;
  }
};

module.exports = {
  Rest: new Rest()
};
