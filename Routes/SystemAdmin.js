const express = require('express');
const router = express.Router();
const path = require('path');
const entity = require('../Entity/entity');
const controller = require('../Controller/controller');
const nodemailer = require('nodemailer');

// file path to Boundary folder
const filepath = path.join(__dirname,'../SA-Boundary');

// routes to render web-pages
router.get('/accounts', function(req,res){
    const search = req.query.searchInput;
    if (search) {
        // Run a query to display matching information from the database based on the search input
        entity.getCAinfoFromUEN(search, function(err, results) {
            if (err) {
                console.error('Error searching for account information:', err);
                res.status(500).send('Error searching for account information');
            } else {
                // Render a page with the search results
                res.render(path.join(filepath, 'SA-Accounts.ejs'), { results: results });
            }
        });
    } else {
        // If there is no input, run the getSAAccounts function to display all accounts
        controller.getSAAccounts(function(err, results) {
            if (err) {
                console.error('Error fetching account information:', err);
                res.status(500).send('Error fetching account information');
            } else {
                // Render a page with all accounts
                res.render(path.join(filepath, 'SA-Accounts.ejs'), { results: results });
            }
        });
    }
});

router.get('/enquiries', function(req, res) {
    const category = req.query.category; 
    console.log(category);
    if (category) {
        entity.getEnquiryByCategory(category, function(err, results) {
            if (err) {
                console.error('Error fetching enquiries:', err);
                res.status(500).send('Error fetching enquiries');
            } else {
                res.render(path.join(filepath, 'SA-Enquiries.ejs'), { results: results });
            }
        });
    } else {
        controller.getSAEnquiries(function(err, results) {
            if (err) {
                console.error('Error fetching enquiries:', err);
                res.status(500).send('Error fetching enquiries');
            } else {
                res.render(path.join(filepath, 'SA-Enquiries.ejs'), { results: results });
            }
        });
    }
});

router.get('/pendingregistration', function(req,res){
    controller.getSAPendingAccounts(function(err, results) {
        if (err) {
            console.error('Error fetching pending account information:', err);
            res.status(500).send('Error fetching pending account information SA');
        } else {
            // console.log('Fetched results:', results); // Log the results
            res.render(path.join(filepath, 'SA-PendingRegistration.ejs'), { results: results }); // Pass 'results' to the template
        }
    });
});

router.get('/reviews', function (req, res) {
    const category = req.query.category; // Access the category as a query parameter

    if (category) {
        // Handle cases when the category parameter is provided
        entity.getReviewByCategory(category, function (err, results) {
            if (err) {
                console.error('Error fetching reviews by category:', err);
                res.status(500).send('Error fetching reviews by category');
            } else {
                res.render(path.join(filepath, 'SA-Reviews.ejs'), { results: results });
            }
        });
    } else {
        // Handle cases when the category parameter is not provided
        controller.getReviews(function (err, results) {
            if (err) {
                console.error('Error fetching Reviews:', err);
                res.status(500).send('Error fetching Reviews');
            } else {
                res.render(path.join(filepath, 'SA-Reviews.ejs'), { results: results });
            }
        });
    }
});

router.post('/reviews', function (req, res, callback) {
    const ReviewID = req.body.ReviewID; // Access the category as a query parameter
    const choice = req.body.choice;
    // console.log(ReviewID);
    // console.log(choice);
    if(choice === 'Posted'){
        entity.postReview(callback, choice, ReviewID);
        
    }else if (choice === 'Unposted'){
        entity.postReview(callback, choice, ReviewID);
        
    }

    res.redirect("/SystemAdmin/reviews");

});

router.get('/updateaccount', function (req, res) {
    const AccountID = req.query.AccountID; // Get the AccountID from query parameters

    controller.getSAUpdateAccounts(AccountID, function (err, results) {
        if (err) {
            console.error('Error fetching account information:', err);
            res.status(500).send('Error fetching account information');
        } else {
            // console.log('Fetched results:', results);
            // Render the SA-UpdateAccount.ejs template and pass the results
            res.render(path.join(filepath, 'SA-UpdateAccount.ejs'), { results: results });
        }
    });
});

//route for edit account in SA-UpdateAccount.ejs
router.post('/updateAccount', function (req, res) {
    const CompanyUEN = req.body['CompanyUEN']; // Get the AccountID from query parameters
    const updatedStatus = req.body['update-account-status']; // Get the updated account status from the form

    console.log('CompanyUEN-SA:', CompanyUEN); // Check if AccountID is correct
    console.log('updatedStatus-SA:', updatedStatus); // Check if updatedStatus is correct

    // Call a function to update the account status in the database
    controller.updateAccountStatus(CompanyUEN, updatedStatus, function (err) {
        if (err) {
            console.error('Error updating account status:', err);
            res.status(500).send('Error updating account status SA');
        } else {
            // Redirect back to the /accounts page after successful update
            res.redirect('/SystemAdmin/accounts');
        }
    });
});

//route for approve account in SA-PendingRegistration.ejs 
router.get('/approveAccount', function(req, res) {
    const UEN = req.query.UEN; // Get the AccountID from the URL parameter

    entity.getEmailandName(UEN, function (err, results) {
        if (err) {
            console.log('error');
        } else {
            const personalEmail = results[0].Email;
            const name = results[0].Name;

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
                subject: 'Account Registration Approved',
                text: "Dear " + name + ',\n' + 

                "We are delighted to inform you that your Emproster account has been successfully approved! Welcome to our platform." + '\n' +
                
                "Your account is now fully activated, and you can start enjoying all the features and services that Emproster offers." + '\n' +
                
                "If you have any questions, require assistance, or encounter any issues, please don't hesitate to contact our support team at emproster.fyp.adim@gmail.com. We're here to help you." + '\n' +
                
                "Thank you for choosing Emproster as your platform of choice. We look forward to providing you with a seamless and efficient experience." + '\n' +
                
                "Best regards," + '\n' +
                "The Emproster Team"
             };
        
             transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
             });
        }
    });

    // Call a function to delete the account by AccountID from the database
    controller.approveAccount(UEN, function(err) {
        if (err) {
            console.error('Error approve account:', err);
            res.status(500).send('Error approve account');
        } else {
            // Redirect back to the /accounts page after successful deletion
            res.redirect('/SystemAdmin/pendingregistration');
        }
    });
});

//route for decline account in SA-PendingRegistration.ejs  
router.get('/declineAccount', function(req, res) {
    const UEN = req.query.UEN; // Get the AccountID from the URL parameter

    entity.getEmailandName(UEN, function (err, results) {
        if (err) {
            console.log('error');
        } else {
            const personalEmail = results[0].Email;
            const name = results[0].Name;

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
                subject: 'Account Registration Declined',
                text: "Dear " + name + ',\n' +

                "We regret to inform you that your recent account registration request with Emproster has been declined. We appreciate your interest in our platform." + '\n' +
                
                "The reason for the decline may be due to incomplete information, violation of terms, etc. We understand that this decision may be disappointing, but we want to ensure the best experience for all our users." + '\n' +
                
                "If you believe this decision is in error or if you have resolved the issues that led to the decline, please feel free to resubmit your registration. Our team will review your request again." + '\n' +
                
                "For any questions or further assistance, please contact our support team at emproster.fyp.adim@gmail.com. We are here to assist you in any way we can." + '\n' +
                
                "Thank you for considering Emproster, and we wish you the best in your endeavors." + '\n' +
                
                "Best regards," + '\n' +
                "The Emproster Team"
             };
        
             transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
             });
        }
    });

    // Call a function to delete the account by AccountID from the database
    controller.declineAccount(UEN, function(err) {
        if (err) {
            console.error('Error decline account:', err);
            res.status(500).send('Error decline account');
        } else {
            // Redirect back to the /accounts page after successful deletion
            res.redirect('/SystemAdmin/pendingregistration');
        }
    });
});

router.get('/edithome', function(req, res) {

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

                controller.getContactInfo(function(err, Contactresults) {
                    if (err) {
                        console.error('Error fetching getContactInfo:', err);
                        return res.status(500).send('Error fetching getContactInfo');
                    }

                // If both queries were successful, render the EJS template
                res.render(path.join(filepath, 'SA-EditHome.ejs'), { results: results, featuresresults: featuresresults, reviewresults: reviewresults, Contactresults: Contactresults });
        
            });
        });
    });
});
});

router.post('/updatecontactinfo', function (req, res) {
    const ContactNumber = req.body['NewContactNumber']; // 
    const CompanyEmail = req.body['NewEmail']; // 
    const CompanyAddress = req.body['NewAddress']; // 
    
    // Call a function to update the account status in the database
    controller.updatecontactinfo(ContactNumber, CompanyEmail, CompanyAddress, function (err) {
        if (err) {
            console.error('Error adding employee status:', err);
            res.status(500).send('Error adding employee status SA');
        } else {
            // Redirect back to the /accounts page after successful update
            res.redirect('/SystemAdmin/edithome');
        }
    });
});

//route for edit account in SA-UpdateAccount.ejs
router.post('/updateDescription', function (req, res) {
    const Description = req.body['enquiryMessage']; // Get the AccountID from query parameters

    // console.log('updatedDescription-SA:', Description); // Check if updatedStatus is correct

    // Call a function to update the account status in the database
    controller.updateDescription(Description, function (err) {
        if (err) {
            console.error('Error updating Description:', err);
            res.status(500).send('Error updating Description SA');
        } else {
            // Redirect back to the /accounts page after successful update
            res.redirect('/SystemAdmin/edithome');
        }
    });
});

//route for addFeatures in SA-UpdateAccount.ejs
router.post('/addFeatures', function (req, res) {
    const Feature = req.body['newFeature'];
    const Description = req.body['newDescription']; // Get the AccountID from query parameters

    // console.log('updatedDescription-SA:', Description); // Check if updatedStatus is correct

    // Call a function to update the account status in the database
    controller.addFeatures(Feature, Description, function (err) {
        if (err) {
            console.error('Error updating Description:', err);
            res.status(500).send('Error updating Description SA');
        } else {
            // Redirect back to the /accounts page after successful update
            res.redirect('/SystemAdmin/edithome');
        }
    });
});

//route for approve account in SA-PendingRegistration.ejs 
router.get('/deletefeature', (req, res) => {
    const pageID = req.query.PageID; // Retrieve PageID from URL query parameter
    const Feature = req.query.Feature;
    const Description = req.query.Description;
    console.log('pageID:', pageID);
    res.render(path.join(filepath, 'SA-DeleteFeature.ejs'), { pageID: pageID, Feature: Feature, Description: Description }); // Pass it to your template
});

router.post('/deletefeature', function(req, res, callback){
    const choice = req.body.choice;
    const id = req.body.PageID;
    console.log(choice);
    controller.deleteFeature(req, res, callback, choice, id);
});

//route for approve account in SA-PendingRegistration.ejs 
router.get('/deletereview', (req, res) => {
    const ReviewID = req.query.ReviewID; // Retrieve PageID from URL query parameter
    const Message = req.query.Message;
    console.log('ReviewID:', ReviewID);
    res.render(path.join(filepath, 'SA-DeleteReview.ejs'), { ReviewID: ReviewID, Message: Message }); // Pass it to your template
});

router.post('/deletereview', function(req, res, callback){
    const choice = req.body.choice;
    const id = req.body.ReviewID;
    console.log(choice);
    controller.deleteReview(req, res, callback, choice, id);
});

//route for approve account in SA-PendingRegistration.ejs 
router.get('/deleteenquiry', (req, res) => {
    const EnquiryID = req.query.EnquiryID; // Retrieve PageID from URL query parameter
    const Message = req.query.Message;
    // console.log('EnquiryID:', EnquiryID);
    res.render(path.join(filepath, 'SA-DeleteEnquiry.ejs'), { EnquiryID: EnquiryID, Message: Message }); // Pass it to your template
});

router.post('/deleteenquiry', function(req, res, callback){
    const choice = req.body.choice;
    const id = req.body.EnquiryID;
    console.log(choice);
    controller.deleteEnquiry(req, res, callback, choice, id);
});

router.get('/deleteAccount', function(req, res) {
    const CompanyUEN1 = req.query.CompanyUEN;
    const CompanyName = req.query.CompanyName;
    console.log('CompanyUEN:', CompanyUEN1);
    res.render(path.join(filepath, 'SA-DeleteAccount.ejs'), { CompanyUEN1: CompanyUEN1, CompanyName: CompanyName });
})

router.post('/deleteAccount', function(req, res, callback){
    const choice = req.body.choice;
    const CompanyUEN = req.body.CompanyUEN;
    console.log(choice);
    controller.deleteAccount(req, res, callback, choice, CompanyUEN);
});

router.get('/viewACRA', function (req, res) {
    const ACRAUEN = req.query.UEN;

    entity.getAcra(ACRAUEN, function (err, results) {
        if (err) {
            console.error('Error fetching MC:', err);
            res.status(500).send('Error fetching MC');
        } else {
            if (results.length > 0) {
                const ACRAData = results[0];
                // Assuming you have a field in your database to store the image type (e.g., 'imageType')
                const imageType = ACRAData.imageType || 'jpeg'; // Default to JPEG if no imageType found
                res.render(path.join(filepath, 'SA-ViewACRA.ejs'), { results: results, imageType: imageType });
            } else {
                res.status(404).send('No ACRA available for this request.');
            }
        }
    });
});

module.exports = router;
