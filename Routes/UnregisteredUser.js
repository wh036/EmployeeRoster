const express = require('express');
const router = express.Router();
const path = require('path');
const entity = require('../Entity/entity');
const controller = require('../Controller/controller');
const nodemailer = require('nodemailer');

// file path to Boundary folder
const filepath = path.join(__dirname,'../UR-Boundary');


// routes to render web-pages
router.get('/', function (req, res) {
    controller.getURdescription(function (err, results) {
        if (err) {
            console.error('Error fetching URdescription:', err);
            return res.status(500).send('Error fetching URdescription');
        }

        controller.getURfeatures(function (err, featuresresults) {
            if (err) {
                console.error('Error fetching URfeatures:', err);
                return res.status(500).send('Error fetching URfeatures');
            }

            controller.getURreview(function (err, reviewresults) {
                if (err) {
                    console.error('Error fetching URreview:', err);
                    return res.status(500).send('Error fetching URreview');
                }

            // If both queries were successful, render the EJS template
            res.render(path.join(filepath, 'UR-Product.ejs'), { results: results, featuresresults: featuresresults, reviewresults: reviewresults });
        });
        });
    });
});

router.get('/enquiry', function(req,res){

    controller.getContactInfo(function(err, results) {
        if (err) {
            console.error('Error fetching ContactInfo:', err);
            res.status(500).send('Error fetching ContactInfo');
        } else {
            // console.log('Fetched results:', results); // Log the results
            res.render(path.join(filepath, 'UR-Enquiry.ejs'), { results: results }); // Pass 'results' to the template
        }
    });
});

router.post('/enquiry', function(req,res){
    const name = req.body.name;
    const email = req.body.email;
    const category = req.body.category;
    const message = req.body.message;
    console.log(name);
    console.log(email);
    console.log(category);
    console.log(message);
    
    entity.submitEnquiry(name, email, category, message);
    res.redirect('/enquiry');
});

router.get('/reviews', function(req,res){
    controller.getReviews(function(err, results) {
        if (err) {
            console.error('Error fetching Reviews:', err);
            res.status(500).send('Error fetching Reviews');
        } else {
            // console.log('Fetched results:', results); // Log the results
            res.render(path.join(filepath, 'UR-Reviews.ejs'), { results: results }); // Pass 'results' to the template
        }
    });
});

router.post('/reviews', function(req,res){
    const name = req.body.name;
    const rating = req.body.rating;
    const category = req.body.category;
    const message = req.body.reviewmessage;

    entity.submitReview(name, category, rating, message);
    res.redirect('/reviews');
});

router.get('/registration', function(req,res){
    res.render(path.join(filepath, 'UR-Registration.ejs'));
});

router.post('/registration', function(req,res){
    const name = req.body.name;
    const personalEmail = req.body.personalEmail;
    const personalNumber = req.body.personalNum;
    const password = req.body.password;
    const industry = req.body.industry;
    const companyName = req.body.coName;
    const companyAddress = req.body.location;
    const companyEmail = req.body.coEmail;
    const companyNumber = req.body.coNum;
    const UEN = req.body.UEN;
    const cardNumber = req.body.cardNum;
    const cardExpDate = req.body.cardEXP;
    const CVV = req.body.cvv;
    const ACRAFile = req.files.ACRAFile.data;


    const transporter = nodemailer.createTransport({
        // Set up your SMTP server and credentials here
        service: 'Gmail',
        port: 587,
        auth: {
            user: 'emproster.fyp.adim@gmail.com', // Your Gmail email address
            pass: 'kmcl lqwn ccsd jran', // Your Gmail password or an app-specific password
        },
     });
     
     // Set up email data
     const mailOptions = {
        from: 'emproster.fyp.adim@gmail.com',
        to: personalEmail, // User's email address
        subject: 'Pending Account Registration',
        text: "Dear " + name + ",\n" +

        "We are pleased to inform you that your account with Emproster has been successfully registered. Thank you for choosing our platform." + '\n' +
        
        "Your account is now awaiting approval from our team. Once your account is approved, you will gain full access to Emproster's features and services." + '\n' +
        
        "Please be patient while we review your registration. We will notify you as soon as your account is approved." + '\n' +
        
        "If you have any questions or require assistance, feel free to contact our support team at emproster.fyp.adim@gmail.com." + '\n' +
        
        "Thank you for choosing Emproster!" + '\n' +
        
        "Best regards," + '\n' +
        "The Emproster Team"
     };
    
    entity.checkUEN(UEN, function (err, results) {
        if (err) {
            console.log('error');
        } else if (results.length >= 1) {
            res.redirect('/UENexists');
        } else {
            controller.registerAndDelay(companyName,companyAddress,companyEmail,companyNumber,
            UEN,cardNumber,cardExpDate,CVV,industry,name,personalEmail,personalNumber,password,ACRAFile);
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
             });
            res.redirect('/');
        }
    });
});

router.get('/learnmore', function(req,res){
   // res.render(path.join(filepath, 'UR-LearnMore.ejs'));

    controller.getURfeatures(function (err, featuresresults) {
        if (err) {
            console.error('Error fetching URfeatures:', err);
            return res.status(500).send('Error fetching URfeatures');
        }

        controller.getURreview(function (err, reviewresults) {
            if (err) {
                console.error('Error fetching URreview:', err);
                return res.status(500).send('Error fetching URreview');
            }

        // If both queries were successful, render the EJS template
        res.render(path.join(filepath, 'UR-LearnMore.ejs'), { featuresresults: featuresresults, reviewresults: reviewresults });
    });
    });
});

router.get('/testimonial', function(req,res){
    // res.render(path.join(filepath, 'UR-LearnMore.ejs'));
 
     controller.getURfeatures(function (err, featuresresults) {
         if (err) {
             console.error('Error fetching URfeatures:', err);
             return res.status(500).send('Error fetching URfeatures');
         }
 
         controller.getURreview(function (err, reviewresults) {
             if (err) {
                 console.error('Error fetching URreview:', err);
                 return res.status(500).send('Error fetching URreview');
             }
 
         // If both queries were successful, render the EJS template
         res.render(path.join(filepath, 'UR-Testimonials.ejs'), { featuresresults: featuresresults, reviewresults: reviewresults });
     });
     });
});

module.exports = router;