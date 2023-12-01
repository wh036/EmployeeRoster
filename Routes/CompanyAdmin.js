const express = require('express');
const router = express.Router();
const path = require('path');
const entity = require('../Entity/entity');
const controller = require('../Controller/controller');
const moment = require('moment');

// file path to Boundary folder
const filepath = path.join(__dirname,'../CA-Boundary');


// routes to render web-pages
router.get('/companyupdate', function(req, res){
    const UEN = req.query.UEN; // Get the UEN from query parameters

    controller.getCAcompanyUpdate(UEN, function(err, results) {
        if (err) {
            console.error('Error fetching account information:', err);
            res.status(500).send('Error fetching account information');
        } else {
            // console.log('Fetched results:', results); // Log the results
            // Pass 'results' to the template
            res.render(path.join(filepath, 'CA-CompanyUpdate.ejs'), { results: results }); 
        }
    });
});

router.get('/companyview', function(req,res){
    const UEN = req.session.UEN;
    entity.getdepartmentview(UEN, function (err, CADeptView) {
        if (err) {
            console.error('Error fetching departmentskills:', err);
            res.status(500).send('Error fetching departmentskills');
        } else {
            controller.getCAcompanyView(req, function(err, results) {
                if (err) {
                    console.error('Error fetching account information:', err);
                    res.status(500).send('Error fetching account information');
                } else {
                    // console.log('Fetched results:', results); // Log the results
                    // Pass 'results' to the template
                    res.render(path.join(filepath, 'CA-CompanyView.ejs'), { CADeptView: CADeptView, results: results }); 
                }
            });
        }
    });
});

router.get('/employeeupdate', function(req, res){
    const AccountID = req.query.AccountID; // Get the AccountID from query parameters
    const UEN = req.session.UEN;

    // Fetch department options from the database
    controller.getDepartmentOptions(UEN, function (err, departments) {
        if (err) {
            console.error('Error fetching department options:', err);
            res.status(500).send('Error fetching department options');
        } else {
            // Fetch employee update information
            controller.getCAUpdateAccounts(AccountID, function (err, results) {
                if (err) {
                    console.error('Error fetching account information:', err);
                    res.status(500).send('Error fetching account information');
                } else {
                    // Render the CA-EmployeeUpdate.ejs template and pass the results and department options
                    res.render(path.join(filepath, 'CA-EmployeeUpdate.ejs'), { results: results, departments: departments});
                }
            });
        }
    });
});

router.get('/employeeview', function(req,res){
    const UEN = req.session.UEN;
    const department = req.query.CASearchDapartmentBox; 
    // console.log(department);

    if (department){
        entity.getEmployeeByDepartment(department, UEN, function(err, results) {
            if (err) {
                console.error('Error fetching account information:', err);
                res.status(500).send('Error fetching account information');
            } else {
                controller.getDepartmentOptions(UEN, function (err, departments) {
                    if (err) {
                        console.error('Error fetching account information:', err);
                        res.status(500).send('Error fetching account information');
                    } else {
                        // Render the CA-EmployeeUpdate.ejs template and pass the results and department options
                        res.render(path.join(filepath, 'CA-EmployeeView.ejs'), { results: results, departments: departments });
                    }
                });
            }
        });

    } else {
        controller.getEmployeeView(req, function(err, results) {
            if (err) {
                console.error('Error fetching EmployeeView:', err);
                res.status(500).send('Error fetching EmployeeView');
            } else {
                // Fetch employee update information
                controller.getDepartmentOptions(UEN, function (err, departments) {
                    if (err) {
                        console.error('Error fetching account information:', err);
                        res.status(500).send('Error fetching account information');
                    } else {
                        // Render the CA-EmployeeUpdate.ejs template and pass the results and department options
                        res.render(path.join(filepath, 'CA-EmployeeView.ejs'), { results: results, departments: departments });
                    }
                });
            }
        });
    }
    
});

router.get('/emproster', function(req,res){
    res.render(path.join(filepath, 'CA-Emproster.ejs'));
});

router.get('/enquiry', function(req,res){
    controller.getContactInfo(function(err, results) {
        if (err) {
            console.error('Error fetching ContactInfo:', err);
            res.status(500).send('Error fetching ContactInfo');
        } else {
            // console.log('Fetched results:', results); // Log the results
            res.render(path.join(filepath, 'CA-Enquiry.ejs'), { results: results }); // Pass 'results' to the template
        }
    });
});

router.post('/enquiry', function(req,res){
    const name = req.body.name;
    const email = req.body.email;
    const category = req.body.category;
    const message = req.body.message;
    
    entity.submitEnquiry(name, email, category, message);
    controller.refreshCAenquiry(res);
});

router.get('/profileedit', function(req,res){
    res.render(path.join(filepath, 'CA-ProfileEdit.ejs'));
});

router.post('/profileedit', function(req, res, callback){
    const accountID = req.session.AccountID;
    // console.log(accountID);
    const name = req.body.updateaccountname;
    const email = req.body.updateaccountEmail;
    const number = req.body.personalNum;
    const password = req.body.updateaccountPassword;

    entity.updateProfile(accountID, name, email, number, password, callback);
    res.redirect('/CompanyAdmin/profileview');

});

router.get('/profileview', function(req,res){
    const accountID  = req.session.AccountID;
    entity.getProfile(accountID, function(err,results) {
        if (err) {
            console.error('Error fetching profile info', err);
            res.status(500).send('Error fetching profile info');
        } else {
            res.render(path.join(filepath, 'CA-ProfileView.ejs'), { results: results });
        }
    });
});

router.get('/projectcreate', function(req,res){
    controller.getCADepartmentOptions(req.session.UEN, function (err, departments) {
        if (err) {
            console.error('Error fetching department options:', err);
            res.status(500).send('Error fetching department options');
        } else {
            // Render the CA-EmployeeUpdate.ejs template and pass the results and department options
            res.render(path.join(filepath, 'CA-ProjectCreate.ejs'), {departments: departments });
        }
    });
});

//route for creating project in CA-ProjectCreate.ejs
router.post('/ProjectCreate', function (req, res) {
    const UEN = req.session.UEN;
    const projectName = req.body['project-name'];
    const projectDescription = req.body['project-description'];
    const startdate = req.body['start-date'];
    const enddate = req.body['end-date'];
    const allOutput = req.body['allOutput'];

    // console.log('UEN-CA:', UEN); // Check if Name is correct
    // console.log('ProjectName-CA:', projectName); // Check if Name is correct
    // console.log('projectDescription-CA:', projectDescription); // Check if Number is correct
    // console.log('startdate-CA:', startdate); // Check if Email is correct
    // console.log('enddate-CA:', enddate); // Check if Department is correct
    // console.log('allOutput-CA:', allOutput); // Check if Skills is correct
    console.log(allOutput);


    controller.createProject(UEN,projectName,projectDescription,startdate,enddate,allOutput, res);

});

router.get('/projectdetailsview', function(req,res){

    const projectID = req.query.ProjectID;
    const ProjectName = req.query.ProjectName;
    console.log(projectID);

    controller.getProjectDetails(projectID)
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
            console.log(ProjectName);

        res.render(path.join(filepath, 'CA-ProjectDetailsView.ejs'), { eventData, ProjectName });
    })
    .catch(error => {
      res.status(500).send('Error fetching event data');
    });

});

router.get('/viewallprojects', function(req,res){
    
    const UEN = req.session.UEN;

    controller.getAllProjectSchedulesCA(UEN)
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

        res.render(path.join(filepath, 'CA-ViewAllProjects.ejs'), { eventData });
    })
    .catch(error => {
      res.status(500).send('Error fetching event data');
    });

});

router.get('/projectupdate', function(req,res){
    const ProjectID = req.query.ProjectID;
    const CAprojectUEN = req.query.CAprojectUEN;
    // console.log(ProjectID);
    // console.log(CAprojectUEN);
    controller.getCAProjectUpdate(ProjectID, function (err, results) {
        if (err) {
            console.error('Error fetching department options:', err);
            res.status(500).send('Error fetching department options');
        } 
        else {
           controller.getCAProjectCurEmp(CAprojectUEN, ProjectID, function (err, results1) {
                if (err) {
                    console.error('Error fetching department options:', err);
                    res.status(500).send('Error fetching department options');
                } 
                else {
                    // Render the CA-EmployeeUpdate.ejs template and pass the results and department options
                    // res.render(path.join(filepath, 'CA-ProjectUpdate.ejs'), {results: results, results1: results1 });
                    entity.getdepartmentFromDS(CAprojectUEN, function (err, results2) {
                        if (err) {
                            console.error('Error fetching department options:', err);
                            res.status(500).send('Error fetching department options');
                        } 
                        else {
                            // Render the CA-EmployeeUpdate.ejs template and pass the results and department options
                            //res.render(path.join(filepath, 'CA-ProjectUpdate.ejs'), {results: results, results1: results1, results2: results2 });
                            entity.getskillFromDS(CAprojectUEN, function (err, results3) {
                                if (err) {
                                    console.error('Error fetching department options:', err);
                                    res.status(500).send('Error fetching department options');
                                } 
                                else {
                                    // Render the CA-EmployeeUpdate.ejs template and pass the results and department options
                                    res.render(path.join(filepath, 'CA-ProjectUpdate.ejs'), {results: results, results1: results1, results2: results2, results3: results3 });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

router.get('/projectmemberupdate', function(req,res){ 
    const ProjectID = req.query.ProjectID;
    const AccountID = req.query.AccountID;
    const CAprojectUEN = req.session.UEN;
    // console.log(ProjectID);
    // console.log(CAprojectUEN);
    // console.log(AccountID);
    controller.getCAProjectUpEmp(CAprojectUEN, ProjectID, AccountID, function (err, results1) {
        if (err) {
            console.error('Error fetching department options:', err);
            res.status(500).send('Error fetching department options');
        } 
        else {
            res.render(path.join(filepath, 'CA-ProjectMemberUpdate.ejs'), {results1: results1, UEN: CAprojectUEN, ProjectID: ProjectID});
        }
    });
});

router.post('/CAUpdateProjectDesc', function(req, res, callback){
    const UpdateProjectID = req.body.UpdateProjectID;
    const UpdateProjectDescription = req.body.UpdateProjectDescription;
    const UpdateStartDate = req.body.UpdateStartDate;
    const UpdateEndDate = req.body.UpdateEndDate;

    // console.log(UpdateProjectID);
    // console.log(UpdateProjectDescription);
    // console.log(UpdateStartDate);
    // console.log(UpdateEndDate);

    entity.CAUpdateProjectDesc(UpdateProjectID, UpdateProjectDescription, UpdateStartDate, UpdateEndDate, callback);
    res.redirect('back');

});

///////Continue Here//////////////
router.post('/CAAddProjectMembers', function(req, res, callback){
    const UpdateEmpProjectID = req.body.UpdateEmpProjectID;
    const UpdateEmpdepartment = req.body.UpdateEmpdepartment;
    const UpdateEmpSkills = req.body.UpdateEmpSkills;
    const UpdateEmpStartDate = req.body.UpdateEmpStartDate;
    const UpdateEmpEndDate = req.body.UpdateEmpEndDate;
    const UpdateEmpID = req.body.UpdateEmpID;

    // console.log(UpdateEmpProjectID);
    // console.log(UpdateEmpdepartment);
    // console.log(UpdateEmpSkills);
    // console.log(UpdateEmpStartDate);
    // console.log(UpdateEmpEndDate);
    // console.log(UpdateEmpID);

    entity.CAAddProjectMembers(UpdateEmpProjectID, UpdateEmpdepartment, UpdateEmpSkills, UpdateEmpStartDate, UpdateEmpEndDate, UpdateEmpID, callback);
    res.redirect('back');

});

router.get('/projectview', function(req, res){

    const search = req.query.searchInput;
    if (search) {

        // Run a query to display matching information from the database based on the search input
        entity.getSearchProjectView(req.session.UEN, search, function(err, results) {
            if (err) {
                console.error('Error searching for account information:', err);
                res.status(500).send('Error searching for account information');
            } else {
                // Render a page with the search results
                res.render(path.join(filepath, 'CA-ProjectView.ejs'), { results: results });
            }
        });

    } else {
        controller.getProjectView(req.session.UEN, req, function(err, results) {
            if (err) {
                console.error('Error fetching projectview:', err);
                res.status(500).send('Error fetching projectview');
            } else {
                // console.log('Fetched results:', results); // Log the results
                res.render(path.join(filepath, 'CA-ProjectView.ejs'), { results: results }); // Pass 'results' to the template
            }
        });
    }
});

router.get('/reviews', function(req,res){
    controller.getReviews(function(err, results) {
        if (err) {
            console.error('Error fetching Reviews:', err);
            res.status(500).send('Error fetching Reviews');
        } else {
            // console.log('Fetched results:', results); // Log the results
            res.render(path.join(filepath, 'CA-Reviews.ejs'), { results: results }); // Pass 'results' to the template
        }
    });
});

router.post('/reviews', function(req,res){
    const name = req.body.name;
    const rating = req.body.rating;
    const category = req.body.category;
    const message = req.body.reviewmessage;
    const UEN = req.session.UEN;


    entity.submitReview(name, category, rating, message, UEN);
    controller.refreshCAreviews(res);
});

router.get('/employeeadd', function(req,res){
    const UEN = req.session.UEN;

    entity.getdepartmentview(UEN, function (err, CADeptView) {
        if (err) {
            console.error('Error fetching departmentskills:', err);
            res.status(500).send('Error fetching departmentskills');
        } else {
            res.render(path.join(filepath, 'CA-EmployeeAdd.ejs'), {CADeptView: CADeptView});
        }
    });
});

//route for adding employee in CA-EmployeeAdd.ejs
router.post('/EmployeeAdd', function (req, res) {
    const Name = req.body['add-account-Name']; // 
    const Number = req.body['add-account-Number']; // 
    const Email = req.body['add-account-Email']; // 
    const Department = req.body['add-account-Department']; //
    const UEN = req.session.UEN; 
    // const Skills = req.body['add-account-Skills']; // 

    // console.log('Name-CA:', Name); // Check if Name is correct
    // console.log('Number-CA:', Number); // Check if Number is correct
    // console.log('Email-CA:', Email); // Check if Email is correct
    // console.log('Department-CA:', Department); // Check if Department is correct
    
    // Call a function to update the account status in the database
    controller.EmployeeAdd(UEN, Name, Number, Email, Department, req, function (err) {
        if (err) {
            console.error('Error adding employee status:', err);
            res.status(500).send('Error adding employee status SA');
        } else {
            // Redirect back to the /accounts page after successful update
            res.redirect('/CompanyAdmin/employeeview');
        }
    });
});

//route for adding Department in CA-EmployeeAdd.ejs
router.post('/RegisterDepartment', function (req, res) {
    const UEN = req.session.UEN;
    const Department = req.body['add-account-Department']; // 
    const Skills = req.body['add-account-Skills']; // 

    console.log('Department-CA:', Department); // Check if Department is correct
    console.log('Skills-CA Route:', Skills); // Check if Skills is correct
    
    // Call a function to update the account status in the database
    controller.RegisterDepartment(UEN, Department, Skills, req, function (err) {
        if (err) {
            console.error('Error adding employee status:', err);
            res.status(500).send('Error adding employee status SA');
        } else {
            // Redirect back to the /accounts page after successful update
             
        }
    });
    res.redirect('/CompanyAdmin/employeeadd');
});

//route for delete account in CA-EmployeeView.ejs 
router.post('/deleteEmployee', function(req, res, callback){
    const choice = req.body.choice;
    const AccountID = req.body.AccountID;
    // console.log(choice);
    controller.deleteEmployee(req, res, callback, choice, AccountID);
});

router.get('/deleteEmployee', function(req, res) { 
    const AccountID = req.query.AccountID;
    const Name = req.query.Name;
    // console.log('AccountID:', AccountID);
    res.render(path.join(filepath, 'CA-DeleteAccount.ejs'), { AccountID: AccountID, Name: Name });
})

//route for Update DM in CA-EmployeeUpdate.ejs
router.post('/EmployeeUpdate', function (req, res) {
    const DMupdateDapartmentBox = req.body['DMupdateDapartmentBox']; // 
    const DMupdateDapartmentAccountID = req.body['DMupdateDapartmentAccountID']; // 

    // console.log('Department-CAEmployeeUpdate:', DMupdateDapartmentBox); // Check if Name is correct
    // console.log('Department-CAEmployeeUpdateAccountID:', DMupdateDapartmentAccountID); // Check if Name is correct
    
    // Call a function to update the account status in the database
    controller.EmployeeUpdate(DMupdateDapartmentBox, DMupdateDapartmentAccountID, function (err) {
        if (err) {
            console.error('Error Update DM status:', err);
            res.status(500).send('Error Update DM status SA');
        } else {
            // Redirect back to the /accounts page after successful update
            res.redirect('/CompanyAdmin/employeeview');
        }
    });
});

//route for Company Update in CA-CompanyUpdate.ejs
router.post('/companyupdate', function (req, res) {
    const UEN = req.body['update-CompanyUEN']; // 
    const CompanyName = req.body['update-CompanyName']; // 
    const CompanyNumber = req.body['update-CompanyNumber']; // 
    const CompanyAddress = req.body['update-CompanyAddress']; // 
    const CompanyEmail = req.body['update-CompanyEmail']; // 

    // console.log('update-CompanyUEN-CA:', UEN); // Check if UEN is correct
    // console.log('update-CompanyName-CA:', CompanyName); // Check if Name is correct
    // console.log('update-CompanyNumber-CA:', CompanyNumber); // Check if Number is correct
    // console.log('update-CompanyAddress-CA:', CompanyAddress); // Check if Email is correct
    // console.log('update-CompanyEmail-CA:', CompanyEmail); // Check if Department is correct
    
    // Call a function to update the account status in the database
    controller.companyupdate(CompanyName, CompanyNumber, CompanyAddress, CompanyEmail, UEN, function (err) {
        if (err) {
            console.error('Error adding employee status:', err);
            res.status(500).send('Error adding employee status SA');
        } else {
            // Redirect back to the /accounts page after successful update
            res.redirect('/CompanyAdmin/companyview');
        }
    });
});

router.get('/departmentskills', function (req, res) {
    UEN = req.session.UEN;
    const search = req.query.searchInput;

    if (search){
        entity.getdepartmentview(UEN, function (err, CADeptView) {
            if (err) {
                console.error('Error fetching departmentskills:', err);
                res.status(500).send('Error fetching departmentskills');
            } else {
                entity.getdepartmentSkillsSearch(UEN, search , function (err, CADeptSkill) {
                    if (err) {
                        console.error('Error fetching departmentskills:', err);
                        res.status(500).send('Error fetching departmentskills');
                    } else {
                        res.render(path.join(filepath, 'CA-DepartmentSkills.ejs'), { CADeptView: CADeptView,CADeptSkill: CADeptSkill });
                    }
                });
            }
        });
    }else{
        entity.getdepartmentview(UEN, function (err, CADeptView) {
            if (err) {
                console.error('Error fetching departmentskills:', err);
                res.status(500).send('Error fetching departmentskills');
            } else {
                entity.getdepartmentSkills(UEN, function (err, CADeptSkill) {
                    if (err) {
                        console.error('Error fetching departmentskills:', err);
                        res.status(500).send('Error fetching departmentskills');
                    } else {
                        res.render(path.join(filepath, 'CA-DepartmentSkills.ejs'), { CADeptView: CADeptView,CADeptSkill: CADeptSkill });
                    }
                });
            }
        });
    }
});

//route for delete account in CA-EmployeeView.ejs 
router.post('/deleteDepartment', function(req, res, callback){
    UEN = req.session.UEN;
    const choice = req.body.choice;
    const DName = req.body.DName;
    // console.log(choice);
    controller.deleteDepartment(req, res, callback, choice, DName, UEN);
});

router.get('/deleteDepartment', function(req, res) {
    const DName = req.query.DName;
    // console.log('AccountID:', AccountID);
    res.render(path.join(filepath, 'CA-DeleteDepartment.ejs'), { DName: DName });
})

//route for delete account in CA-EmployeeView.ejs 
router.post('/deleteSkills', function(req, res, callback){
    const choice = req.body.choice;
    const DSID = req.body.DSID;
    // console.log(choice);
    controller.deleteSkills(req, res, callback, choice, DSID);
});

router.get('/deleteSkills', function(req, res) { 
    const DSID = req.query.DSID;
    const Skill = req.query.Skill;
    const Department = req.query.Department;
    // console.log('AccountID:', AccountID);
    res.render(path.join(filepath, 'CA-DeleteSkills.ejs'), { DSID: DSID, Skill: Skill, Department: Department });
})

router.post('/Skillsadd', function (req, res) {
    UEN = req.session.UEN;
    const Department = req.body['SkillDepartment'];
    const NewSkill = req.body['NewSkill']; // Get the AccountID from query parameters

    // console.log('updatedDescription-SA:', Description); // Check if updatedStatus is correct

    // Call a function to update the account status in the database
    controller.Skillsadd(Department, NewSkill, UEN,  function (err) {
        if (err) {
            console.error('Error Skillsadd:', err);
            res.status(500).send('Error Skillsadd');
        } else {
            // Redirect back to the /accounts page after successful update
            res.redirect('/CompanyAdmin/departmentskills');
        }
    });
});

// Add a new route to handle AJAX request for fetching skills based on department
router.get('/api/getSkills', function (req, res) {
    const selectedDepartment = req.query.department; // Get the selected department from the query
    const UEN = req.session.UEN;

    console.log('loadSkills function called');

    // Call the controller function to get skills based on the selected department
    controller.getSkillsOptions(UEN, selectedDepartment, function (err, skills) {
        if (err) {
            console.error('Error fetching skills:', err);
            res.status(500).json([]);
        } else {
            res.json(skills);
        }
    });
});

// Add a new route to handle AJAX request for fetching skills based on department
router.get('/api/getEmployees', function (req, res) {
    const UEN = req.session.UEN
    const selectedDepartment = req.query.department; // Get the selected department from the query
    const selectedSkills = req.query.skills;
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;

    // console.log('loadEmployee function called');

    // Call the controller function to get skills based on the selected department
    controller.getUpdateEmployeeOptions(UEN, selectedDepartment, selectedSkills, startDate, endDate, function (err, employees) {
        if (err) {
            console.error('Error fetching Employee:', err);
            res.status(500).json([]);
        } else {
            res.json(employees);
        }
    });
});


router.get('/insufficientManpower', function(req,res){
    res.render(path.join(filepath, 'CA-InsufficientManpower.ejs'));
});

router.get('/projectNameDuplicate', function(req,res){
    res.render(path.join(filepath, 'CA-ProjectNameDuplicate.ejs'));
});

//route for delete Project Members in CA-projectupdate.ejs 
router.post('/RemoveProjectMembers', function(req, res, callback){
    const choice = req.body.choice;
    const AccountID = req.body.AccountID;
    const ProjectID = req.body.ProjectID;
    const UEN = req.session.UEN;

    console.log('choice :', choice);
    console.log('AccountID :', AccountID);
    console.log('ProjectID :', ProjectID);
    console.log('UEN :', UEN);
    //controller.RemoveProjectMembers(req, res, callback, choice, AccountID);
    ///DepartmentManager/projectupdate?ProjectID=<%= DMproject.ProjectID %>&DMprojectUEN=<%= DMproject.UEN %>

    if (choice === 'no') {
        // console.log(1);
        res.redirect(`/CompanyAdmin/projectupdate?ProjectID=${ProjectID}&CAprojectUEN=${UEN}`);
    } else if (choice === 'yes') {
        // console.log(2);
        // Perform the database operations
        controller.RemoveProjectMembers(req, res, callback, choice, AccountID, ProjectID);
        res.redirect(`/CompanyAdmin/projectupdate?ProjectID=${ProjectID}&CAprojectUEN=${UEN}`);
    }
    // res.redirect('back');
    
});

router.get('/RemoveProjectMembers', function(req, res) {
    const AccountID = req.query.AccountID;
    const ProjectID = req.query.ProjectID;
    const EmployeeName = req.query.EmployeeName;
    console.log('AccountID:', AccountID);
    res.render(path.join(filepath, 'CA-RemoveProjectMembers.ejs'), { AccountID: AccountID, ProjectID: ProjectID, EmployeeName: EmployeeName });
})

//route for delete Project in DM-ProjectView.ejs 
router.post('/CAdeleteProject', function(req, res, callback){
    const choice = req.body.choice;
    const ProjectID = req.body.ProjectID;
    // console.log(choice);
    controller.CAdeleteProject(req, res, callback, choice, ProjectID);
});

router.get('/CAdeleteProject', function(req, res) { 
    const ProjectID = req.query.ProjectID;
    const ProjectName = req.query.ProjectName;
    // console.log('AccountID:', AccountID);
    res.render(path.join(filepath, 'CA-DeleteProject.ejs'), { ProjectID: ProjectID, ProjectName: ProjectName });
})

router.get('/ViewAllEmployee', function(req, res) { 
    const UEN = req.session.UEN;
    const department = req.query.CASearchDapartmentBox; 
    // console.log(department);

    if (department){
        entity.getViewAllEmployeeSearch(department, UEN, function(err, results) {
            if (err) {
                console.error('Error fetching account information:', err);
                res.status(500).send('Error fetching account information');
            } else {
                controller.getDepartmentOptions(UEN, function (err, departments) {
                    if (err) {
                        console.error('Error fetching account information:', err);
                        res.status(500).send('Error fetching account information');
                    } else {
                        // Render the CA-EmployeeUpdate.ejs template and pass the results and department options
                        res.render(path.join(filepath, 'CA-ViewAllEmployee.ejs'), { results: results, departments: departments });
                    }
                });
            }
        });

    } else {
        controller.getViewAllEmployee(req, function(err, results) {
            if (err) {
                console.error('Error fetching EmployeeView:', err);
                res.status(500).send('Error fetching EmployeeView');
            } else {
                controller.getDepartmentOptions(UEN, function (err, departments) {
                    if (err) {
                        console.error('Error fetching account information:', err);
                        res.status(500).send('Error fetching account information');
                    } else {
                        // Render the CA-EmployeeUpdate.ejs template and pass the results and department options
                        res.render(path.join(filepath, 'CA-ViewAllEmployee.ejs'), { results: results, departments: departments });
                    }
                });
            }
        });
    }
})

//project member end date extend clash case 1
router.get('/ProjectExtendClash1', function(req, res) { 

    const resultsJSON = req.query.results;
    const results = JSON.parse(resultsJSON);
    const newEndDate = req.query.newEndDate;
    const ProjectName = results[0].ProjectName
    const currEndDate = moment(results[0].EndDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD');
    const EmployeeName = req.query.EmployeeName;

    // console.log('ProjectExtendClash1: ',results);
    // console.log('newEndDate: ',newEndDate);
    // console.log(results[0].ProjectID,' : ',results[0].EndDate);

    res.render(path.join(filepath, 'CA-ProjectExtendClash1.ejs'), { newEndDate: newEndDate, currEndDate: currEndDate, ProjectName: ProjectName, EmployeeName: EmployeeName});
})

router.post('/ProjectExtendClash1', function(req, res) {
    
    const choice = req.body.choice;
    const projectID = req.query.ProjectID;
    const accountID = req.query.AccountID;
    const UEN = req.query.UEN;
    const newEndDate = req.query.newEndDate;
    

    if (choice === 'no') {
        res.redirect(`/CompanyAdmin/projectmemberupdate?ProjectID=${projectID}&AccountID=${accountID}`);
    } else {
        entity.handleClash1(accountID,projectID,newEndDate);
        res.redirect(`/CompanyAdmin/projectupdate?ProjectID=${projectID}&CAprojectUEN=${UEN}`);
    }
    
})

//project member end date extend clash case 2
router.get('/ProjectExtendClash2', function(req, res) {
    const results2JSON = req.query.results2;
    const results2 = JSON.parse(results2JSON);
    const list1 = req.query.list1;
    const list2 = req.query.list2;
    const projectEndDateNeedsExtention = JSON.parse(list1);
    const allocationInOtherProjectsNeedsExtention = JSON.parse(list2);

    // console.log('results2 route : ',results2);

    // console.log('projectEndDateNeedsExtention route : ',projectEndDateNeedsExtention);
    // console.log('projectEndDateNeedsExtention[0] route : ',projectEndDateNeedsExtention[0]);
    // console.log('allocationInOtherProjectsNeedsExtention route : ',allocationInOtherProjectsNeedsExtention);
    
    const newEndDate = req.query.newEndDate;
    const ProjectName = results2[0].ProjectName
    const currEndDate = moment(results2[0].EndDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD');
    const EmployeeName = req.query.EmployeeName;
    let AffectedProjectName = "";

    for (let i = 0; i<results2.length; i++){
        if(AffectedProjectName === ""){
            AffectedProjectName = results2[i].ProjectName;
        }
        else {
            if (i = (results2.length - 1)) {
                AffectedProjectName += " and " + results2[i].ProjectName;
            }else{
                AffectedProjectName += ", " + results2[i].ProjectName;
            }
        }
    }

    const AffectedProjectNames = AffectedProjectName

    // Create an array containing the Start And End Date values from results2
    const results2SDate = results2.map(result => moment(result.StartDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD'));
    const results2EDate = results2.map(result => moment(result.EndDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD'));

    // console.log('ProjectExtendClash2: ',results2);

    res.render(path.join(filepath, 'CA-ProjectExtendClash2.ejs'), { newEndDate: newEndDate, currEndDate: currEndDate, ProjectName: ProjectName, EmployeeName: EmployeeName, AffectedProjectNames: AffectedProjectNames, results2: results2, results2SDate: results2SDate, results2EDate: results2EDate, allocationInOtherProjectsNeedsExtention: allocationInOtherProjectsNeedsExtention, projectEndDateNeedsExtention: projectEndDateNeedsExtention});
})

router.post('/ProjectExtendClash2', function(req, res) {
    
    const choice = req.body.choice;
    const projectID = req.query.ProjectID;
    const accountID = req.query.AccountID;
    const UEN = req.query.UEN;
    const newEndDate = req.query.newEndDate;
    const list1 = req.query.list1;
    const list2 = req.query.list2;
    const projectEndDateNeedsExtention = JSON.parse(list1);
    const allocationInOtherProjectsNeedsExtention = JSON.parse(list2);

    // console.log('projectEndDateNeedsExtention: ', projectEndDateNeedsExtention);
    // console.log('allocationInOtherProjectsNeedsExtention: ', allocationInOtherProjectsNeedsExtention);

    if (choice === 'no') {
        res.redirect(`/CompanyAdmin/projectmemberupdate?ProjectID=${projectID}&AccountID=${accountID}`);
    } else {
        entity.handleClash2part3(accountID,projectID,newEndDate);
        if (projectEndDateNeedsExtention.length > 0) {
            for (const projID of projectEndDateNeedsExtention) {
                const matchingProject = allocationInOtherProjectsNeedsExtention.find(item => item.projectID === projID);
                // Run function with the extracted details
                entity.handleClash2(matchingProject.projectID,matchingProject.endDate);
            } 
        } else {
            console.log('no extention in project end dates');
        }
        for (const object of allocationInOtherProjectsNeedsExtention) {
            entity.handleClash2part2(object.projectID,object.accountID,object.startDate,object.endDate);
        }
        res.redirect(`/CompanyAdmin/projectupdate?ProjectID=${projectID}&CAprojectUEN=${UEN}`);
    }
});


//project member end date extend clash case 3
router.get('/ProjectExtendClash3', function(req, res) {
    const resultsJSON = req.query.results;
    const results = JSON.parse(resultsJSON);
    const results2JSON = req.query.results2;
    const results2 = JSON.parse(results2JSON);
    const list1 = req.query.list1;
    const list2 = req.query.list2;

    const projectEndDateNeedsExtention = JSON.parse(list1);
    const allocationInOtherProjectsNeedsExtention = JSON.parse(list2);

    // console.log('projectEndDateNeedsExtention route : ',projectEndDateNeedsExtention);
    // console.log('projectEndDateNeedsExtention[0] route : ',projectEndDateNeedsExtention[0]);
    // console.log('allocationInOtherProjectsNeedsExtention route : ',allocationInOtherProjectsNeedsExtention);
    const newEndDate = req.query.newEndDate;
    const ProjectName = results[0].ProjectName
    const currEndDate = moment(results[0].EndDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD');
    const EmployeeName = req.query.EmployeeName;
    let AffectedProjectName = "";

    for (let i = 0; i<results2.length; i++){
        if(AffectedProjectName === ""){
            AffectedProjectName = results2[i].ProjectName;
        }
        else {
            if (i = (results2.length - 1)) {
                AffectedProjectName += " and " + results2[i].ProjectName;
            }else{
                AffectedProjectName += ", " + results2[i].ProjectName;
            }
        }
    }

    const AffectedProjectNames = AffectedProjectName

    // Create an array containing the Start And End Date values from results2
    const results2SDate = results2.map(result => moment(result.StartDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD'));
    const results2EDate = results2.map(result => moment(result.EndDate, 'YYYY/MM/DD').add(1, 'days').format('YYYY-MM-DD'));

    res.render(path.join(filepath, 'CA-ProjectExtendClash3.ejs'), { newEndDate: newEndDate, currEndDate: currEndDate, ProjectName: ProjectName, EmployeeName: EmployeeName, results2: results2, results: results, AffectedProjectNames: AffectedProjectNames, results2SDate: results2SDate, results2EDate: results2EDate, allocationInOtherProjectsNeedsExtention: allocationInOtherProjectsNeedsExtention, projectEndDateNeedsExtention: projectEndDateNeedsExtention});
})

router.post('/ProjectExtendClash3', function(req, res) {
    
    const choice = req.body.choice;
    const projectID = req.query.ProjectID;
    const accountID = req.query.AccountID;
    const UEN = req.query.UEN;
    const newEndDate = req.query.newEndDate;
    let results = req.query.results;
    results = JSON.parse(results);
    const list1 = req.query.list1;
    const list2 = req.query.list2;
    const projectEndDateNeedsExtention = JSON.parse(list1);
    const allocationInOtherProjectsNeedsExtention = JSON.parse(list2);

    // console.log('newEndDate: ', newEndDate);
    // console.log('projectID: ', projectID);
    // console.log('results: ', results);

    // console.log('projectEndDateNeedsExtention: ', projectEndDateNeedsExtention);
    // console.log('allocationInOtherProjectsNeedsExtention: ', allocationInOtherProjectsNeedsExtention);


    if (choice === 'no') {
        res.redirect(`/CompanyAdmin/projectmemberupdate?ProjectID=${projectID}&AccountID=${accountID}`);
    } else {
        // console.log('accountID Route Before E :', accountID);
        // console.log('projectID Route Before E :', projectID);
        // console.log('newEndDate Route Before E :', newEndDate);
        controller.handleClash3part1(accountID,projectID,newEndDate);

        if (projectEndDateNeedsExtention.length > 0) {
            for (const projID of projectEndDateNeedsExtention) {
                const matchingProject = allocationInOtherProjectsNeedsExtention.find(item => item.projectID === projID);
                // Run your function with the extracted details
                entity.handleClash3part2(matchingProject.projectID,matchingProject.endDate);
            } 
        } else {
            console.log('no extention in project end dates');
        }
        for (const object of allocationInOtherProjectsNeedsExtention) {
            entity.handleClash3part3(object.projectID,object.accountID,object.startDate,object.endDate);
        }

        res.redirect(`/CompanyAdmin/projectupdate?ProjectID=${projectID}&CAprojectUEN=${UEN}`);
    }
    
})



router.post('/updateEmployeeAssignmentEndDate', function(req, res) { 
    const AccountID = req.body.CurEmpUpAccountID;
    const ProjectID = req.body.CurEmpUpProjectID;
    const endDate = req.body.UpdateEmpEndDate;
    const UEN = req.session.UEN;
    const CurProjectStartDate = req.body.CurProjectStartDate;
    const EmployeeName = req.body.CurProjectEmployeeName;

    controller.updateEmployeeAssignedTimeFrame(AccountID,ProjectID,endDate,CurProjectStartDate,res,UEN,EmployeeName);

})



module.exports = router;