// Import Entity
const entity = require('../Entity/entity');
const moment = require('moment');

async function registerAndDelay(companyName,companyAddress,companyEmail,companyNumber,UEN,cardNumber,cardExpDate,CVV,industry,name,personalEmail,personalNumber,password, ACRAFile) {
    await new Promise(resolve => {
      entity.registerCompany(companyName, companyAddress, companyEmail, companyNumber, UEN, cardNumber, cardExpDate, CVV, industry, ACRAFile);
      setTimeout(() => {
        console.log('1-second delay for registerCompany');
        resolve(); // Resolve the Promise after the delay
      }, 1000); // 1-second delay
    });

    // After the delay, execute the registerCAaccount function
    entity.registerCAaccount(name, personalEmail, personalNumber, password, UEN);
}

function loginVerification(req, res, email, password, role) {
    // call entity function
    entity.getAccountInformation(email, password, role, function (err, results) {
        console.log('Results:', results);

        // error handling if no db match is found
        if (!results || results.length === 0) {
            //res.send('No User Found');
            res.redirect('/NoUserFound');
        } else if (results[0].Status === 2) {
            res.redirect('/WaitingApproval');
        }
         else if (results[0].Email === email && results[0].Password === password && results[0].Role === role && results[0].Status === 1) {
            // store account information into session 
            req.session.AccountID = results[0].AccountID;
            req.session.UEN = results[0].UEN;
            req.session.ProjectsInvolved = results[0].ProjectsInvolved;
            req.session.Name = results[0].Name;
            req.session.Email = results[0].Email;
            req.session.Number = results[0].Number;
            req.session.Role = results[0].Role;
            req.session.Skill = results[0].Skill;
            req.session.Department = results[0].Department;
            req.session.LeavesLeft = results[0].LeavesLeft;
            req.session.Pay = results[0].Pay;
            req.session.Status = results[0].Status;
            req.session.Availability = results[0].Availability;
            req.session.OverTime = results[0].OverTime;
            switch (role) {
                // redirect user to respective webpage based on role
                case 'SystemAdmin':
                    res.redirect('/SystemAdmin/accounts');
                    break;
                case 'CompanyAdmin':
                    res.redirect('/CompanyAdmin/projectview');
                    break;
                case 'DepartmentManager':
                    res.redirect('/DepartmentManager/projects');
                    break;
                case 'Employee':
                    res.redirect('/Employee/leavehistory');
                    break;
                default:
                    res.send('Invalid role');
                    break;
            }
        } else if (results[0].Status === 0) {
            res.redirect('/SuspendedAccount');
        } else {
            // error handling if username password and role do not match  
            res.redirect('/InvalidRole');
        }
        
    });
}

function logout(req, res, choice){
    if (choice === 'no') {
        // Redirect back to the previous page
        switch (req.session.Role) {
            // redirect user to respective webpage based on role
            case 'SystemAdmin':
                res.redirect('/SystemAdmin/accounts');
                break;
            case 'CompanyAdmin':
                res.redirect('/CompanyAdmin/projectview');
                break;
            case 'DepartmentManager':
                res.redirect('/DepartmentManager/projects');
                break;
            case 'Employee':
                res.redirect('/Employee/leavehistory');
                break;
            default:
                break;
        }
    } else if (choice === 'yes') {
        // Clear the AccountID and Role cookies
        req.session.destroy((err) => {
            if(err) {
                console.err('Error destroying session', err);;
            }
                // Redirect to the homepage
                res.redirect('/');
        });
    }
}

function deleteFeature(req, res, callback, choice, id) {
    if (choice === 'no') {
        console.log(1);
        res.redirect('/SystemAdmin/edithome');
    } else if (choice === 'yes') {
        console.log(2);
        entity.deleteFeature(callback, id);
        res.redirect('/SystemAdmin/edithome');
    }
}

function deleteReview(req, res, callback, choice, id) {
    if (choice === 'no') {
        console.log(1);
        res.redirect('/SystemAdmin/reviews');
    } else if (choice === 'yes') {
        console.log(2);
        entity.deleteReview(callback, id);
        res.redirect('/SystemAdmin/reviews');
    }
}

function deleteEnquiry(req, res, callback, choice, id) {
    if (choice === 'no') {
        console.log(1);
        res.redirect('/SystemAdmin/enquiries');
    } else if (choice === 'yes') {
        console.log(2);
        entity.deleteEnquiry(callback, id);
        res.redirect('/SystemAdmin/enquiries');
    }
}

function refreshCAreviews(res) {
    res.redirect('/CompanyAdmin/reviews');
}

function refreshCAenquiry(res) {
    res.redirect('/CompanyAdmin/enquiry');
}

function refreshDMreviews(res) {
    res.redirect('/DepartmentManager/reviews');
}

function refreshDMenquiry(res) {
    res.redirect('/DepartmentManager/enquiry');
}

function refreshEreviews(res) {
    res.redirect('/Employee/reviews');
}

function refreshEenquiry(res) {
    res.redirect('/Employee/enquiry');
}

function getContactInfo(callback) {
    entity.getContactInfo(function (err, results) {
        if (err) {
            console.error('Error fetching account information:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

function updatecontactinfo(ContactNumber, CompanyEmail, CompanyAddress, callback) {

    entity.updatecontactinfo(ContactNumber, CompanyEmail, CompanyAddress, function (err, results) {
        if (err) {
            console.error('Error updating account information:', err);
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

// Function to get SA accounts
function getSAAccounts(callback) {
    entity.getCompanyAdminAccounts(function (err, results) {
        if (err) {
            console.error('Error fetching account information:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

// Function to get information on SA Update accounts 
function getSAUpdateAccounts(AccountID, callback) {
    entity.getCompanyAdminUpdateAccounts(AccountID, function (err, results) {
        if (err) {
            console.error('Error fetching account information:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

function deleteAccount(req, res, callback, choice, CompanyUEN) {
    if (choice === 'no') {
        console.log(1);
        res.redirect('/SystemAdmin/accounts');
    } else if (choice === 'yes') {
        console.log(2);
        entity.deleteAccount(callback, CompanyUEN);
        res.redirect('/SystemAdmin/accounts');
    }
}

// Function to update account status by AccountID on SA-UpdateAccount
function updateAccountStatus(CompanyUEN, updatedStatus, callback) {
    entity.updateAccountStatus(CompanyUEN, updatedStatus, function (err, results) {
        if (err) {
            console.error('Error updating account information:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            // console.log('AccountID_inController:', AccountID); // Check if AccountID is correct
            // console.log('updatedStatus_inController:', updatedStatus); // Check if updatedStatus is correct
            callback(null, results);
        }
    });
}

// Function to get SA Enquiries
function getSAEnquiries(callback) {
    entity.getSAEnquiries(function (err, results) {
        if (err) {
            console.error('Error fetching account information:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

// Function to get SA pending accounts
function getSAPendingAccounts(callback) {
    entity.getSAPendingAccounts(function (err, results) {
        if (err) {
            console.error('Error fetching account information:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

// Function to approve account by UEN on SA-pendingregistration
function approveAccount(UEN, callback) {
    entity.approveAccount(UEN, function (err, results) {
        if (err) {
            console.error('Error updating account information:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            // console.log('AccountID_inController:', AccountID); // Check if AccountID is correct
            // console.log('updatedStatus_inController:', updatedStatus); // Check if updatedStatus is correct
            callback(null, results);
        }
    });
}

// Function to decline account by UEN on SA-pendingregistration
function declineAccount(UEN, callback) {
    entity.declineAccount(UEN, function (err, results) {
        if (err) {
            console.error('Error decline account information:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

// Function to get Reviews
function getReviews(callback) {
    entity.getReviews(function (err, results) {
        if (err) {
            console.error('Error fetching Reviews :', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

// Function to get projectview for CA-ProjectView
function getProjectView(UEN, req, callback) {
    entity.getProjectView(UEN, function (err, results) {
        // console.log('What is req:', req.session.UEN); //
        if (err) {
            console.error('Error fetching projectview :', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

// Function to get projectview for DM-Projects
function DMgetProjectView(UEN, Department, req, callback) {
    entity.DMgetProjectView(UEN, Department, function (err, results) {
        // console.log('What is req:', req.session.UEN); //
        if (err) {
            console.error('Error fetching Reviews :', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

// Function to get accounts for CA-EmployeeViews
function getEmployeeView(req, callback) {
    entity.getEmployeeView(req.session.UEN, function (err, results) {
        // console.log('What is req:', req.session.UEN); //
        if (err) {
            console.error('Error fetching account information:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

// Function to get accounts for CA-EmployeeViews
function getViewAllEmployee(req, callback) {
    entity.getViewAllEmployee(req.session.UEN, function (err, results) {
        // console.log('What is req:', req.session.UEN); //
        if (err) {
            console.error('Error fetching account information:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

// Function to adding employee in CA-EmployeeAdd.ejs
function EmployeeAdd(UEN, Name, Number, Email, Department, req, callback) {
    entity.EmployeeAdd(UEN, Name, Number, Email, Department, req, function (err, results) {
        if (err) {
            console.error('Error updating account information:', err);
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

// Function to adding Department in CA-EmployeeAdd.ejs
function RegisterDepartment(UEN, Department, Skills, callback) {
    console.log('Skills-CA controller:', Skills);
    entity.RegisterDepartment(UEN, Department, Skills, function (err, results) {
        if (err) {
            console.error('Error updating account information:', err);
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

function deleteEmployee(req, res, callback, choice, AccountID) {
    if (choice === 'no') {
        // console.log(1);
        res.redirect('/CompanyAdmin/employeeview');
    } else if (choice === 'yes') {
        console.log(2);
        // console.log(AccountID);
        entity.deleteEmployee(callback, AccountID);
        res.redirect('/CompanyAdmin/employeeview');
    }
}

// Function to get information on CA Employee Update 
function getCAUpdateAccounts(AccountID, callback) {
    entity.getCAUpdateAccounts(AccountID, function (err, results) {
        if (err) {
            console.error('Error fetching account information:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

// Function to get department options from the database
function getDepartmentOptions(UEN, callback) {
    // console.log('getDepartmentOptions-UEN1:', req.session.UEN);
    // console.log('getDepartmentOptions-Department1:', req.session.Department);

    entity.getDepartmentOptions(UEN, function (err, departments) {
        // console.log('getDepartmentOptions-UEN2:', req.session.UEN);
        // console.log('getDepartmentOptions-Department2:', req.session.Department);

        if (err) {
            console.error('Error fetching department options:', err);
            callback(err, null);
        } else {
            callback(null, departments);
        }
    });
}

// Function to get department options from the database
function getCADepartmentOptions(UEN, callback) {
    // console.log('getDepartmentOptions-UEN1:', req.session.UEN);
    // console.log('getDepartmentOptions-Department1:', req.session.Department);

    entity.getCADepartmentOptions(UEN, function (err, departments) {
        // console.log('getDepartmentOptions-UEN2:', req.session.UEN);
        // console.log('getDepartmentOptions-Department2:', req.session.Department);

        if (err) {
            console.error('Error fetching department options:', err);
            callback(err, null);
        } else {
            callback(null, departments);
        }
    });
}

// Function for Update DM in CA-EmployeeUpdate.ejs
function EmployeeUpdate(DMupdateDapartmentBox, DMupdateDapartmentAccountID, callback) {
    entity.EmployeeUpdate(DMupdateDapartmentBox, DMupdateDapartmentAccountID, function (err, results) {
        if (err) {
            console.error('Error fetching department options:', err);
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

// Function to get CA Company View
function getCAcompanyView(req, callback) {
    entity.getCAcompanyView(req.session.UEN, function (err, results) {
        // console.log('What is req:', req.session.UEN);
        if (err) {
            console.error('Error fetching account information:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

// Function to get CA Company View
function getCAcompanyUpdate(UEN, callback) {
    entity.getCAcompanyView(UEN, function (err, results) {
        console.log('What is req:', UEN);
        if (err) {
            console.error('Error fetching account information:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

// Function for Company Update in CA-CompanyUpdate.ejs
function companyupdate(CompanyName, CompanyNumber, CompanyAddress, CompanyEmail, UEN, callback) {

    // console.log('update-CompanyUEN-CA:', UEN); // Check if UEN is correct
    // console.log('update-CompanyName-CA:', CompanyName); // Check if Name is correct
    // console.log('update-CompanyNumber-CA:', CompanyNumber); // Check if Number is correct
    // console.log('update-CompanyAddress-CA:', CompanyAddress); // Check if Email is correct
    // console.log('update-CompanyEmail-CA:', CompanyEmail); // Check if Department is correct

    entity.companyupdate(CompanyName, CompanyNumber, CompanyAddress, CompanyEmail, UEN, function (err, results) {
        if (err) {
            console.error('Error updating account information:', err);
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

// Function to get accounts for DM-Employees
function getDMEmployee(req, callback) {
    // console.log('getDMEmployee-UEN1:', req.session.UEN); //
    // console.log('getDMEmployee-Department1:', req.session.Department); //

    entity.getDMEmployee(req.session.UEN, req.session.Department, function (err, results) {
        // console.log('getDMEmployee-UEN2:', req.session.UEN); //
        // console.log('getDMEmployee-Department2:', req.session.Department); //

        if (err) {
            console.error('Error fetching account information:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

// Function to get information on CA Employee Update 
function getDMUpdateAccounts(AccountID, callback) {
    // console.log('getDMUpdateAccounts-UEN1:', req.session.UEN); //
    // console.log('getDMUpdateAccounts-Department1:', req.session.Department); //

    entity.getCAUpdateAccounts(AccountID, function (err, results) {
        // console.log('getDMUpdateAccounts-UEN1:', req.session.UEN); //
        // console.log('getDMUpdateAccounts-Department1:', req.session.Department); //

        if (err) {
            console.error('Error fetching account information:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

// Function to get Skill options given a selected department from the database
function getSkillsOptions(UEN, Department, callback) {
    // console.log('getSkillsOptions-Department:', Department); //
    // console.log('getSkillsOptions-UEN:', UEN); //

    entity.getSkillsOptions(UEN, Department, function (err, results) {

        if (err) {
            console.error('Error fetching account information:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

// Function to get Skill options given a selected department from the database
function getDMSkillsOptions(UEN, Department, callback) {
    // console.log('getDMSkillsOptions-Department:', Department); //
    // console.log('getDMSkillsOptions-UEN:', UEN); //

    entity.getDMSkillsOptions(UEN, Department, function (err, results) {

        if (err) {
            console.error('Error fetching account information:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

// Function to getURdescription
function getURdescription(callback) {

    entity.getURdescription(function (err, results) {

        if (err) {
            console.error('Error fetching URdescription:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

// Function to getURfeatures
function getURfeatures(callback) {

    entity.getURfeatures(function (err, results) {

        if (err) {
            console.error('Error fetching URdescription:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

// Function to getURreview
function getURreview(callback) {

    entity.getURreview(function (err, featuresresults) {

        if (err) {
            console.error('Error fetching getURreview:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, featuresresults);
        }
    });
}

// Function to updateDescription
function updateDescription(Description, callback) {
    entity.updateDescription(Description, function (err, results) {
        if (err) {
            console.error('Error updating Description in controller:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

// Function to addFeatures
function addFeatures(Feature, Description, callback) {
    entity.addFeatures(Feature, Description, function (err, results) {
        if (err) {
            console.error('Error updating Description in controller:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

function deleteSkills(req, res, callback, choice, DSID) {
    if (choice === 'no') {
        // console.log(1);
        res.redirect('/CompanyAdmin/departmentskills');
    } else if (choice === 'yes') {
        console.log(2);
        // console.log(AccountID);
        entity.deleteSkills(callback, DSID);
        res.redirect('/CompanyAdmin/departmentskills');
    }
}

function deleteDepartment(req, res, callback, choice, DName, UEN) {
    if (choice === 'no') {
        // console.log(1);
        res.redirect('/CompanyAdmin/companyview');
    } else if (choice === 'yes') {
        // console.log(2);
        // console.log(AccountID);
        entity.deleteDepartment(callback, DName, UEN);
        res.redirect('/CompanyAdmin/companyview');
    }
}

function Skillsadd(Department, NewSkill, UEN, callback) {
    entity.Skillsadd(Department, NewSkill, UEN, function (err, results) {
        if (err) {
            console.error('Error Skillsadd in controller:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

// Function to adding employee in DM-AddEmployees.ejs
function DMAddEmployees(UEN, Name, Number, Email, Password, Role, Skills, Department, res, callback) {
    entity.DMAddEmployees(UEN, Name, Number, Email, Password, Role, Skills, Department, function (err, results) {
        if (err) {
            console.error('Error adding account information in DM-AddEmployees.ejs:', err);
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

function DMdeleteEmployee(req, res, callback, choice, AccountID) {
    if (choice === 'no') {
        // console.log(1);
        res.redirect('/DepartmentManager/employees');
    } else if (choice === 'yes') {
        console.log(2);
        // console.log(AccountID);
        entity.deleteEmployee(callback, AccountID);
        res.redirect('/DepartmentManager/employees');
    }
}

// Function to approve account by UEN on SA-pendingregistration
function approveRequest(RequestID, callback) {
    entity.approveRequest(RequestID, function (err, results) {
        if (err) {
            console.error('Error approveRequest:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            // console.log('AccountID_inController:', AccountID); // Check if AccountID is correct
            // console.log('updatedStatus_inController:', updatedStatus); // Check if updatedStatus is correct
            callback(null, results);
        }
    });
}

function RequestEmpAvail(AccountID, StartDate, EndDate, Skill, Department, UEN, callback){
    entity.RequestEmpAvail(AccountID, StartDate, EndDate, Skill, Department, UEN, function(err , results) {
        if (err) {
            console.error('Error RequestEmpAvail:', err);
            callback(err, null);
        } else {
            // console.log('NewAccountID2 controller ', results);
            callback(null, results);
        }
    });
} 

function CheckRequesteeOnProj(AccountID, StartDate, EndDate, callback){
    entity.CheckRequesteeOnProj(AccountID, StartDate, EndDate, function(err , resultsCRP){
        if (err) {
            console.error('Error CheckRequesteeOnProj:', err);
            callback(err, null);
        } else {
            // console.log('CheckRequesteeOnProj controller ', resultsCRP);
            callback(null, resultsCRP);
        }
    });
}

// Function to decline account by UEN on SA-pendingregistration
function declineRequest(RequestID, callback) {
    entity.declineRequest(RequestID, function (err, results) {
        if (err) {
            console.error('Error declineRequest:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function createProject(UEN,projectName,projectDescription,startdate,enddate,allOutput, res){

    let projectID;
    let redirectFlag = false;
    const segments = allOutput.split(', ');
    const projectDetails = [];
    const availableAccountIDs = [];

    try {
        // Check if projectName already exists for any given company
        const results = await entity.checkProjectName(UEN, projectName);

        if (results.length > 0) {
            redirectFlag = true;
            await delay(1000);
            res.redirect('/CompanyAdmin/projectNameDuplicate');
            return;
        }
    } catch (err) {
        console.error('Error fetching project name:', err);
    }


    if (!redirectFlag) {

    // insert data into Projects table with 1 second delay
    await new Promise(resolve => {

        entity.updateProject(UEN, projectName, projectDescription, startdate, enddate, function(err,results) {
            if (err) {
                console.error('Error fetching department options:', err);
            } else {
                console.log('Results: ', results);
            }
        });
        setTimeout(() => {
            if (!redirectFlag) {
                resolve();
            }
        }, 1000);
      });

    // get projectID
    await new Promise(async (resolve) => {
    projectID = await entity.getProjectID(projectName, UEN); 
    
    setTimeout(() => {
        if (!redirectFlag) {
            resolve(projectID);
        }
    }, 1000); 
    });

    // parse through and create objects with details for each specific skill required
    for (const segment of segments) {
        const [Department, Skill, Pax, StartDate, EndDate] = segment.split(' / ');
        const obj = {
            Department: Department,
            Skill: Skill,
            Pax: parseInt(Pax, 10),
            StartDate: StartDate,
            EndDate: EndDate
        };
        projectDetails.push(obj);
    }

    console.log('Project Details :', projectDetails);

    // check for manpower availability
    const availabilityPromises = projectDetails.map((object) =>
    new Promise((resolve, reject) => {
        entity.checkAvailability(UEN, object.Department, object.Skill, object.StartDate, object.EndDate, object.Pax, function (err, results) {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    }));
    try {
        // Wait for all availability checks to complete
        const availabilityResults = await Promise.all(availabilityPromises);
        

        console.log(availabilityResults);

        // Check if any of the availability checks failed
        for (let i = 0; i < projectDetails.length; i++) {
            if (availabilityResults[i].length < projectDetails[i].Pax) {
                availableAccountIDs.length = 0;
                redirectFlag = true;
                res.redirect('/CompanyAdmin/insufficientManpower');
                entity.deleteProject(projectID, (err, deleteResults) => {
                    if (err) {
                        console.error(`Error deleting project: ${err}`);
                    } else {
                        console.log(`Project deleted successfully: ${deleteResults}`);
                    }
                });
                return;
            } else {
                availableAccountIDs.push(availabilityResults[i]);
            }
        }
    } catch (error) {
        // Handle any errors thrown during availability checks
        console.error('Error checking availability:', error);
    }

    if (!redirectFlag) {
        // Loop through both arrays
        for (let i = 0; i < projectDetails.length; i++) {
            const accountIDArray = availableAccountIDs[i];
            const projectData = projectDetails[i];
        
            // Loop through accountIDArray for function 1
            accountIDArray.forEach((accountIDObject) => {
            const accountID = accountIDObject.Result;
            entity.insertProjectDetails(projectID, projectData.Skill, projectData.StartDate, projectData.EndDate, projectData.Department, accountID, (err, results) => {
                if (err) {
                console.error(`Error inserting ProjectDetails: ${err}`);
                } else {
                console.log(`ProjectDetails inserted successfully: ${results}`);
                }
            });

            // Call function 2 with the corresponding data from array2
            entity.insertAvailability(accountID, projectID, projectData.StartDate, projectData.EndDate, (err, results) => {
                if (err) {
                    console.error(`Error inserting Availability: ${err}`);
                } else {
                    console.log(`Availability inserted successfully: ${results}`);
                }
                });
            });
        }
    }
    }
    res.redirect('/CompanyAdmin/projectview');
}

// Function to get Update Projects on CA-ProjectUpdate  
function getCAProjectUpdate(ProjectID, callback) {
    entity.getCAProjectUpdate(ProjectID, function (err, results) {
        if (err) {
            console.error('Error fetching account information:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

// Function to get CurEmp on CA-ProjectUpdate  
function getCAProjectCurEmp(CAprojectUEN, ProjectID, callback) {
    entity.getCAProjectCurEmp(CAprojectUEN, ProjectID, function (err, results1) {
        if (err) {
            console.error('Error fetching account information:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results1);
        }
    });
}

function getCAProjectUpEmp(CAprojectUEN, ProjectID, AccountID, callback) {
    entity.getCAProjectUpEmp(CAprojectUEN, ProjectID, AccountID, function (err, results1) {
        if (err) {
            console.error('Error fetching account information:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results1);
        }
    });
}

// Function to get Update Projects on DM-ProjectUpdate  
function getDMProjectUpdate(ProjectID, callback) {
    entity.getDMProjectUpdate(ProjectID, function (err, results) {
        if (err) {
            console.error('Error fetching account information:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results);
        }
    });
}

// Function to get CurEmp on DM-ProjectUpdate  
function getDMProjectCurEmp(DMprojectUEN, ProjectID, DMprojectDepartment, callback) {
    entity.getDMProjectCurEmp(DMprojectUEN, ProjectID, DMprojectDepartment, function (err, results1) {
        if (err) {
            console.error('Error fetching account information:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, results1);
        }
    });
}

async function getSchedule(accountID) {
    return new Promise((resolve, reject) => {
      const eventDetails = [];
  
      entity.getSchedule(accountID,function (err, results) {
        if (err) {
          console.log('Error', err);
          reject(err);
        } else {
        for (const result of results) {
            console.log('ProjectName: ',result.ProjectName);
            console.log('StartDate: ',result.FormattedStartDate);
            console.log('EndDate: ',result.FormattedEndDate);
            // format dates for fullCalendar
            const startDate = moment(result.FormattedStartDate, 'YYYY/MM/DD').format('YYYY-MM-DD');
            // add 1 day to end date because fullCalendar displays 1 day less
            const endDate = moment(result.FormattedEndDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD');
            const event = {
                title: 'Project Name: <b><i>' + result.ProjectName + '</i></b>',
                start: startDate,
                end: endDate,
                textColor: 'black',
                };
            eventDetails.push(event);
        }
          resolve(eventDetails);
            console.log('event details: ', eventDetails);
        }
      });
    });
}

async function getAllProjectSchedulesCA(UEN) {
    return new Promise((resolve, reject) => {
        const events = {};

        entity.getAllProjectSchedules(UEN, function (err, results) {
            if (err) {
                console.log('Error', err);
                reject(err);
            } else {
                for (const result of results) {
                    // console.log('Result in Results: ', result);

                    const eventKey = result.ProjectName;
                    const startDate = moment(result.ProjectStartDate, 'YYYY/MM/DD').format('YYYY-MM-DD');
                    const endDate = moment(result.ProjectEndDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD');
                    const skillStartDate = moment(result.SkillStartDate, 'YYYY/MM/DD').format('YYYY-MM-DD');
                    const skillEndDate = moment(result.SkillEndDate, 'YYYY/MM/DD').format('YYYY-MM-DD');
                    // Create a new event or update an existing one
                    if (!events[eventKey]) {
                        events[eventKey] = {
                            title: '<b><i>' + result.ProjectName + '</i></b>',
                            start: startDate,
                            end: endDate,
                            details: '', // Initialize details as an empty string
                            textColor: 'black',
                        };
                    }

                    // Concatenate the details into the existing details string
                    const details = ['<br>' +
                        '<span style="font-size: 85%;"><b>Name: ' + result.AccountName + '</span></b><br>' +
                        '<span style="font-size: 85%;"><b>Department: ' + result.Department + '</span></b><br>' +
                        '<span style="font-size: 85%;"><b>Skill: ' + result.Skill + '</span></b><br>' +
                        '<span style="font-size: 85%;"><b>StartDate: ' + skillStartDate + '</span></b>&nbsp;&nbsp;&nbsp;' +
                        '<span style="font-size: 85%;"><b>EndDate: ' + skillEndDate  + '</span><br></b>'
                    ].join();

                    if (events[eventKey].details) {
                        events[eventKey].details += ' ';
                    }
                    events[eventKey].details += details;
                }

                // Convert the events object into an array of event objects
                const eventDetails = Object.values(events);

                resolve(eventDetails);
            }
        });
    });
}

async function getAllProjectSchedulesDM(UEN, department) {
    return new Promise((resolve, reject) => {
        const events = {};
        const filterOut = 'Department: ' + department;

        entity.getAllProjectSchedules(UEN, function (err, results) {
            if (err) {
                console.log('Error', err);
                reject(err);
            } else {
                for (const result of results) {
                    // console.log('Result in Results: ', result);

                    const eventKey = result.ProjectName;
                    const startDate = moment(result.ProjectStartDate, 'YYYY/MM/DD').format('YYYY-MM-DD');
                    const endDate = moment(result.ProjectEndDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD');
                    const skillStartDate = moment(result.SkillStartDate, 'YYYY/MM/DD').format('YYYY-MM-DD');
                    const skillEndDate = moment(result.SkillEndDate, 'YYYY/MM/DD').format('YYYY-MM-DD');
                    // Create a new event or update an existing one
                    if (!events[eventKey]) {
                        events[eventKey] = {
                            title: '<b><i>' + result.ProjectName + '</i></b>',
                            start: startDate,
                            end: endDate,
                            details: '', // Initialize details as an empty string
                            textColor: 'black',
                        };
                    }

                    // Concatenate the details into the existing details string
                    const details = ['<br>' +
                        '<span style="font-size: 85%;"><b>Name: ' + result.AccountName + '</span></b><br>' +
                        '<span style="font-size: 85%;"><b>Department: ' + result.Department + '</span></b><br>' +
                        '<span style="font-size: 85%;"><b>Skill: ' + result.Skill + '</span></b><br>' +
                        '<span style="font-size: 85%;"><b>StartDate: ' + skillStartDate + '</span></b>&nbsp;&nbsp;&nbsp;' +
                        '<span style="font-size: 85%;"><b>EndDate: ' + skillEndDate  + '</span><br></b>'
                    ].join();

                    if (events[eventKey].details) {
                        events[eventKey].details += ', ';
                    }
                    events[eventKey].details += details;
                }

                // Convert the events object into an array of event objects
                const eventDetails = Object.values(events);

                // Filter eventDetails to remove events that do not contain filterOut in their details
                const filteredEventDetails = eventDetails.filter((event) => event.details.includes(filterOut));

                resolve(filteredEventDetails);
            }
        });
    });
}
  
async function getProjectDetails(projectID) {
    return new Promise((resolve, reject) => {
      const eventDetails = [];
  
      entity.getProjectDetails(projectID,function (err, results) {
        if (err) {
          console.log('Error', err);
          reject(err);
        } else {
        for (const result of results) {

            const startDate = moment(result.FormattedStartDate, 'YYYY/MM/DD').format('YYYY-MM-DD');
            const endDate = moment(result.FormattedEndDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD');
            console.log('results: ',result);

            const event = {
                title: 'Department: <b><i>' + result.Department + '</i></b>&nbsp;&nbsp;&nbsp;' + 'Name: <b><i>' + result.AccountName + '</i></b>&nbsp;&nbsp;&nbsp;' + 'Skill: <b><i>' + result.Skill + '</i></b>',
                start: startDate,
                end: endDate,
                textColor: 'black',
                };
            eventDetails.push(event);
        }
          resolve(eventDetails);
            console.log('event details: ', eventDetails);
        }
      });
    });
}

function RemoveProjectMembers(req, res, callback, choice, AccountID, ProjectID) {
    
    entity.RemoveProjectMembers(callback, AccountID, ProjectID);
}

function deleteProject(req, res, callback, choice, id) {
    if (choice === 'no') {
        console.log(1);
        res.redirect('/DepartmentManager/projects');
    } else if (choice === 'yes') {
        console.log(2);
        entity.deleteProject(id, callback);
        res.redirect('/DepartmentManager/projects');
    }
}

function CAdeleteProject(req, res, callback, choice, id) {
    if (choice === 'no') {
        console.log(1);
        res.redirect('/CompanyAdmin/projectview');
    } else if (choice === 'yes') {
        console.log(2);
        entity.deleteProject(id, callback);
        res.redirect('/CompanyAdmin/projectview');
    }
}

function getUpdateEmployeeOptions(UEN, selectedDepartment, selectedSkills, startDate, endDate, callback) {
    entity.getUpdateEmployeeOptions(UEN, selectedDepartment, selectedSkills, startDate, endDate, function (err, employees) {
        if (err) {
            console.error('Error fetching Employee information:', err);
            callback(err, null);
        } else {
            // console.log('Fetched results:', results);
            callback(null, employees);
        }
    });
}

async function updateEmployeeAssignedTimeFrame(AccountID,ProjectID,endDate,CurProjectStartDate,res,UEN,EmployeeName,ROLE) {

    try {
        const results2 = await entity.checkOtherAssignedDates(AccountID,endDate,ProjectID,CurProjectStartDate);
        const results = await entity.checkProjectEndDate(ProjectID,endDate);
        

        const resultsJSON = JSON.stringify(results);
        const results2JSON = JSON.stringify(results2);

        // console.log('resultsJSON controller : ', resultsJSON);
        // console.log('results2JSON controller : ', results2JSON);
        

        // only current project end date has conflict
        if (results !== null && results2 === null) {

            if(ROLE === 'DepartmentManager'){
                res.redirect(`/DepartmentManager/ProjectExtendClash1?ProjectID=${ProjectID}&AccountID=${AccountID}&UEN=${UEN}&results=${resultsJSON}&newEndDate=${endDate}&EmployeeName=${EmployeeName}`);
            } else{
                // console.log('results',results);
                res.redirect(`/CompanyAdmin/ProjectExtendClash1?ProjectID=${ProjectID}&AccountID=${AccountID}&UEN=${UEN}&results=${resultsJSON}&newEndDate=${endDate}&EmployeeName=${EmployeeName}`);
            }

        // no conflict with current project but with allocation in other projects
        } else if (results === null && results2 !== null) {

            const projectEndDateNeedsExtention = [];
            const allocationInOtherProjectsNeedsExtention = [];

            let results2 = JSON.parse(results2JSON);

            // sort by StartDate
            results2 = results2.sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate));
        
            // Initialize newEndDate with the provided value
            let currentNewEndDate = new Date(endDate);

            for (const object in results2) {
                const projID = results2[object].ProjectID;
                const projName = results2[object].ProjectName;
                const acctID = results2[object].AccountID;
                const allocationStartDate = moment(results2[object].StartDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD');
                const allocationEndDate = moment(results2[object].EndDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD');
                const projectStartDate = moment(results2[object].ProjectStartDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD');
                const projectEndDate = moment(results2[object].ProjectEndDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD');

                // Create new Date objects
                const SDate = new Date(allocationStartDate);
                const EDate = new Date(allocationEndDate);
        
                // Calculate dateDiff using the currentNewEndDate
                const dateDiff = currentNewEndDate - SDate;
                const addDiff = (dateDiff / (1000 * 60 * 60 * 24)) + 1;
        
                // Calculate newAllocationStartDate and newAllocationEndDate
                const newAllocationStartDate = new Date(SDate.setDate(SDate.getDate()  + addDiff));
                const newAllocationEndDate = new Date(EDate.setDate(EDate.getDate()  + addDiff));
                const formattedSDate = newAllocationStartDate.toISOString().split('T')[0];
                const formattedEDate = newAllocationEndDate.toISOString().split('T')[0];

                const newTimeFrame = {
                    projectID: projID,
                    projectName: projName,
                    accountID: acctID,
                    startDate: formattedSDate,
                    endDate: formattedEDate,
                    projStartDate: projectStartDate,
                    projEndDate: projectEndDate
                };

                allocationInOtherProjectsNeedsExtention.push(newTimeFrame);

        
                // Update currentNewEndDate for the next project
                currentNewEndDate = newAllocationEndDate;

                try {

                    let check = await entity.checkProjectEndDate(projID,formattedEDate);
                    check = JSON.stringify(check);

                    if (check === 'null') {
                        // console.log('Project end date needs no extention');
                    } else {
                        // console.log('Project endDate needs to be extended: ', check);
                        projectEndDateNeedsExtention.push(projID);
                    }

                } catch (err) {
                    console.log(err);
                }

            }

            let cont = true;

            while (cont) {
                allocationInOtherProjectsNeedsExtention.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
                const lastObject = allocationInOtherProjectsNeedsExtention[allocationInOtherProjectsNeedsExtention.length - 1];

                const allocationClash = await entity.fml(lastObject.accountID,lastObject.endDate,lastObject.projectID,lastObject.startDate);

                if (allocationClash !== null) {

                    let clash = JSON.stringify(allocationClash);
                    clash = JSON.parse(clash);

                    const pID = clash[0].ProjectID;
                    const pN = clash[0].ProjectName
                    const aID = clash[0].AccountID;
                    const alloStartDate = moment(clash[0].StartDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD');
                    const alloEndDate = moment(clash[0].EndDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD');
                    const proStartDate = moment(clash[0].ProjectStartDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD');
                    const proEndDate = moment(clash[0].ProjectEndDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD');

                    const sDate = new Date(alloStartDate);
                    const eDate = new Date(alloEndDate);
                    const newdate = new Date(lastObject.endDate);

                    const diff = newdate - sDate;
                    const add = (diff / (1000 * 60 * 60 * 24)) + 1;

                    const newAlloStartDate = new Date(sDate.setDate(sDate.getDate() + add));
                    const newAlloEndDate = new Date(eDate.setDate(eDate.getDate() + add));
                    const formattedStartDate = newAlloStartDate.toISOString().split('T')[0];
                    const formattedEndDate = newAlloEndDate.toISOString().split('T')[0];

                    const TimeFrame = {
                        projectID: pID,
                        projectName: pN,
                        accountID: aID,
                        startDate: formattedStartDate,
                        endDate: formattedEndDate,
                        projStartDate: proStartDate,
                        projEndDate: proEndDate
                    };

                    allocationInOtherProjectsNeedsExtention.push(TimeFrame);

                    try {

                        let check = await entity.checkProjectEndDate(pID,formattedEndDate);
                        check = JSON.stringify(check);
    
                        if (check === 'null') {

                        } else {

                            projectEndDateNeedsExtention.push(pID);
                        }
    
                    } catch (err) {
                        console.log(err);
                    }

                } else {
                    cont = false;
                }
            }


            const list1 = JSON.stringify(projectEndDateNeedsExtention);
            const list2 = JSON.stringify(allocationInOtherProjectsNeedsExtention);

            if(ROLE === 'DepartmentManager'){
                // console.log('results2',results2);
                res.redirect(`/DepartmentManager/ProjectExtendClash2?ProjectID=${ProjectID}&AccountID=${AccountID}&UEN=${UEN}&results2=${results2JSON}&newEndDate=${endDate}&EmployeeName=${EmployeeName}&list1=${list1}&list2=${list2}`);
            }else{
                // console.log('results2',results2);
                res.redirect(`/CompanyAdmin/ProjectExtendClash2?ProjectID=${ProjectID}&AccountID=${AccountID}&UEN=${UEN}&results2=${results2JSON}&newEndDate=${endDate}&EmployeeName=${EmployeeName}&list1=${list1}&list2=${list2}`);
            }

        // conflict with current project as well allocation in other projects
        } else if (results !== null && results2 !== null) {

            const projectEndDateNeedsExtention = [];
            const allocationInOtherProjectsNeedsExtention = [];

            let results2 = JSON.parse(results2JSON);

            // sort by StartDate
            results2 = results2.sort((a, b) => new Date(a.StartDate) - new Date(b.StartDate));
        
            // Initialize newEndDate with the provided value
            let currentNewEndDate = new Date(endDate);

            for (const object in results2) {
                const projID = results2[object].ProjectID;
                const projName = results2[object].ProjectName;
                const acctID = results2[object].AccountID;
                const allocationStartDate = moment(results2[object].StartDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD');
                const allocationEndDate = moment(results2[object].EndDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD');
                const projectStartDate = moment(results2[object].ProjectStartDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD');
                const projectEndDate = moment(results2[object].ProjectEndDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD');

                // Create new Date objects
                const SDate = new Date(allocationStartDate);
                const EDate = new Date(allocationEndDate);
        
                // Calculate dateDiff using the currentNewEndDate
                const dateDiff = currentNewEndDate - SDate;
                const addDiff = (dateDiff / (1000 * 60 * 60 * 24)) + 1;
        
                // Calculate newAllocationStartDate and newAllocationEndDate
                const newAllocationStartDate = new Date(SDate.setDate(SDate.getDate()  + addDiff));
                const newAllocationEndDate = new Date(EDate.setDate(EDate.getDate()  + addDiff));
                const formattedSDate = newAllocationStartDate.toISOString().split('T')[0];
                const formattedEDate = newAllocationEndDate.toISOString().split('T')[0];

                const newTimeFrame = {
                    projectID: projID,
                    projectName: projName,
                    accountID: acctID,
                    startDate: formattedSDate,
                    endDate: formattedEDate,
                    projStartDate: projectStartDate,
                    projEndDate: projectEndDate
                };

                allocationInOtherProjectsNeedsExtention.push(newTimeFrame);

        
                // Update currentNewEndDate for the next project
                currentNewEndDate = newAllocationEndDate;

                try {

                    let check = await entity.checkProjectEndDate(projID,formattedEDate);
                    check = JSON.stringify(check);

                    if (check === 'null') {
                        // console.log('Project end date needs no extention');
                    } else {
                        // console.log('Project endDate needs to be extended: ', check);
                        projectEndDateNeedsExtention.push(projID);
                    }

                } catch (err) {
                    console.log(err);
                }

            }

            let cont = true;

            while (cont) {
                allocationInOtherProjectsNeedsExtention.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
                const lastObject = allocationInOtherProjectsNeedsExtention[allocationInOtherProjectsNeedsExtention.length - 1];

                const allocationClash = await entity.fml(lastObject.accountID,lastObject.endDate,lastObject.projectID,lastObject.startDate);

                if (allocationClash !== null) {

                    let clash = JSON.stringify(allocationClash);
                    clash = JSON.parse(clash);

                    const pID = clash[0].ProjectID;
                    const pN = clash[0].ProjectName
                    const aID = clash[0].AccountID;
                    const alloStartDate = moment(clash[0].StartDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD');
                    const alloEndDate = moment(clash[0].EndDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD');
                    const proStartDate = moment(clash[0].ProjectStartDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD');
                    const proEndDate = moment(clash[0].ProjectEndDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD');

                    const sDate = new Date(alloStartDate);
                    const eDate = new Date(alloEndDate);
                    const newdate = new Date(lastObject.endDate);

                    const diff = newdate - sDate;
                    const add = (diff / (1000 * 60 * 60 * 24)) + 1;

                    const newAlloStartDate = new Date(sDate.setDate(sDate.getDate() + add));
                    const newAlloEndDate = new Date(eDate.setDate(eDate.getDate() + add));
                    const formattedStartDate = newAlloStartDate.toISOString().split('T')[0];
                    const formattedEndDate = newAlloEndDate.toISOString().split('T')[0];

                    const TimeFrame = {
                        projectID: pID,
                        projectName: pN,
                        accountID: aID,
                        startDate: formattedStartDate,
                        endDate: formattedEndDate,
                        projStartDate: proStartDate,
                        projEndDate: proEndDate
                    };

                    allocationInOtherProjectsNeedsExtention.push(TimeFrame);

                    try {

                        let check = await entity.checkProjectEndDate(pID,formattedEndDate);
                        check = JSON.stringify(check);
    
                        if (check === 'null') {

                        } else {

                            projectEndDateNeedsExtention.push(pID);
                        }
    
                    } catch (err) {
                        console.log(err);
                    }


                } else {

                    cont = false;
                }
            }


            const list1 = JSON.stringify(projectEndDateNeedsExtention);
            const list2 = JSON.stringify(allocationInOtherProjectsNeedsExtention);

            if(ROLE === 'DepartmentManager'){
                res.redirect(`/DepartmentManager/ProjectExtendClash3?ProjectID=${ProjectID}&AccountID=${AccountID}&UEN=${UEN}&results2=${results2JSON}&results=${resultsJSON}&newEndDate=${endDate}&EmployeeName=${EmployeeName}&list1=${list1}&list2=${list2}`);
            }else{
                res.redirect(`/CompanyAdmin/ProjectExtendClash3?ProjectID=${ProjectID}&AccountID=${AccountID}&UEN=${UEN}&results2=${results2JSON}&results=${resultsJSON}&newEndDate=${endDate}&EmployeeName=${EmployeeName}&list1=${list1}&list2=${list2}`);
            }

        // no conflict at all
        } 
        else if (results === null && results2 === null) {

            console.log('no conflict');
            entity.updateAvailabilityAndProjectDetailsTables(endDate,ProjectID,AccountID);
            if(ROLE === 'DepartmentManager'){
                res.redirect(`/DepartmentManager/projectupdate?ProjectID=${ProjectID}&CAprojectUEN=${UEN}`);
            }else{
                res.redirect(`/CompanyAdmin/projectupdate?ProjectID=${ProjectID}&CAprojectUEN=${UEN}`);
            }
            
        }
        
    } catch (err) {
        console.log('error', err);
    }

}

async function handleClash3part1(accountID,projectID,date) {

    await entity.handleClash3part1_1(accountID,projectID,date);
    await entity.handleClash3part1_2(projectID,date);


}




// Export function here, add function name into {}
module.exports = {
    loginVerification,logout,getSAAccounts,loginVerification,logout,
    refreshCAreviews,refreshCAenquiry,refreshDMreviews,refreshDMenquiry,refreshEreviews,
    refreshEenquiry,loginVerification,logout,getSAAccounts, getSAUpdateAccounts,
    deleteAccount, updateAccountStatus, getSAEnquiries, deleteEnquiry, getSAPendingAccounts, 
    approveAccount, declineAccount, getReviews, getProjectView,getEmployeeView, EmployeeAdd, 
    deleteEmployee, getCAUpdateAccounts, getDepartmentOptions, EmployeeUpdate,getCAcompanyView, 
    getCAcompanyUpdate, companyupdate, getDMEmployee, getDMUpdateAccounts, getSkillsOptions,
    getURdescription, getURfeatures, getURreview,getContactInfo,updateDescription,addFeatures,
    deleteFeature,deleteReview,updatecontactinfo,registerAndDelay,getSchedule,delay,getAllProjectSchedulesCA,
    getAllProjectSchedulesDM,getProjectDetails, deleteProject,updateEmployeeAssignedTimeFrame,handleClash3part1

    //darrel
  
    ,createProject
    //weichoon
    ,deleteSkills, deleteDepartment, Skillsadd, DMAddEmployees, DMdeleteEmployee, approveRequest
    ,declineRequest, getCADepartmentOptions, DMgetProjectView, getCAProjectUpdate
    ,getCAProjectCurEmp, getDMProjectUpdate, getDMProjectCurEmp, RemoveProjectMembers, CAdeleteProject
    ,RegisterDepartment, getUpdateEmployeeOptions, getViewAllEmployee, getCAProjectUpEmp, getDMSkillsOptions
    ,RequestEmpAvail, CheckRequesteeOnProj
};