const express = require('express');
const router = express.Router();
const path = require('path');
const entity = require('../Entity/entity');
const controller = require('../Controller/controller');

// file path to Boundary folder
const filepath = path.join(__dirname,'../E-Boundary');


// routes to render web-pages
router.get('/enquiry', function(req,res){
    controller.getContactInfo(function(err, results) {
        if (err) {
            console.error('Error fetching ContactInfo:', err);
            res.status(500).send('Error fetching ContactInfo');
        } else {
            // console.log('Fetched results:', results); // Log the results
            res.render(path.join(filepath, 'E-Enquiry.ejs'), { results: results }); // Pass 'results' to the template
        }
    });
});

router.post('/enquiry', function(req,res){
    const name = req.body.name;
    const email = req.body.email;
    const category = req.body.category;
    const message = req.body.message;
    
    entity.submitEnquiry(name, email, category, message);
    controller.refreshEenquiry(res);
});

router.get('/leavehistory', function(req,res,){
    const accountID = req.session.AccountID;

    entity.getRequestHistory(accountID,function(err, results) {
        if (err) {
            console.log(4);
            console.error('Error fetching RequestHistory:', err);
            res.status(500).send('Error fetching RequestHistory');
        } else {
            console.log(5);
            // console.log('Fetched results:', results); // Log the results
            res.render(path.join(filepath, 'E-LeaveHistory.ejs'), { results: results }); // Pass 'results' to the template
        }
    });
});

router.get('/profileedit', function(req,res){
    res.render(path.join(filepath, 'E-ProfileEdit.ejs'));
});

router.post('/profileedit', function(req, res, callback){
    const accountID = req.session.AccountID;
    // console.log(accountID);
    const name = req.body.updateaccountname;
    const email = req.body.updateaccountEmail;
    const number = req.body.personalNum;
    const password = req.body.updateaccountPassword;

    entity.updateProfile(accountID, name, email, number, password, callback);
    res.redirect('/Employee/profileview');

});

router.get('/profileview', function(req,res){
    const accountID  = req.session.AccountID;
    entity.getProfile(accountID, function(err,results) {
        if (err) {
            console.error('Error fetching profile info', err);
            res.status(500).send('Error fetching profile info');
        } else {
            res.render(path.join(filepath, 'E-ProfileView.ejs'), { results: results });
        }
    });
});

router.get('/requestleave', function(req,res){
    res.render(path.join(filepath, 'E-RequestLeave.ejs'));
});

router.post('/requestleave', function (req, res, callback) {
    const accountID = req.session.AccountID;
    const UEN = req.session.UEN;
    const department = req.session.Department;
    const type = req.body.type;
    const start = req.body.startdate;
    const end = req.body.enddate;
    const reason = req.body.reason;
    let mc = null;

    // Check if a file has been uploaded
    if (req.files && req.files.mcFile) {
        mc = req.files.mcFile.data; // Use the raw binary data
    }

    entity.submitRequest(accountID, type, start, end, reason, mc, UEN, department, function (err, result) {
        if (err) {
            // Handle the error here
            console.error(err);
            // You can send an error response if needed
            res.status(500).send('Internal Server Error');
        } else {
        // Redirect to another page or render a success page
        entity.getRequestHistory(accountID,function(err, results) {
            if (err) {
                console.log(4);
                console.error('Error fetching RequestHistory:', err);
                res.status(500).send('Error fetching RequestHistory');
            } else {
                console.log(5);
                console.log('Fetched results:', results); // Log the results
                res.render(path.join(filepath, 'E-LeaveHistory.ejs'), { results: results }); // Pass 'results' to the template
            }
        });
        }
    });
});

router.get('/reviews', function(req,res){
    res.render(path.join(filepath, 'E-Reviews.ejs'));
});

router.post('/reviews', function(req,res){
    const name = req.body.name;
    const rating = req.body.rating;
    const category = req.body.category;
    const message = req.body.reviewmessage;
    const UEN = req.session.UEN;

    entity.submitReview(name, category, rating, message, UEN);
    controller.refreshEreviews(res);
});

router.get('/schedules', function (req, res) {

    const accountID = req.session.AccountID;

    controller.getSchedule(accountID)
      .then(eventData => {
        const colorList = [
            "#FFD9C4", // Light Salmon
            "#D1FFD1", // Pastel Green
            "#DCE3FF", // Light Periwinkle
            "#FFD4FF", // Light Lavender
            "#FFFFC9", // Pale Yellow
            "#C9FFFF", // Light Aquamarine
            "#FFD4E2", // Light Pink
            "#CFFFD3", // Light Mint
            "#FFD1C9", // Light Coral
            "#C9C7FF"  // Light Lilac
          ];
            for (let i = 0; i < eventData.length; i++) {
                const color = i % colorList.length; // Get the index of the color to use
                eventData[i].color = colorList[color]; // Assign the color to the object
              };
              // console.log(eventData);

        res.render(path.join(filepath, 'E-Schedules.ejs'), { eventData });
      })
      .catch(error => {
        res.status(500).send('Error fetching event data');
      });
});
  


module.exports = router;