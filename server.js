// import required libraries
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = process.env.port || 3000;
const ejs = require('ejs');
const session = require('express-session');
const crypto = require('crypto');
const fileUpload = require('express-fileupload');




app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret:crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: true
}));
app.use(fileUpload());

///////////////////////////////////////////////////////////////////////////////////////////////////////////

// import routes
const systemAdminRoute = require('./Routes/SystemAdmin');
const companyAdminRoute = require('./Routes/CompanyAdmin');
const unregisteredUserRoute = require('./Routes/UnregisteredUser');
const employeeRoute = require('./Routes/Employee');
const departmentManagerRoute = require('./Routes/DepartmentManager');

///////////////////////////////////////////////////////////////////////////////////////////////////////////

// implement routes
app.use('/SystemAdmin',systemAdminRoute);
app.use('/CompanyAdmin',companyAdminRoute);
app.use('/',unregisteredUserRoute);
app.use('/Employee',employeeRoute);
app.use('/DepartmentManager',departmentManagerRoute);
// app.use('/Login',loginRoute);

// import controller
const controller = require('./Controller/controller');

///////////////////////////////////////////////////////////////////////////////////////////////////////////

// login route
const filepath = path.join(__dirname,'./Misc-Boundary');

app.get('/Login', function(req,res){
    res.render(path.join(filepath, 'LoginPage.ejs'));
});

app.post('/Login', function(req, res) {
    // Extract data from the form
    const email = req.body.LoginEmailBox;
    const password = req.body.LoginPasswordBox;
    const role = req.body.LoginRoleBox;
    // Call the controller function for login verification
    controller.loginVerification(req, res, email, password, role);
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////

// logout route
app.get('/Logout', function(req,res){
    res.render(path.join(filepath, 'LogoutPage.ejs'));
});

app.post('/Logout', function (req, res) {
    const choice = req.body.choice;
    controller.logout(req, res, choice);
  });

///////////////////////////////////////////////////////////////////////////////////////////////////////////

// confirm registration and payment

app.get('PnRConfirmation', function(req,res){

})

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////

//No User Found
app.get('/NoUserFound', function(req,res){
    res.render(path.join(filepath, 'NoUserFound.ejs'));
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////

//Account Waiting Approval
app.get('/WaitingApproval', function(req,res){
    res.render(path.join(filepath, 'WaitingApproval.ejs'));
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////

//Suspended Account 
app.get('/SuspendedAccount', function(req,res){
    res.render(path.join(filepath, 'SuspendedAccount.ejs'));
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////

//Invalid Role
app.get('/InvalidRole', function(req,res){
    res.render(path.join(filepath, 'InvalidRole.ejs'));
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////

//UEN exists
app.get('/UENexists', function(req,res){
    res.render(path.join(filepath, 'UENexists.ejs'));
});