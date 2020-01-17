const nodeSSPI = require('node-sspi');
//const ntlm = require('express-ntlm');

 // SSO configuration here
module.exports = function(express) {

   // express.use(ntlm());

   var nodeSSPIObj = new nodeSSPI({
        retrieveGroups: false,
        offerSSPI: false
    });

    // executes multiple time -- why??
	express.use(function (req, res, next) {
       // req.connection = {};
      //  req.connection.user = 'test';
		//next();
       nodeSSPIObj.authenticate(req, res, function (err) {            
            res.finished || next();          
        });
		
    });

}
