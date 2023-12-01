const express = require('express');
const router = express.Router();
const path = require('path');
const entity = require('../Entity/entity');
const controller = require('../Controller/controller');
const { isEmptyObject } = require('jquery');
const moment = require('moment');

// file path to Boundary folder
const filepath = path.join(__dirname,'../DM-Boundary');


// routes to render web-pages
router.get('/addemployee', function(req,res){
    const selectedDepartment = req.session.Department; // Get the selected department from the query
    const UEN = req.session.UEN;
    console.log(selectedDepartment);
    console.log(UEN);

    controller.getDMSkillsOptions(UEN, selectedDepartment, function(err, skills) {
        if (err) {
            console.error('Error fetching skills:', err);
            res.status(500).send('Error fetching skills:' + err.message);
        } else {
            console.log(skills);
            res.render(path.join(filepath, 'DM-AddEmployee.ejs'), { skills: skills });
        }
    });
});

//route for adding employee in DM-AddEmployees.ejs
router.post('/DMAddEmployees', function (req, res) {
    const UEN = req.session.UEN;
    const Name = req.body['add-account-Name']; // 
    const Number = req.body['add-account-Number']; // 
    const Email = req.body['add-account-Email']; // 
    const Password = 'Password' + Number;
    const Role = 'Employee';
    const Department = req.session.Department; // 
    const Skills = req.body['Skills']; // 

    // console.log('UEN-DM:', UEN); // Check if Name is correct
    // console.log('Name-DM:', Name); // Check if Number is correct
    // console.log('Number-DM:', Number); // Check if Email is correct
    // console.log('Email-DM:', Email); // Check if Department is correct
    // console.log('Password-DM:', Password); // Check if Skills is correct
    // console.log('Role-DM:', Role); // Check if Email is correct
    // console.log('Department-DM:', Department); // Check if Department is correct
    // console.log('Skills-DM:', Skills); // Check if Skills is correct
    
    // Call a function to update the account status in the database
    controller.DMAddEmployees(UEN, Name, Number, Email, Password, Role, Skills, Department, req, function (err) {
        if (err) {
            console.error('Error adding employee status:', err);
            res.status(500).send('Error adding employee status SA');
        } else {
            // Redirect back to the /accounts page after successful update
            res.redirect('/DepartmentManager/employees');
        }
    });
});

router.get('/employees', function(req,res){
    controller.getDMEmployee(req, function(err, results) {
        if (err) {
            console.error('Error fetching EmployeeView:', err);
            res.status(500).send('Error fetching EmployeeView');
        } else {
            // console.log('Fetched results:', results); // Log the results
            res.render(path.join(filepath, 'DM-Employees.ejs'), { results: results }); // Pass 'results' to the template
        }
    });
});

router.post('/employees', function(req,res){
    const name = req.body.searchInput;
    const UEN = req.session.UEN;
    const department = req.session.Department;

    if (name) {
        entity.getDepartmentEmployeeByName(name,UEN,department, function(err,results) {
            if (err) {
                console.error('Error fetching enquiries:', err);
                res.status(500).send('Error fetching enquiries');                
            } else {
                res.render(path.join(filepath, 'DM-Employees.ejs'), { results: results });
            }
        })
    } else {
        controller.getDMEmployee(req, function(err, results) {
            if (err) {
                console.error('Error fetching EmployeeView:', err);
                res.status(500).send('Error fetching EmployeeView');
            } else {
                // console.log('Fetched results:', results); // Log the results
                res.render(path.join(filepath, 'DM-Employees.ejs'), { results: results }); // Pass 'results' to the template
            }
        });
    }
});

router.get('/employeeupdate', function(req,res){

    const AccountID = req.query.AccountID; // Get the AccountID from query parameters
    const UEN = req.session.UEN;

    controller.getDepartmentOptions(UEN, function (err, departments) {
        if (err) {
            console.error('Error fetching department options:', err);
            res.status(500).send('Error fetching department options');
        } else {
            controller.getDMUpdateAccounts(AccountID, function (err, results) {
            if (err) {
                console.error('Error fetching account information:', err);
                res.status(500).send('Error fetching account information');
            } else {
                // Render the CA-EmployeeUpdate.ejs template and pass the results and department options
                res.render(path.join(filepath, 'DM-EmployeeUpdate.ejs'), { results: results, departments: departments });
            }
        });
    }
    });
});

router.post('/employeeupdate', function(req, res) {
    const AccountID = req.body.DMupdateDapartmentAccountID;
    const UpdateDepartment = req.body.DMupdateDapartmentBox;
    const UpdateSkills = req.body.DMupdateSkillsBox;

    entity.DMEmployeeUpdate(UpdateSkills, UpdateDepartment, AccountID, function(err) {
        if (err) {
            console.error('Error updating employee:', err);
            res.status(500).send('Error updating employee');
        }
    });
    res.redirect('/DepartmentManager/employees');
});

router.get('/enquiry', function(req,res){
    controller.getContactInfo(function(err, results) {
        if (err) {
            console.error('Error fetching ContactInfo:', err);
            res.status(500).send('Error fetching ContactInfo');
        } else {
            // console.log('Fetched results:', results); // Log the results
            res.render(path.join(filepath, 'DM-Enquiry.ejs'), { results: results }); // Pass 'results' to the template
        }
    });
});

router.post('/enquiry', function(req,res){
    const name = req.body.name;
    const email = req.body.email;
    const category = req.body.category;
    const message = req.body.message;
    
    entity.submitEnquiry(name, email, category, message);
    controller.refreshDMenquiry(res);
});

router.get('/profileedit', function(req,res){
    res.render(path.join(filepath, 'DM-ProfileEdit.ejs'));
});

router.post('/profileedit', function(req, res, callback){
    const accountID = req.session.AccountID;
    // console.log(accountID);
    const name = req.body.updateaccountname;
    const email = req.body.updateaccountEmail;
    const number = req.body.personalNum;
    const password = req.body.updateaccountPassword;

    entity.updateProfile(accountID, name, email, number, password, callback);
    res.redirect('/DepartmentManager/profileview');

});

router.get('/profileview', function(req,res){
    const accountID  = req.session.AccountID;
    entity.getProfile(accountID, function(err,results) {
        if (err) {
            console.error('Error fetching profile info', err);
            res.status(500).send('Error fetching profile info');
        } else {
            res.render(path.join(filepath, 'DM-ProfileView.ejs'), { results: results });
        }
    });
});

router.get('/projects', function(req,res){
    const search = req.query.projectSearch;

    if (search) {
        // Run a query to display matching information from the database based on the search input
        entity.DMgetSearchProjectView(req.session.UEN, req.session.Department, search, function(err, results) {
            if (err) {
                console.error('Error searching for account information:', err);
                res.status(500).send('Error searching for account information');
            } else {
                // Render a page with the search results
                res.render(path.join(filepath, 'DM-Projects.ejs'), { results: results });
            }
        });

    } else {
        controller.DMgetProjectView(req.session.UEN, req.session.Department, req, function(err, results) {
            if (err) {
                console.error('Error fetching projectview:', err);
                res.status(500).send('Error fetching projectview');
            } else {
                // console.log('Fetched results:', results); // Log the results
                res.render(path.join(filepath, 'DM-Projects.ejs'), { results: results }); // Pass 'results' to the template
            }
        });
    }
});

router.get('/projectupdate', function(req,res){
    const ProjectID = req.query.ProjectID;
    const DMprojectUEN = req.session.UEN;
    const DMprojectDepartment = req.session.Department;
    // console.log('ProjectID :',ProjectID);
    // console.log('DMprojectUEN :',DMprojectUEN);
    // console.log('DMprojectDepartment :',DMprojectDepartment);

    controller.getDMProjectUpdate(ProjectID, function (err, results) {
        if (err) {
            console.error('Error fetching department options:', err);
            res.status(500).send('Error fetching department options');
        } 
        else {
            controller.getDMProjectCurEmp(DMprojectUEN, ProjectID, DMprojectDepartment, function (err, results1) {
                if (err) {
                    console.error('Error fetching department options:', err);
                    res.status(500).send('Error fetching department options');
                }else {
                    // Render the CA-EmployeeUpdate.ejs template and pass the results and department options
                    //res.render(path.join(filepath, 'CA-ProjectUpdate.ejs'), {results: results, results1: results1, results2: results2 });
                    entity.getskillFromDSForDM(DMprojectUEN, DMprojectDepartment, function (err, results2) {
                        if (err) {
                            console.error('Error fetching department options:', err);
                            res.status(500).send('Error fetching department options');
                        } 
                        else {
                            // Render the CA-EmployeeUpdate.ejs template and pass the results and department options
                            res.render(path.join(filepath, 'DM-ProjectUpdate.ejs'), {results: results, results1: results1, results2: results2});
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
    const DMprojectUEN = req.session.UEN;
    // console.log(ProjectID);
    // console.log(DMprojectUEN);
    // console.log(AccountID);
    controller.getCAProjectUpEmp(DMprojectUEN, ProjectID, AccountID, function (err, results1) {
        if (err) {
            console.error('Error fetching department options:', err);
            res.status(500).send('Error fetching department options');
        } 
        else {
            res.render(path.join(filepath, 'DM-ProjectMemberUpdate.ejs'), {results1: results1, UEN: DMprojectUEN, ProjectID: ProjectID});
        }
    });
});

router.post('/DMUpdateProjectDesc', function(req, res, callback){
    const UpdateProjectID = req.body.UpdateProjectID;
    const UpdateProjectDescription = req.body.UpdateProjectDescription;
    const UpdateStartDate = req.body.UpdateStartDate;
    const UpdateEndDate = req.body.UpdateEndDate;

    // console.log(UpdateProjectID);
    // console.log(UpdateProjectDescription);
    // console.log(UpdateStartDate);
    // console.log(UpdateEndDate);

    entity.DMUpdateProjectDesc(UpdateProjectID, UpdateProjectDescription, UpdateStartDate, UpdateEndDate, callback);
    res.redirect('back');

});

router.get('/projectview', function(req,res){
    res.render(path.join(filepath, 'DM-ProjectView.ejs'));
});

router.get('/request', function(req,res){

    const UEN = req.session.UEN;
    const department = req.session.Department;
    console.log(UEN);
    console.log(department);

    entity.getDepartmentRequests(UEN,department, function(err,results) {
        if (err) {
            console.error('Error fetching request info', err);
            res.status(500).send('Error fetching request info');
        } else {
            console.log(results);
            res.render(path.join(filepath, 'DM-Request.ejs'), { results: results });
        }
    });
});

router.post('/request', function(req,res){
    const UEN = req.session.UEN;
    const department = req.session.Department;
    const type = req.body.searchInput;

    if (type) {
        entity.getDepartmentRequestsByType(UEN,department,type, function(err,results) {
            if (err) {
                console.error('Error fetching request:', err);
                res.status(500).send('Error fetching request');                
            } else {
                res.render(path.join(filepath, 'DM-Request.ejs'), { results: results });
            }
        });
    } else {
        entity.getDepartmentRequests(UEN,department, function(err,results) {
            if (err) {
                console.error('Error fetching request info', err);
                res.status(500).send('Error fetching request info');
            } else {
                res.render(path.join(filepath, 'DM-Request.ejs'), { results: results });
            }
        });
    }
});

router.get('/reviews', function(req,res){
    res.render(path.join(filepath, 'DM-Reviews.ejs'));
});

router.post('/reviews', function(req,res){
    const name = req.body.name;
    const rating = req.body.rating;
    const category = req.body.category;
    const message = req.body.reviewmessage;
    const UEN = req.session.UEN;

    entity.submitReview(name, category, rating, message, UEN);
    controller.refreshDMreviews(res);
});

// Add a new route to handle AJAX request for fetching skills based on department
router.get('/api/getSkills', function (req, res) {
    const selectedDepartment = req.query.department; // Get the selected department from the query
    const UEN = req.query.UEN;

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

//route for delete account in CA-EmployeeView.ejs 
router.post('/deleteEmployee', function(req, res, callback){
    const choice = req.body.choice;
    const AccountID = req.body.AccountID;
    // console.log(choice);
    controller.DMdeleteEmployee(req, res, callback, choice, AccountID);
});

router.get('/deleteEmployee', function(req, res) { 
    const AccountID = req.query.AccountID;
    const Name = req.query.Name;
    // console.log('AccountID:', AccountID);
    res.render(path.join(filepath, 'DM-DeleteEmployee.ejs'), { AccountID: AccountID, Name: Name });
})

//route for approve account in SA-PendingRegistration.ejs 
router.get('/approveRequest', function(req, res) {
    const RequestID = req.query.RequestID; // Get the URL parameter
    const StartDate = req.query.StartDate;
    const EndDate = req.query.EndDate;
    const Requestee = req.query.Requestee;
    const AccountID = req.query.AccountID;
    const Skill = req.query.Skill;
    const Department = req.session.Department;
    const UEN = req.session.UEN;
    // console.log(RequestID);
    // console.log(StartDate);
    // console.log(EndDate);
    // console.log(Requestee);
    // console.log(AccountID);
    // console.log(Skill);
    // console.log(Department);
    // console.log(UEN);

    //function to check if the requestee is involved in any project
    controller.CheckRequesteeOnProj(AccountID, StartDate, EndDate, function(err , resultsCRP){
        if (err) {
            console.error('Error Finding CheckRequesteeOnProj:', err);
            res.status(500).send('Error Finding CheckRequesteeOnProj');
        } else {
            //if there is a project involved for the requestee
            if(resultsCRP.length >0){
                // console.log('resultsCRP :',resultsCRP);

                //function to check if there is any other avail employee with the same skill within the department and UEN
                controller.RequestEmpAvail(AccountID, StartDate, EndDate, Skill, Department, UEN, function(err , results) {
                    if (err) {
                        console.error('Error Finding Request Replacement:', err);
                        res.status(500).send('Error Finding Request Replacement');
                    } else {
                        // console.log('results : ',results);
                        // console.log('resultsCRP : ',resultsCRP);

                        //if there is other avail employee with the same skill within the department and UEN
                        if (results.length >0){
                            const NewAccountID = results[0].AccountID;
                            const NewAccountName = results[0].AccountName;
                            const ProjectName = resultsCRP[0].ProjectName;
                            const ProjectID = resultsCRP[0].ProjectID;
                            // console.log('NewAccountID : ', NewAccountID);
                            // console.log('NewAccountName : ', NewAccountName);
                            
                            //redirect IF there is New employee available
                            res.redirect(`/DepartmentManager/RequestChangeAvail?StartDate=${StartDate}&EndDate=${EndDate}&Requestee=${Requestee}&NewAccountID=${NewAccountID}&NewAccountName=${NewAccountName}&RequestID=${RequestID}&ProjectName=${ProjectName}&ProjectID=${ProjectID}&Skill=${Skill}`);Skill
                        }
                        //if there is NO other avail employee with the same skill within the department and UEN
                        else{
                            if(resultsCRP.length >0){
                            const ProjectName = resultsCRP[0].ProjectName;
                            res.redirect(`/DepartmentManager/RequestChangeNoAvail?StartDate=${StartDate}&EndDate=${EndDate}&Requestee=${Requestee}&ProjectName=${ProjectName}&RequestID=${RequestID}`);
                            }
                        }
                        
                    }
                });

            }
            //if there is NO project involved for the Requestee
            else {
                console.log(1);
                // Call the function to approveRequest
                controller.approveRequest(RequestID, function(err) {
                    if (err) {
                        console.error('Error approveRequest:', err);
                        res.status(500).send('Error approveRequest');
                    } else {
                        // Redirect back to the /accounts page after successful deletion
                        res.redirect('/DepartmentManager/request');
                    }
                });
            }

        }
    });
    
});

router.get('/RequestChangeAvail', function(req, res) { 
    const StartDate = req.query.StartDate;
    const EndDate = req.query.EndDate;
    const Requestee = req.query.Requestee;
    const NewAccountID = req.query.NewAccountID;
    const NewAccountName = req.query.NewAccountName;
    const ProjectName = req.query.ProjectName;
    const ProjectID = req.query.ProjectID;
    const RequestID = req.query.RequestID;
    const Skill = req.query.Skill;
    const Department = req.session.Department;

    // console.log(Requestee);
    // console.log(StartDate);
    // console.log(EndDate);

    res.render(path.join(filepath, 'DM-RequestChangeAvail.ejs'), {StartDate, EndDate, Requestee, NewAccountID, NewAccountName, ProjectName, ProjectID, RequestID, Skill, Department });
})

router.post('/RequestChangeAvail', function(req, res) { 

    const RequestID = req.body.RequestID;
    const ProjectName = req.body.ProjectName;
    const ProjectID = req.body.ProjectID;
    const NewAccountName = req.body.NewAccountName;
    const NewAccountID = req.body.NewAccountID;
    const StartDate = req.body.StartDate;
    const EndDate = req.body.EndDate;
    const Skill = req.body.Skill;
    const Department = req.body.Department;
    // console.log(StartDate);
    // console.log(EndDate);

    const StartDateparts = StartDate.split('/');
    const formattedStartDate = `${StartDateparts[2]}-${StartDateparts[1]}-${StartDateparts[0]}`;

    const EndDateparts = EndDate.split('/');
    const formattedEndDate = `${EndDateparts[2]}-${EndDateparts[1]}-${EndDateparts[0]}`;

    // console.log(formattedStartDate);
    // console.log(formattedEndDate);

    // res.redirect('/DepartmentManager/request');

    controller.approveRequest(RequestID, function(err) {
        if (err) {
            console.error('Error approveRequest:', err);
            res.status(500).send('Error approveRequest');
        } else {

            entity.insertProjectDetails(ProjectID, Skill, formattedStartDate, formattedEndDate, Department, NewAccountID, (err, results) => {
                if (err) {
                console.error(`Error inserting ProjectDetails: ${err}`);
                } else {
                console.log(`ProjectDetails inserted successfully: ${results}`);
                }
            });

            // Call function 2 with the corresponding data from array2
            entity.insertAvailability(NewAccountID, ProjectID, formattedStartDate, formattedEndDate, (err, results) => {
                if (err) {
                    console.error(`Error inserting Availability: ${err}`);
                } else {
                    console.log(`Availability inserted successfully: ${results}`);
                }
            });

            // Redirect back to the /accounts page after successful deletion   
            res.redirect('/DepartmentManager/request');
        }
    });
})

router.get('/RequestChangeNoAvail', function(req, res) { 
    const StartDate = req.query.StartDate;
    const EndDate = req.query.EndDate;
    const Requestee = req.query.Requestee;
    const ProjectName = req.query.ProjectName;
    const RequestID = req.query.RequestID;
    // const NewAccountID = req.query.NewAccountID;
    // const NewAccountName = req.query.NewAccountName;

    // console.log(Requestee);
    // console.log(StartDate);
    // console.log(EndDate);

    res.render(path.join(filepath, 'DM-RequestChangeNoAvail.ejs'), {StartDate, EndDate, Requestee, ProjectName, RequestID});
})

router.post('/RequestChangeNoAvail', function(req, res) { 

    const RequestID = req.body.RequestID;

    controller.approveRequest(RequestID, function(err) {
        if (err) {
            console.error('Error approveRequest:', err);
            res.status(500).send('Error approveRequest');
        } else {
            // Redirect back to the /accounts page after successful deletion
            res.redirect('/DepartmentManager/request');
        }
    });
})

//route for decline account in SA-PendingRegistration.ejs  
router.get('/declineRequest', function(req, res) {
    const RequestID = req.query.RequestID; // Get the AccountID from the URL parameter

    // Call a function to delete the account by AccountID from the database
    controller.declineRequest(RequestID, function(err) {
        if (err) {
            console.error('Error declineRequest:', err);
            res.status(500).send('Error declineRequest');
        } else {
            // Redirect back to the /accounts page after successful deletion
            res.redirect('/DepartmentManager/request');
        }
    });
});

router.get('/viewMC', function (req, res) {
    const requestID = req.query.RequestID;

    entity.getMC(requestID, function (err, results) {
        if (err) {
            console.error('Error fetching MC:', err);
            res.status(500).send('Error fetching MC');
        } else {
            if (results.length > 0) {
                const mcData = results[0];
                // Assuming you have a field in your database to store the image type (e.g., 'imageType')
                const imageType = mcData.imageType || 'jpeg'; // Default to JPEG if no imageType found
                res.render(path.join(filepath, 'DM-ViewMC.ejs'), { results: results, imageType: imageType });
            } else {
                res.status(404).send('No MC available for this request.');
            }
        }
    });
});

router.get('/viewallprojects', function(req,res){
    
    const UEN = req.session.UEN;
    const department = req.session.Department;

    controller.getAllProjectSchedulesDM(UEN,department)
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

        res.render(path.join(filepath, 'DM-ViewAllProjects.ejs'), { eventData });
    })
    .catch(error => {
      res.status(500).send('Error fetching event data');
    });

});

router.get('/projectdetailsview', function(req,res){

    const projectID = req.query.ProjectID;
    const ProjectName = req.query.ProjectName;

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
            console.log(eventData);

        res.render(path.join(filepath, 'DM-ProjectDetailsView.ejs'), { eventData, ProjectName });
    })
    .catch(error => {
      res.status(500).send('Error fetching event data');
    });

});

//route for delete Project Members in DM-projectupdate.ejs 
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
        res.redirect(`/DepartmentManager/projectupdate?ProjectID=${ProjectID}&DMprojectUEN=${UEN}`);
    } else if (choice === 'yes') {
        // console.log(2);
        // Perform the database operations
        controller.RemoveProjectMembers(req, res, callback, choice, AccountID, ProjectID);
        res.redirect(`/DepartmentManager/projectupdate?ProjectID=${ProjectID}&DMprojectUEN=${UEN}`);
    }
    // res.redirect('back');
    
});

router.get('/RemoveProjectMembers', function(req, res) { 
    const AccountID = req.query.AccountID;
    const ProjectID = req.query.ProjectID;
    const EmployeeName = req.query.EmployeeName;
    console.log('AccountID:', AccountID);
    res.render(path.join(filepath, 'DM-RemoveProjectMembers.ejs'), { AccountID: AccountID, ProjectID: ProjectID, EmployeeName: EmployeeName });
})

//route for delete Project in DM-ProjectView.ejs 
router.post('/deleteProject', function(req, res, callback){
    const choice = req.body.choice;
    const ProjectID = req.body.ProjectID;
    // console.log(choice);
    controller.deleteProject(req, res, callback, choice, ProjectID);
});

router.get('/deleteProject', function(req, res) {
    const ProjectID = req.query.ProjectID;
    const ProjectName = req.query.ProjectName;
    // console.log('AccountID:', AccountID);
    res.render(path.join(filepath, 'DM-DeleteProject.ejs'), { ProjectID: ProjectID, ProjectName: ProjectName });
})



//////////////////////////////////////////////////////////////////////////////////////
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

    res.render(path.join(filepath, 'DM-ProjectExtendClash1.ejs'), { newEndDate: newEndDate, currEndDate: currEndDate, ProjectName: ProjectName, EmployeeName: EmployeeName});
})

router.post('/ProjectExtendClash1', function(req, res) {
    
    const choice = req.body.choice;
    const projectID = req.query.ProjectID;
    const accountID = req.query.AccountID;
    const UEN = req.query.UEN;
    const newEndDate = req.query.newEndDate;
    

    if (choice === 'no') {
        res.redirect(`/DepartmentManager/projectmemberupdate?ProjectID=${projectID}&AccountID=${accountID}`);
    } else {
        entity.handleClash1(accountID,projectID,newEndDate);
        res.redirect(`/DepartmentManager/projectupdate?ProjectID=${projectID}&DMprojectUEN=${UEN}`);
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

    res.render(path.join(filepath, 'DM-ProjectExtendClash2.ejs'), { newEndDate: newEndDate, currEndDate: currEndDate, ProjectName: ProjectName, EmployeeName: EmployeeName, AffectedProjectNames: AffectedProjectNames, results2: results2, results2SDate: results2SDate, results2EDate: results2EDate, allocationInOtherProjectsNeedsExtention: allocationInOtherProjectsNeedsExtention, projectEndDateNeedsExtention: projectEndDateNeedsExtention});
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
        res.redirect(`/DepartmentManager/projectmemberupdate?ProjectID=${projectID}&AccountID=${accountID}`);
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
        res.redirect(`/DepartmentManager/projectupdate?ProjectID=${projectID}&DMprojectUEN=${UEN}`);
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

    res.render(path.join(filepath, 'DM-ProjectExtendClash3.ejs'), { newEndDate: newEndDate, currEndDate: currEndDate, ProjectName: ProjectName, EmployeeName: EmployeeName, results2: results2, results: results, AffectedProjectNames: AffectedProjectNames, results2SDate: results2SDate, results2EDate: results2EDate, allocationInOtherProjectsNeedsExtention: allocationInOtherProjectsNeedsExtention, projectEndDateNeedsExtention: projectEndDateNeedsExtention});
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
        res.redirect(`/DepartmentManager/projectmemberupdate?ProjectID=${projectID}&AccountID=${accountID}`);
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

        res.redirect(`/DepartmentManager/projectupdate?ProjectID=${projectID}&DMprojectUEN=${UEN}`);
    }
    
})



router.post('/updateEmployeeAssignmentEndDate', function(req, res) { 
    const AccountID = req.body.CurEmpUpAccountID;
    const ProjectID = req.body.CurEmpUpProjectID;
    const endDate = req.body.UpdateEmpEndDate;
    const UEN = req.session.UEN;
    const CurProjectStartDate = req.body.CurProjectStartDate;
    const EmployeeName = req.body.CurProjectEmployeeName;
    const ROLE = req.session.Role;
    // console.log('ROLE Controller : ', ROLE);

    controller.updateEmployeeAssignedTimeFrame(AccountID,ProjectID,endDate,CurProjectStartDate,res,UEN,EmployeeName,ROLE);

})

module.exports = router;