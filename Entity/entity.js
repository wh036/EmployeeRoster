 // Import the database connection
const dbConnection = require('./dbConnection');



function checkUEN(UEN, callback) {

    const sql = `SELECT UEN FROM Company WHERE UEN = ?;`;

    dbConnection.query(sql, [UEN], function (err, results) {
        if (err) {
            callback('Error', err);
        } else {
            callback(null, results);
        }
    });
}

function getAccountInformation(email, password, role, callback) {
    const sql = 'SELECT * FROM Accounts WHERE Email = ? AND Password = ?';
    dbConnection.query(sql, [email, password, role], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

function registerCompany(companyName, companyAddress, companyEmail, companyNumber, UEN, cardNumber, cardExpDate, CVV, industry, ACRAFile) {
    const sql = 'INSERT INTO Company (UEN, CompanyName, CompanyEmail, CompanyNumber, CompanyAddress, CardNumber, CardExpiry, CVV, Status, PaymentStatus, Industry, ACRA) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    dbConnection.query(sql, [UEN, companyName, companyEmail, companyNumber, companyAddress, cardNumber, cardExpDate, CVV, 2, 'paid', industry, ACRAFile], function (err, results) {
        if (err) {
            console.log('Error', err);
        } else {
            console.log('Successful insert', results);
        }
    });
}

function registerCAaccount(name, personalEmail, personalNumber, password, UEN) {
    const sql = 'INSERT INTO Accounts (UEN, Name, Email, Number, Password, Role, Skill, Department, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

    dbConnection.query(sql, [UEN, name, personalEmail, personalNumber, password, 'CompanyAdmin', '', '', 2], function (err, results) {
        if (err) {
            console.log('Error', err);
        } else {
            console.log('Successful insert', results);
        }
    });
}

function submitEnquiry(name, email, category, message) {
    const sql = 'INSERT INTO Enquiry (Name, Email, Message, Category) VALUES (?, ?, ?, ?)';

    dbConnection.query(sql, [name, email, message, category], function(err, results) {
        if (err) {
            console.log('Error', err);
        } else {
            console.log('Successful insert', results);
        }
    });
}

function submitReview(name, category, rating, message, UEN) {
    const sqlQuery = `SELECT * FROM Company WHERE UEN = ?;`

    if (rating >= 4) {
        dbConnection.query(sqlQuery, [UEN], function(err, results1) {
            if (err) {
                console.log('Error', err);
            } else {
                console.log('Successful insert', results1);
    
                const companyName = results1[0].CompanyName;
                const industry = results1[0].Industry;
    
                const sql = 'INSERT INTO Reviews (Name, Category, Rating, Message, Post, CompanyName, Industry) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
                dbConnection.query(sql, [name, category, rating, message, 'Posted', companyName, industry], function(err, results) {
                    if (err) {
                        console.log('Error', err);
                    } else {
                        console.log('Successful insert', results);
                    }
                });
            }
        });
    } else {
        dbConnection.query(sqlQuery, [UEN], function(err, results1) {
            if (err) {
                console.log('Error', err);
            } else {
                console.log('Successful insert', results1);
    
                const companyName = results1[0].CompanyName;
                const industry = results1[0].Industry;
    
                const sql = 'INSERT INTO Reviews (Name, Category, Rating, Message, Post, CompanyName, Industry) VALUES (?, ?, ?, ?, ?, ?, ?)';
    
                dbConnection.query(sql, [name, category, rating, message, 'Unposted', companyName, industry], function(err, results) {
                    if (err) {
                        console.log('Error', err);
                    } else {
                        console.log('Successful insert', results);
                    }
                });
            }
        });
    }
}

function getContactInfo(callback) {
    const sql = 'SELECT * FROM ContactInformation;';

    dbConnection.query(sql, function(err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

function getCAinfoFromUEN(UEN, callback){
    const sql = `SELECT 
    c.UEN as CompanyUEN,
    c.CompanyName,
    c.CompanyEmail,
    c.CompanyNumber,
    c.CompanyAddress,
    a.AccountID,
    a.Name as AccountName,
    a.Email as AccountEmail,
    a.Number as AccountNumber,
    a.Status
    FROM 
    Company c
    INNER JOIN 
    Accounts a ON c.UEN = a.UEN
    WHERE 
    c.UEN = ? AND a.Role = 'CompanyAdmin';`;

    dbConnection.query(sql, [UEN], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });


}

function getEnquiryByCategory(category, callback){

    const sql = 'SELECT * FROM Enquiry WHERE Category = ?;';

    dbConnection.query(sql, [category], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

function getReviewByCategory(category, callback){

    const sql = 'SELECT * FROM Reviews WHERE Category = ?;';

    dbConnection.query(sql, [category], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

// Function for Company Update in CA-CompanyUpdate.ejs
function updatecontactinfo(ContactNumber, CompanyEmail, CompanyAddress, callback) {
    console.log(ContactNumber);
    console.log(CompanyEmail);
    console.log(CompanyAddress);
    const updatecontactSQL = `
        UPDATE ContactInformation
        SET 
        ContactNumber = CASE WHEN ? <> '' THEN ? ELSE ContactNumber END,
        Email = CASE WHEN ? <> '' THEN ? ELSE Email END,
        Address = CASE WHEN ? <> '' THEN ? ELSE Address END;
    `;

    // Execute the UPDATE query
    dbConnection.query(
        updatecontactSQL,
        [ContactNumber, ContactNumber, CompanyEmail, CompanyEmail, CompanyAddress, CompanyAddress],
        function (err, accountResults) {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        }
    );
}

function updateProfile(accountID, name, email, number, password , callback) {
    // console.log(accountID);
    // console.log(name);
    // console.log(email);
    // console.log(number);
    // console.log(password);

    // Convert an empty string to NULL for the 'Number' column
    if (number === '') {
        number = null;
    }

    // Define the SQL query with conditional logic
    const sql = `UPDATE Accounts 
        SET Name = CASE WHEN ? IS NOT NULL AND ? <> '' THEN ? ELSE Name END,
            Email = CASE WHEN ? IS NOT NULL AND ? <> '' THEN ? ELSE Email END,
            Number = CASE WHEN ? IS NOT NULL THEN ? ELSE Number END,
            Password = CASE WHEN ? IS NOT NULL AND ? <> '' THEN ? ELSE Password END
        WHERE AccountID = ?;`

    // Provide values for the placeholders
    const values = [name, name, name, email, email, email, number, number, password, password, password, accountID];

    dbConnection.query(sql, values, (err, results) => {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

//for Company Admin
function getEmployeeByDepartment(department, UEN, callback){
    const sql = 'SELECT * FROM Accounts WHERE Role = "DepartmentManager" AND Department = ? AND UEN = ?;';

    dbConnection.query(sql, [department, UEN], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

function getProfile(accountID, callback) {
    const sql = 'SELECT * FROM Accounts WHERE AccountID = ?';

    dbConnection.query(sql, [accountID], (err, results)  => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });

}

// Function to get SystemAdmin accounts on SA-Accounts
function getCompanyAdminAccounts(callback) {
    const sql = `
        SELECT
            c.UEN AS CompanyUEN,
            c.CompanyName,
            c.CompanyEmail,
            c.CompanyNumber,
            c.CompanyAddress,
            a.AccountID,
            a.Name AS AccountName,
            a.Email AS AccountEmail,
            a.Number AS AccountNumber,
            a.Status
        FROM
            Company c
        INNER JOIN
            Accounts a ON c.UEN = a.UEN
        WHERE
            a.Role = 'CompanyAdmin'
        AND
            a.Status != 2;
    `;

    dbConnection.query(sql, function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

// Function to get CompanyAdmin Update accounts based on AccountID on SA-UpdateAccount
function getCompanyAdminUpdateAccounts(AccountID, callback) {
    const sql = `
        SELECT
            c.UEN AS CompanyUEN,
            c.CompanyName,
            c.CompanyEmail,
            c.CompanyNumber,
            c.CompanyAddress,
            a.AccountID,
            a.Name AS AccountName,
            a.Email AS AccountEmail,
            a.Number AS AccountNumber,
            a.Status
        FROM
            Company c
        INNER JOIN
            Accounts a ON c.UEN = a.UEN
        WHERE
            a.AccountID = ?;`;

    dbConnection.query(sql, [AccountID], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

// Function to delete an account by AccountID on SA-UpdateAccount
function deleteAccount(callback, CompanyUEN) {
    const sqlCompany = 'DELETE FROM Company WHERE UEN = ?';

    // Execute the DELETE query
    dbConnection.query(sqlCompany, [CompanyUEN], function(err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

// Function to update account status by CompanyUEN on SA-UpdateAccount
function updateAccountStatus(CompanyUEN, updatedStatus, callback) {
    const accountUpdateSQL = 'UPDATE Accounts SET Status = ? WHERE UEN = ?';
    const companyUpdateSQL = 'UPDATE Company SET Status = ? WHERE UEN = ?';

    // Execute the first UPDATE query to update the account status
    dbConnection.query(accountUpdateSQL, [updatedStatus, CompanyUEN], function (err, accountResults) {
        if (err) {
            callback(err);
        } else {
            // Execute the second UPDATE query to update the company status
            dbConnection.query(companyUpdateSQL, [updatedStatus, CompanyUEN], function (err, companyResults) {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            });
        }
    });
}

// Function to get SystemAdmin accounts on SA-Accounts
function getSAEnquiries(callback) {
    const sql = `SELECT * FROM Enquiry;`;

    dbConnection.query(sql, function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

// Function to get SystemAdmin pending accounts on SA-PendingRegistration
function getSAPendingAccounts(callback) {
    const sql = `SELECT * FROM Company WHERE Status = 2;`;

    dbConnection.query(sql, function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

// Function to approve account by UEN on SA-pendingregistration
function approveAccount(UEN, callback) {
    const accountUpdateSQL = 'UPDATE Accounts SET Status = 1 WHERE UEN = ?';
    const companyUpdateSQL = 'UPDATE Company SET Status = 1 WHERE UEN = ?';

    // Execute the first UPDATE query to update the account status
    dbConnection.query(companyUpdateSQL, [UEN], function (err, results) {
        if (err) {
            callback(err);
        } else {
            // Execute the second UPDATE query to update the company status
            dbConnection.query(accountUpdateSQL, [UEN], function (err, results) {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            });
        }
    });
}

// Function to decline account by UEN on SA-pendingregistration
function declineAccount(UEN, callback) {
    const declineAccountsql = 'DELETE FROM Accounts WHERE UEN = ?';
    const declineCompanysql = 'DELETE FROM Company WHERE UEN = ?';

    // Execute the first DELETE query to delete records from the accounts table
    dbConnection.query(declineAccountsql, [UEN], function (err, declineAccountResults) {
        if (err) {
            callback(err);
        } else {
            // Execute the second DELETE query to delete records from the company table
            dbConnection.query(declineCompanysql, [UEN], function (err, declineCompanyResults) {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            });
        }
    });
}

// Function to get Reviews
function getReviews(callback) {
    const sql = `SELECT * FROM Reviews;`;

    dbConnection.query(sql, function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

// Function to get projectview
// For Company Admin
// GROUP_CONCAT(CONCAT(PSMP.Skill, '-', PSMP.ManPower)) AS Skills
function getProjectView(UEN, callback) {
    const sql = `
    SELECT
        P.ProjectID,
        P.ProjectName,
        P.ProjectDescription,
        DATE_FORMAT(P.StartDate, '%Y-%m-%d') AS StartDate,
        DATE_FORMAT(P.EndDate, '%Y-%m-%d') AS EndDate,
        DATEDIFF(P.EndDate, P.StartDate) AS Duration,
        GROUP_CONCAT(DISTINCT PD.Department ORDER BY PD.Department ASC) AS Departments,
        GROUP_CONCAT(DISTINCT PSMP.Skill ORDER BY PSMP.Skill ASC) AS Skills,
        COUNT(DISTINCT PD.AccountID) AS ManpowerCount,
        COUNT(PSMP.Skill) AS SkillCount,
        P.UEN AS UEN
    FROM
        Projects AS P
    JOIN
        ProjectDetails AS PSMP ON P.ProjectID = PSMP.ProjectID
    LEFT JOIN
        ProjectDetails AS PD ON P.ProjectID = PD.ProjectID
    WHERE
        P.UEN = ?
    GROUP BY
        P.ProjectID, P.ProjectName, P.ProjectDescription, StartDate, EndDate, Duration;


    `;

    dbConnection.query(sql, [UEN], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

// Function to get projectview
// For Company Admin
// GROUP_CONCAT(CONCAT(PSMP.Skill, '-', PSMP.ManPower)) AS Skills
function getSearchProjectView(UEN, search, callback) {
    const sql = `
    SELECT
        P.ProjectID,
        P.ProjectName,
        P.ProjectDescription,
        DATE_FORMAT(P.StartDate, '%Y-%m-%d') AS StartDate,
        DATE_FORMAT(P.EndDate, '%Y-%m-%d') AS EndDate,
        DATEDIFF(P.EndDate, P.StartDate) AS Duration,
        GROUP_CONCAT(DISTINCT PD.Department ORDER BY PD.Department ASC) AS Departments,
        GROUP_CONCAT(DISTINCT PSMP.Skill ORDER BY PSMP.Skill ASC) AS Skills,
        COUNT(DISTINCT PD.AccountID) AS ManpowerCount,
        COUNT(PSMP.Skill) AS SkillCount,
        P.UEN AS UEN
    FROM
        Projects AS P
    JOIN
        ProjectDetails AS PSMP ON P.ProjectID = PSMP.ProjectID
    LEFT JOIN
        ProjectDetails AS PD ON P.ProjectID = PD.ProjectID
    WHERE
        P.UEN = ?
    AND 
        P.ProjectName LIKE ?
    GROUP BY
        P.ProjectID, P.ProjectName, P.ProjectDescription, StartDate, EndDate, Duration;
    `;

    dbConnection.query(sql, [UEN, search], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

// Function to get DMprojectview
// GROUP_CONCAT(CONCAT(PSMP.Skill, '-', PSMP.ManPower)) AS Skills,
// SUM(PSMP.ManPower) AS Manpower
function DMgetProjectView(UEN, Department, callback) {
    const sql = `
    SELECT
        P.ProjectID,
        P.ProjectName,
        P.ProjectDescription,
        DATE_FORMAT(P.StartDate, '%Y-%m-%d') AS StartDate,
        DATE_FORMAT(P.EndDate, '%Y-%m-%d') AS EndDate,
        DATEDIFF(P.EndDate, P.StartDate) AS Duration,
        GROUP_CONCAT(DISTINCT PD.Department ORDER BY PD.Department ASC) AS Departments,
        GROUP_CONCAT(DISTINCT PSMP.Skill ORDER BY PSMP.Skill ASC) AS Skills,
        COUNT(DISTINCT PD.AccountID) AS ManpowerCount,
        COUNT(PSMP.Skill) AS SkillCount,
        P.UEN AS UEN,
        (SELECT COUNT(DISTINCT AccountID) FROM ProjectDetails AS PDManpower WHERE PDManpower.ProjectID = P.ProjectID) AS TotalManpower
    FROM
        Projects AS P
    JOIN
        ProjectDetails AS PSMP ON P.ProjectID = PSMP.ProjectID
    LEFT JOIN
        ProjectDetails AS PD ON P.ProjectID = PD.ProjectID
    WHERE
        P.UEN = ?
    AND 
        PD.Department = ?
    GROUP BY
        P.ProjectID, P.ProjectName, P.ProjectDescription, StartDate, EndDate, Duration;
    `;

    dbConnection.query(sql, [UEN, Department], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

// For Department Manager
// GROUP_CONCAT(CONCAT(PSMP.Skill, '-', PSMP.ManPower)) AS Skills,
// SUM(PSMP.ManPower) AS Manpower
function DMgetSearchProjectView(UEN, Department, search, callback) {
    const sql = `
    SELECT
        P.ProjectID,
        P.ProjectName,
        P.ProjectDescription,
        DATE_FORMAT(P.StartDate, '%Y-%m-%d') AS StartDate,
        DATE_FORMAT(P.EndDate, '%Y-%m-%d') AS EndDate,
        DATEDIFF(P.EndDate, P.StartDate) AS Duration,
        GROUP_CONCAT(DISTINCT PD.Department ORDER BY PD.Department ASC) AS Departments,
        GROUP_CONCAT(DISTINCT PSMP.Skill ORDER BY PSMP.Skill ASC) AS Skills,
        COUNT(DISTINCT PD.AccountID) AS ManpowerCount,
        COUNT(PSMP.Skill) AS SkillCount,
        P.UEN AS UEN,
        (SELECT COUNT(DISTINCT AccountID) FROM ProjectDetails AS PDManpower WHERE PDManpower.ProjectID = P.ProjectID) AS TotalManpower
    FROM
        Projects AS P
    JOIN
        ProjectDetails AS PSMP ON P.ProjectID = PSMP.ProjectID
    LEFT JOIN
        ProjectDetails AS PD ON P.ProjectID = PD.ProjectID
    WHERE
        P.UEN = ?
    AND 
        PD.Department = ?
    AND
        P.ProjectName like ?
    GROUP BY
        P.ProjectID, P.ProjectName, P.ProjectDescription, StartDate, EndDate, Duration;
    `;

    dbConnection.query(sql, [UEN, Department, search], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

// Function to get SystemAdmin accounts on SA-Accounts
function getEmployeeView(UEN, callback) {
    const sql = `
        SELECT
            *
        FROM
            Accounts
        WHERE
            Role = 'DepartmentManager'
        AND
            UEN = ?;
    `;

    dbConnection.query(sql, [UEN], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

function getViewAllEmployee(UEN, callback) {
    const sql = `
    SELECT
        Name,
        MAX(Email) AS Email,
        MAX(Number) AS Number,
        MAX(Role) AS Role,
        MAX(Department) AS Department,
        MAX(Skill) AS Skill,
        COUNT(*) AS EmployeeCount
    FROM
        Accounts
    WHERE
        Role = 'Employee'
        AND UEN = ?
    GROUP BY
        Name;

    `;

    dbConnection.query(sql, [UEN], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

function getViewAllEmployeeSearch(department, UEN, callback) {
    const sql = `
        SELECT
            *
        FROM
            Accounts
        WHERE
            Role = 'Employee'
        AND
            Department LIKE ?
        AND
            UEN = ?;
    `;

    dbConnection.query(sql, [department, UEN], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

// Function to adding employee and department skills in CA-EmployeeAdd.ejs
function EmployeeAdd(UEN, Name, Number, Email, Department, req, callback) {
    const EmployeeAddSQL = 'INSERT INTO Accounts (UEN, Name, Email, Number, Password, Role, Skill, Department, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const Password = 'Password' + Number;
    // const skillsArray = Skills.split(', ');
    // console.log('Skills :',Skills);
    // console.log('skillsArray :',skillsArray);

    // Execute the first UPDATE query to update the account status
    dbConnection.query(EmployeeAddSQL, [UEN, Name, Email, Number, Password, 'DepartmentManager', '',  Department, 1], function (err, URpostEnquiryResults) {
        if (err) {
            callback(err);
        } else {
            // Insert skills into the DepartmentSkills table
            // if (Skills){
            //     const skillsArray = Skills.split(', '); // Split skills by comma
            //     const insertSkillSQL = 'INSERT INTO DepartmentSkills (UEN, Department, Skill) VALUES (?, ?, ?)';
                
            //     skillsArray.forEach(skill => {
            //         dbConnection.query(insertSkillSQL, [UEN, Department, skill], function (skillErr, skillResult) {
            //             if (skillErr) {
            //                 // Handle skill insertion error if needed
            //             }
            //         });
            //     });
            // }

            callback(null, URpostEnquiryResults);
        }
    });
}

function RegisterDepartment(UEN, Department, Skills, callback){
    console.log('Skills-CA enitity:', Skills);
    const skillsArray = Skills.split(', '); // Split skills by comma
    const insertSkillSQL = 'INSERT INTO DepartmentSkills (UEN, Department, Skill) VALUES (?, ?, ?)';
    
    console.log('skillsArray enitity:', skillsArray);
    skillsArray.forEach(skill => {
        dbConnection.query(insertSkillSQL, [UEN, Department, skill], function (skillErr, skillResult) {
            if (skillErr) {
                console.log('register department fail');
            }
        });
    });
}

// Function to delete an account by AccountID on SA-UpdateAccount
function deleteEmployee(callback, AccountID) {
    const sqlAccount = 'DELETE FROM Accounts WHERE AccountID = ?';
    // console.log(AccountID);

    // Execute the DELETE query
    dbConnection.query(sqlAccount, [AccountID], function(err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

// Function to get CompanyAdmin Update accounts based on AccountID on SA-UpdateAccount
function getCAUpdateAccounts(AccountID, callback) {
    const sql = `
    SELECT
        *
    FROM
        Accounts
    WHERE
        AccountID = ?;`;

    dbConnection.query(sql, [AccountID], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

function getDepartmentOptions(UEN, callback) {
    const sql = 'SELECT DISTINCT Department FROM DepartmentSkills WHERE UEN = ?';

    dbConnection.query(sql, [UEN], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            const departments = results.map(result => result.Department);
            callback(null, departments);
        }
    });
}


function getCADepartmentOptions(UEN, callback) {
    const sql = 'SELECT DISTINCT Department FROM DepartmentSkills WHERE UEN = ?'; // Replace 'YourDepartmentTable' with your actual table name.

    dbConnection.query(sql, [UEN], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            const departments = results.map(result => result.Department);
            callback(null, departments);
        }
    });
}

// Function for Update DM in CA-EmployeeUpdate.ejs
function EmployeeUpdate(DMupdateDapartmentBox, DMupdateDapartmentAccountID, callback) {
    const EmployeeUpdateSQL = 'UPDATE Accounts SET Department = ? WHERE AccountID = ?';

    // Execute the first UPDATE query to update the account status
    dbConnection.query(EmployeeUpdateSQL, [DMupdateDapartmentBox, DMupdateDapartmentAccountID], function (err, accountResults) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

// Function to get CA Company View
function getCAcompanyView(UEN, callback) {


    const sql = `
    SELECT
        c.UEN,
        c.CompanyName,
        c.CompanyNumber,
        c.CompanyAddress,
        c.CompanyEmail,
        GROUP_CONCAT(DISTINCT ds.Department) AS Departments
    FROM
        Company c
    LEFT JOIN
        DepartmentSkills ds ON c.UEN = ds.UEN
    WHERE
        c.UEN = ?
    GROUP BY
        c.UEN, c.CompanyName, c.CompanyNumber, c.CompanyAddress, c.CompanyEmail;
    `;

    dbConnection.query(sql, [UEN], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

// Function for Company Update in CA-CompanyUpdate.ejs
function companyupdate(CompanyName, CompanyNumber, CompanyAddress, CompanyEmail, UEN, callback) {
    const companyupdateSQL = `
        UPDATE Company
        SET 
            CompanyName = CASE WHEN ? <> '' THEN ? ELSE CompanyName END,
            CompanyNumber = CASE WHEN ? <> '' THEN ? ELSE CompanyNumber END,
            CompanyAddress = CASE WHEN ? <> '' THEN ? ELSE CompanyAddress END,
            CompanyEmail = CASE WHEN ? <> '' THEN ? ELSE CompanyEmail END
        WHERE 
            UEN = ?;
    `;

    // Execute the UPDATE query
    dbConnection.query(
        companyupdateSQL,
        [CompanyName, CompanyName, CompanyNumber, CompanyNumber, CompanyAddress, CompanyAddress, CompanyEmail, CompanyEmail, UEN],
        function (err, accountResults) {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        }
    );
}

// Function to get accounts for DM-Employees
function getDMEmployee(UEN, Department, callback) {
    const sql = `
        SELECT
            *
        FROM
            Accounts
        WHERE
            UEN = ?
        AND
            Role = 'Employee'
        AND
            Department = ?;
    `;

    dbConnection.query(sql, [UEN, Department], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

function getSkillsOptions(UEN, Department, callback) {
    // Modify the SQL query to retrieve skills based on the selected department
    const sql = `SELECT DISTINCT Skill
    FROM Accounts
    WHERE UEN = ? AND Department = ? AND Role = "Employee"`;

    dbConnection.query(sql, [UEN, Department], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            const skills = results.map(result => result.Skill);
            callback(null, skills);
        }
    });
}

function getDMSkillsOptions(UEN, Department, callback) {
    // Modify the SQL query to retrieve skills based on the selected department
    const sql = `SELECT DISTINCT Skill
    FROM DepartmentSkills
    WHERE UEN = ? AND Department = ?`;

    dbConnection.query(sql, [UEN, Department], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            const skills = results.map(result => result.Skill);
            callback(null, skills);
        }
    });
}

function CheckRequesteeOnProj(AccountID, StartDate, EndDate, callback){
    // console.log(StartDate);
    // console.log(EndDate);

    const sql = `SELECT a.ProjectID, p.ProjectName
    FROM Availability a
    JOIN Projects p ON a.ProjectID = p.ProjectID
    WHERE a.AccountID = ?
    AND DATE_FORMAT(a.StartDate, '%d/%m/%Y') <= ?
    AND DATE_FORMAT(a.EndDate, '%d/%m/%Y') >= ?;
    `;

    dbConnection.query(sql, [AccountID, StartDate, EndDate ], function (err, resultsCRP) {
        if (err) {
            callback(err, null);
        } else {
            // console.log('resultsCRP entity ', resultsCRP);
            callback(null, resultsCRP);
        }
    });
}

function RequestEmpAvail(AccountID, StartDate, EndDate, Skill, Department, UEN, callback) {
    // console.log('RequestEmpAvail Entity StartDate :', StartDate);
    // console.log('RequestEmpAvail Entity EndDate :', EndDate);

    // Modify the SQL query to retrieve skills based on the selected department
    const sql = `SELECT a.AccountID AS AccountID, a.Name AS AccountName
    FROM Accounts a
    WHERE a.AccountID != ?  -- AccountID is not the same as the input variable
      AND a.Skill = ? -- Skill matches the input variable
      AND a.UEN = ?          -- UEN matches the input variable
        AND a.Department = ?    -- Department matches the input variable
      AND (
        -- Check if there is no matching Availability record
        NOT EXISTS (
          SELECT 1
          FROM Availability av
          WHERE a.AccountID = av.AccountID
        )
        OR
        -- Check if there is a matching Availability record and it fits the date range requirement
        EXISTS (
          SELECT 1
          FROM Availability av
          WHERE a.AccountID = av.AccountID
          AND (
            STR_TO_DATE(av.StartDate, '%d/%m/%Y') <= STR_TO_DATE(?, '%d/%m/%Y') AND STR_TO_DATE(av.EndDate, '%d/%m/%Y') >= STR_TO_DATE(?, '%d/%m/%Y')
            OR STR_TO_DATE(av.StartDate, '%d/%m/%Y') >= STR_TO_DATE(?, '%d/%m/%Y') AND STR_TO_DATE(av.EndDate, '%d/%m/%Y') <= STR_TO_DATE(?, '%d/%m/%Y')
            OR STR_TO_DATE(av.StartDate, '%d/%m/%Y') <= STR_TO_DATE(?, '%d/%m/%Y') AND STR_TO_DATE(av.EndDate, '%d/%m/%Y') >= STR_TO_DATE(?, '%d/%m/%Y')
            OR STR_TO_DATE(av.StartDate, '%d/%m/%Y') <= STR_TO_DATE(?, '%d/%m/%Y') AND STR_TO_DATE(av.EndDate, '%d/%m/%Y') >= STR_TO_DATE(?, '%d/%m/%Y')
          )
        )
      );`;

    dbConnection.query(sql, [AccountID, Skill, UEN, Department, StartDate, EndDate, StartDate, EndDate, StartDate, StartDate, EndDate, EndDate], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            // console.log('NewAccountID2 entity ', results);
            callback(null, results);
        }
    });
}

// get employee options for CA-ProjectUpdates.ejs
function getUpdateEmployeeOptions(UEN, selectedDepartment, selectedSkills, startDate, endDate, callback) {
    // Modify the SQL query to retrieve skills based on the selected department
    const sql = `SELECT A.AccountID, A.Name, A.Skill
    FROM Accounts A
    WHERE A.UEN = ? 
        AND A.Department = ? 
        AND A.Skill = ?
        AND NOT EXISTS (
            SELECT 1
            FROM Availability Av
            WHERE Av.AccountID = A.AccountID
            AND (
                ((Av.StartDate <= ? AND Av.EndDate >= ?)
                OR (Av.StartDate >= ? AND Av.EndDate <= ?)
                OR (Av.StartDate <= ? AND Av.EndDate >= ?)
                OR (Av.StartDate <= ? AND Av.EndDate >= ?)
            )
        ));
    `;

    dbConnection.query(sql, [UEN, selectedDepartment, selectedSkills, startDate,endDate,startDate,endDate,startDate,startDate,endDate,endDate], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            const employees = results.map(result => {
                return {
                    AccountID: result.AccountID,
                    Name: result.Name,
                    Skill: result.Skill
                };
            });
            callback(null, employees);
        }
    });
}

function CAAddProjectMembers(UpdateEmpProjectID, UpdateEmpdepartment, UpdateEmpSkills, UpdateEmpStartDate, UpdateEmpEndDate, UpdateEmpID, callback){

    // console.log('Entity:', UpdateEmpProjectID);
    // console.log('Entity:', UpdateEmpdepartment);
    // console.log('Entity:', UpdateEmpSkills);
    // console.log('Entity:', UpdateEmpStartDate);
    // console.log('Entity:', UpdateEmpEndDate);
    // console.log('Entity:', UpdateEmpID);

    const PDsql = 'INSERT INTO ProjectDetails (ProjectID, Skill, StartDate, EndDate, Department, AccountID) VALUES (?, ?, ?, ?, ?, ?)';
    const Availabilitysql = `INSERT INTO Availability (AccountID, ProjectID, StartDate, EndDate) VALUES (?, ?, ?, ?)`;


    dbConnection.query(PDsql, [UpdateEmpProjectID, UpdateEmpSkills, UpdateEmpStartDate, UpdateEmpEndDate, UpdateEmpdepartment, UpdateEmpID], function (err, PDsqlresults) {
        if (err) {
            callback(err, null);
        } else {
            dbConnection.query(Availabilitysql, [UpdateEmpID, UpdateEmpProjectID, UpdateEmpStartDate, UpdateEmpEndDate], function (err, Availabilitysqlresults) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, Availabilitysqlresults);
                }
            });
        }
    });

}

// Function to getURdescription
function getURdescription(callback) {
    const sql = `
        SELECT
            *
        FROM
            ProductDescription;
    `;

    dbConnection.query(sql, function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

// Function to getURfeatures
function getURfeatures(callback) {
    const sql = `
        SELECT
            *
        FROM
            Features;
    `;

    dbConnection.query(sql, function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

// Function to getURreview
function getURreview(callback) {
    const sql = `
    SELECT
    *
    FROM Reviews
    WHERE Post = 'Posted';
    `;

    dbConnection.query(sql, function (err, featuresresults) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, featuresresults);
        }
    });
}

// Function to updateDescription
function updateDescription(Description, callback) {
    const sql = `
    UPDATE ProductDescription SET ProductDescripition = ?
    `;

    dbConnection.query(sql, [Description], function (err, featuresresults) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, featuresresults);
        }
    });
}

// Function to addFeatures
function addFeatures(Feature, Description, callback) {

    const sql = 'INSERT INTO Features (Feature, Description) VALUES (?, ?)';

    // Execute the first UPDATE query to update the account status
    dbConnection.query(sql, [Feature, Description], function (err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null, results);
        }
    });
}

// Function to delete feature
function deleteFeature(callback, id) {
    const sql = 'DELETE FROM Features WHERE PageID = ?';

    // Execute the DELETE query
    dbConnection.query(sql, [id], function(err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

// Function to delete feature
function deleteReview(callback, id) {
    const sql = 'DELETE FROM Reviews WHERE ReviewID = ?';

    // Execute the DELETE query
    dbConnection.query(sql, [id], function(err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

// Function to delete enquiries
function deleteEnquiry(callback, id) {
    const sql = 'DELETE FROM Enquiry WHERE EnquiryID = ?';

    // Execute the DELETE query
    dbConnection.query(sql, [id], function(err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

// Function for Company Update in CA-CompanyUpdate.ejs
function postReview(callback, choice, ReviewID) {
    const postReviewSQL = `
        UPDATE Reviews
        SET 
        Post = ?
        WHERE ReviewID = ?;
    `;

    // Execute the UPDATE query
    dbConnection.query(
        postReviewSQL,
        [choice, ReviewID],
        function (err, Results) {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        }
    );
}

function getdepartmentview(UEN, callback) {
    const sql = 'SELECT DISTINCT Department FROM DepartmentSkills WHERE UEN = ?';

    dbConnection.query(sql, [UEN], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

function getdepartmentSkills(UEN, callback) {
    const sql = 'SELECT * FROM DepartmentSkills WHERE UEN = ? ORDER BY Department';

    dbConnection.query(sql, [UEN], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

function getdepartmentSkillsSearch(UEN, search, callback) {
    const sql = 'SELECT * FROM DepartmentSkills WHERE UEN = ? AND Skill like ? ORDER BY Department';

    dbConnection.query(sql, [UEN, search], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

function deleteSkills(callback, DSID) {
    const sql = 'DELETE FROM DepartmentSkills WHERE DepartmentSkillsID = ?';

    // Execute the DELETE query
    dbConnection.query(sql, [DSID], function(err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

function deleteDepartment(callback, DName, UEN) {
    // Check if any accounts are associated with the department
    const checkAccountsSQL = 'SELECT COUNT(*) AS accountCount FROM Accounts WHERE Department = ? AND UEN = ?';
    
    dbConnection.query(checkAccountsSQL, [DName, UEN], function(err, results) {
        if (err) {
            callback(err);
        } else {
            const accountCount = results[0].accountCount;

            if (accountCount > 0) {
                // There are accounts associated with the department, do not delete
                const errorMessage = 'Cannot delete department with associated accounts.';
                callback(new Error(errorMessage));
            } else {
                // No accounts associated with the department, proceed with deletion
                const deleteDepartmentSQL = 'DELETE FROM DepartmentSkills WHERE Department = ?';

                dbConnection.query(deleteDepartmentSQL, [DName], function(deleteErr) {
                    if (deleteErr) {
                        callback(deleteErr);
                    } else {
                        callback(null);
                    }
                });
            }
        }
    });
}

function Skillsadd(Department, NewSkill, UEN, callback) {

    const sql = 'INSERT INTO DepartmentSkills (UEN, Department, Skill) VALUES (?, ?, ?)';

    // Execute the first UPDATE query to update the account status
    dbConnection.query(sql, [UEN, Department, NewSkill], function (err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null, results);
        }
    });
}

function submitRequest(accountID, type, start, end, reason, mc, UEN, department, callback) {
    const sql = `INSERT INTO Requests (AccountID, LeaveType, StartDate, EndDate, Reason, Status, MC, UEN, Department, Display)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;

    dbConnection.query(sql, [accountID,type,start,end,reason,0,mc,UEN,department,1], function (err,results) {
        if (err) {
            callback(err);
        } else {
            callback(null, results);
        }
    });
}

function getRequestHistory(accountID, callback) {
    const sql = `SELECT
    RequestID,
    AccountID,
    LeaveType,
    DATE_FORMAT(StartDate, '%d/%m/%Y') AS FormattedStartDate,
    DATE_FORMAT(EndDate, '%d/%m/%Y') AS FormattedEndDate,
    DATEDIFF(EndDate, StartDate) AS DurationInDays,
    Reason,
    CASE
        WHEN Status = 0 THEN 'Pending'
        WHEN Status = 1 THEN 'Approved'
        WHEN Status = 2 THEN 'Declined'
    END AS Status,
    MC,
    UEN,
    Department
    FROM Requests
    WHERE AccountID = ?;`;

    dbConnection.query(sql, [accountID], function (err, results) {
        if (err) {
            callback(err);
        } else {
            console.log(results);
            callback(null, results);
        }
    });
}

// Function to adding employee and department skills in CA-EmployeeAdd.ejs
function DMAddEmployees(UEN, Name, Number, Email, Password, Role, Skills, Department, callback) {
    const values = [UEN, Name, Email, Number, Password, Role, Skills, Department, 1];
    const DMAddEmployeesSQL = 'INSERT INTO Accounts (UEN, Name, Email, Number, Password, Role, Skill, Department, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    

    // Execute the first UPDATE query to update the account status
    dbConnection.query(DMAddEmployeesSQL, values, function (err, DMAddEmployees) {
        if (err) {
            callback(err);
        } else {
            console.log('Success input DMAddEmployee');
            callback(null, DMAddEmployees);
        }
    });
}

function getDepartmentRequests(UEN, department, callback) {
    const sql = `SELECT
    R.RequestID,
    R.LeaveType,
    R.Reason,
    DATE_FORMAT(R.StartDate, '%d/%m/%Y') AS FormattedStartDate,
    DATE_FORMAT(R.EndDate, '%d/%m/%Y') AS FormattedEndDate,
    DATEDIFF(R.EndDate, R.StartDate) AS Duration,
    A.Name AS Requestee,
    A.AccountID AS AccountID,
    A.Skill AS Skill
    FROM
    Requests AS R
    INNER JOIN
    Accounts AS A
    ON
    R.AccountID = A.AccountID
    WHERE 
	R.UEN = ? AND R.Department = ? AND R.Display = 1;`; 

    dbConnection.query(sql, [UEN,department], function (err, results) {
        if (err) {
            callback(err);
        } else {
            //console.log(results);
            callback(null, results);
        }
    });
}

// Function for Company Update in DMEmployeeUpdate
function DMEmployeeUpdate(UpdateSkills, UpdateDepartment, AccountID) {
    const DMEmployeeUpdateSQL = `
        UPDATE Accounts
        SET 
            Skill = ?,
            Department = ?
        WHERE 
            AccountID = ?;
    `;

    // Execute the UPDATE query
    dbConnection.query(
        DMEmployeeUpdateSQL, [UpdateSkills, UpdateDepartment, AccountID], function(err, accountResults) {
            if (err) {
                console.error('Error updating employee:', err);
            }
        }
    );
}

function getDepartmentEmployeeByName(name,UEN,department,callback) {
    const sql = `SELECT
    *
    FROM
    Accounts
    WHERE
    Name like ?
    AND
    UEN = ?
    AND
    Role = 'Employee'
    AND
    Department = ?;`;

    dbConnection.query(sql, [name,UEN,department], function(err,results){
        if (err) {
            callback(err);
        } else {
            console.log(results);
            callback(null, results);
        }
    });
}

function getDepartmentRequestsByType(UEN, department, type, callback) {
    const sql = `SELECT
    R.RequestID,
    R.LeaveType,
    R.Reason,
    DATE_FORMAT(R.StartDate, '%d/%m/%Y') AS FormattedStartDate,
    DATE_FORMAT(R.EndDate, '%d/%m/%Y') AS FormattedEndDate,
    DATEDIFF(R.EndDate, R.StartDate) AS Duration,
    A.Name AS Requestee
    FROM
    Requests AS R
    INNER JOIN
    Accounts AS A
    ON
    R.AccountID = A.AccountID
    WHERE 
	R.UEN = ? AND R.Department = ? AND R.Display = 1 AND R.LeaveType = ?;`; 

    dbConnection.query(sql, [UEN,department,type], function (err, results) {
        if (err) {
            callback(err);
        } else {
            // console.log(results);
            callback(null, results);
        }
    });
}

// Function to approveRequest
function approveRequest(RequestID, callback) {
    const approveRequestSQL = 'UPDATE Requests SET Status = 1, Display = 0 WHERE RequestID = ?;';

    // Execute the first UPDATE query to update the account status
    dbConnection.query(approveRequestSQL, [RequestID], function (err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

// Function to declineRequest
function declineRequest(RequestID, callback) {
    const declineRequestsql = 'UPDATE Requests SET Status = 2, Display = 0 WHERE RequestID = ?;';

    // Execute the first DELETE query to delete records from the accounts table
    dbConnection.query(declineRequestsql, [RequestID], function (err, declineAccountResults) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

function getMC(requestID, callback) {
    const sql = `SELECT MC FROM Requests WHERE RequestID = ?;`;

    dbConnection.query(sql, [requestID], function (err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null, results);
        }
    });
}

async function checkProjectName(UEN, projectName) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT ProjectName FROM Projects WHERE ProjectName = ? AND UEN = ?;`;

        dbConnection.query(sql, [projectName, UEN], (err, results) => {
            if (err) {
                reject(err);
                console.log(err);
            } else {
                resolve(results);
            }
        });
    });
}

function updateProject(UEN, projectName, projectDescription, projectStartDate, projectEndDate, callback) {

    const sql = `INSERT INTO Projects (UEN, StartDate, EndDate, ProjectName, ProjectDescription)
    VALUES (?,?,?,?,?);`;

    dbConnection.query(sql,[UEN,projectStartDate,projectEndDate,projectName,projectDescription], function(err,results) {
        if (err) {
            callback(err);
        } else {
            callback(null, results);
            // console.log(results);
        }
    });
}

function getProjectID(projectName, UEN) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT ProjectID FROM Projects WHERE ProjectName = ? AND UEN = ?;`;

        dbConnection.query(sql, [projectName, UEN], (err, results) => {
            if (err) {
                reject(err); // Reject the promise if there's an error
            } else {
                if (results.length > 0) {
                    resolve(results[0].ProjectID); // Resolve with the ProjectID if found
                } else {
                    resolve(null); // Resolve with null if no results were found
                }
            }
        });
    });
}

function checkAvailability(UEN,department,skill,startdate,enddate,pax,callback) {

    const sql = `SELECT A.AccountID AS Result
    FROM Accounts A
    WHERE A.UEN = ? 
    AND A.Department = ? 
    AND A.Skill = ?
    AND NOT EXISTS (
        SELECT 1
        FROM Availability Av
        WHERE A.AccountID = Av.AccountID
        AND (
            ((Av.StartDate <= ? AND Av.EndDate >= ?)
            OR (Av.StartDate >= ? AND Av.EndDate <= ?)
            OR (Av.StartDate <= ? AND Av.EndDate >= ?)
            OR (Av.StartDate <= ? AND Av.EndDate >= ?))
            ))
        LIMIT ?;`;

    dbConnection.query(sql, [UEN,department,skill,startdate,enddate,startdate,enddate,startdate,startdate,enddate,enddate,pax], function(err,results) {
        if (err) {
            callback(err);
        } else {
            callback(null, results);
        }
    })
}

function insertProjectDetails(projectID,skill,startdate,enddate,department,accountID,callback) {
    
    const sql = `INSERT INTO ProjectDetails (ProjectID, Skill, StartDate, EndDate, Department, AccountID) VALUES (?,?,?,?,?,?);`;

    dbConnection.query(sql, [projectID,skill,startdate,enddate,department,accountID], function(err,results) {
        if (err) {
            callback(err);
        } else {
            callback(null, results);
        }
    })

}

function insertAvailability(accountID,projecttID,startdate,enddate,callback) {

    const sql = `INSERT INTO Availability (AccountID, ProjectID, StartDate, EndDate) VALUES (?,?,?,?);`;

    dbConnection.query(sql, [accountID,projecttID,startdate,enddate], function(err,results) {
        if (err) {
            callback(err);
        } else {
            callback(null, results);
        }
    })
}

function deleteProject(projectID,callback) {

    const sql = `DELETE FROM Projects WHERE ProjectID = ?;`;

    dbConnection.query(sql, [projectID], function(err,results) {
        if (err) {
            callback(err);
        } else {
            callback(null, results);
        }
    })
}

// Function to get Update Projects on CA-ProjectUpdate   
function getCAProjectUpdate(AccountID, callback) {
    const sql = `
    SELECT
        ProjectID,
        ProjectName,
        ProjectDescription,
        DATE_FORMAT(StartDate, '%Y-%m-%d') AS StartDate,
        DATE_FORMAT(EndDate, '%Y-%m-%d') AS EndDate,
        UEN
    FROM
        Projects
    WHERE
        ProjectID = ?;`;

    dbConnection.query(sql, [AccountID], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

// Function to get CurEmp on CA-ProjectUpdate  
function getCAProjectCurEmp(CAprojectUEN, ProjectID, callback) {
    // console.log(CAprojectUEN);
    // console.log(CAprojectProjectID);
    const sql = `
    SELECT 
        AC.Department AS Department,
        AC.Skill As Skill,
        AC.Name AS EmployeeName,
        DATE_FORMAT(A.StartDate, '%Y-%m-%d') AS EmployeeStartDate,
        DATE_FORMAT(A.EndDate, '%Y-%m-%d') AS EmployeeEndDate,
        AC.AccountID AS AccountID,
        A.ProjectID AS ProjectID
    FROM 
        Accounts AS AC
    JOIN 
        Availability AS A ON AC.AccountID = A.AccountID
    WHERE 
        AC.UEN = ? AND A.ProjectID = ?;`;

    dbConnection.query(sql, [CAprojectUEN, ProjectID], function (err, results1) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results1);
        }
    });
}

function getCAProjectUpEmp(CAprojectUEN, ProjectID, AccountID, callback) {
    // console.log(CAprojectUEN);
    // console.log(CAprojectProjectID);
    const sql = `
    SELECT 
        AC.Department AS Department,
        AC.Skill As Skill,
        AC.Name AS EmployeeName,
        DATE_FORMAT(A.StartDate, '%Y-%m-%d') AS EmployeeStartDate,
        DATE_FORMAT(A.EndDate, '%Y-%m-%d') AS EmployeeEndDate,
        AC.AccountID AS AccountID,
        A.ProjectID AS ProjectID
    FROM 
        Accounts AS AC
    JOIN 
        Availability AS A ON AC.AccountID = A.AccountID
    WHERE 
        AC.UEN = ? AND A.ProjectID = ? AND AC.AccountID = ?;`;

    dbConnection.query(sql, [CAprojectUEN, ProjectID, AccountID], function (err, results1) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results1);
        }
    });
}

// Function to get Update Projects on DM-ProjectUpdate   
function getDMProjectUpdate(ProjectID, callback) {
    const sql = `
    SELECT
        ProjectID,
        ProjectName,
        ProjectDescription,
        DATE_FORMAT(StartDate, '%Y-%m-%d') AS StartDate,
        DATE_FORMAT(EndDate, '%Y-%m-%d') AS EndDate,
        UEN
    FROM
        Projects
    WHERE
        ProjectID = ?;`;

    dbConnection.query(sql, [ProjectID], function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
}

// Function to get CurEmp on DM-ProjectUpdate  
function getDMProjectCurEmp(DMprojectUEN, ProjectID, DMprojectDepartment, callback) {
    // console.log(CAprojectUEN);
    // console.log(CAprojectProjectID);
    const sql = `
    SELECT 
        AC.Department AS Department,
        AC.Skill As Skill,
        AC.Name AS EmployeeName,
        DATE_FORMAT(A.StartDate, '%Y-%m-%d') AS EmployeeStartDate,
        DATE_FORMAT(A.EndDate, '%Y-%m-%d') AS EmployeeEndDate,
        AC.AccountID AS AccountID,
        A.ProjectID AS ProjectID
    FROM 
        Accounts AS AC
    JOIN 
        Availability AS A ON AC.AccountID = A.AccountID
    WHERE 
        AC.UEN = ? AND A.ProjectID = ? AND AC.Department = ?;`;

    dbConnection.query(sql, [DMprojectUEN, ProjectID, DMprojectDepartment], function (err, results1) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results1);
        }
    });
}

// Function to get all DepartmentSkills on CA-ProjectUpdate  
function getdepartmentFromDS(CAprojectUEN, callback) {
    // console.log(CAprojectUEN);
    // console.log(CAprojectProjectID);
    const sql = `
    SELECT 
        DISTINCT Department
    FROM 
        DepartmentSkills
    WHERE 
        UEN = ?;`;

    dbConnection.query(sql, [CAprojectUEN], function (err, results2) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results2);
        }
    });
}

// Function to get all DepartmentSkills on CA-ProjectUpdate  
function getskillFromDS(CAprojectUEN, callback) {
    // console.log(CAprojectUEN);
    // console.log(CAprojectProjectID);
    const sql = `
    SELECT 
        DISTINCT Skill
    FROM 
        DepartmentSkills
    WHERE 
        UEN = ?;`;

    dbConnection.query(sql, [CAprojectUEN], function (err, results3) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results3);
        }
    });
}

function getskillFromDSForDM(DMprojectUEN, DMprojectDepartment, callback) {
    // console.log(CAprojectUEN);
    // console.log(CAprojectProjectID);
    const sql = `
    SELECT 
        DISTINCT Skill
    FROM 
        DepartmentSkills
    WHERE 
        UEN = ?;`;

    dbConnection.query(sql, [DMprojectUEN, DMprojectDepartment], function (err, results3) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results3);
        }
    });
}

function CAUpdateProjectDesc(UpdateProjectID, UpdateProjectDescription, UpdateStartDate, UpdateEndDate, callback) {
    const CAUpdateProjectDescSQL = `
        UPDATE 
            Projects 
        SET 
            ProjectDescription = CASE WHEN ? <> '' THEN ? ELSE ProjectDescription END,
            StartDate = CASE WHEN ? <> '' THEN ? ELSE StartDate END,
            EndDate = CASE WHEN ? <> '' THEN ? ELSE EndDate END
        
        WHERE ProjectID = ?`;

    // Execute the first UPDATE query to update the account status
    dbConnection.query(CAUpdateProjectDescSQL, [UpdateProjectDescription, UpdateProjectDescription, UpdateStartDate, UpdateStartDate, UpdateEndDate, UpdateEndDate, UpdateProjectID], function (err, accountResults) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

function DMUpdateProjectDesc(UpdateProjectID, UpdateProjectDescription, UpdateStartDate, UpdateEndDate, callback) {
    const DMUpdateProjectDescSQL = `
        UPDATE 
            Projects 
        SET 
            ProjectDescription = CASE WHEN ? <> '' THEN ? ELSE ProjectDescription END,
            StartDate = CASE WHEN ? <> '' THEN ? ELSE StartDate END,
            EndDate = CASE WHEN ? <> '' THEN ? ELSE EndDate END
        
        WHERE ProjectID = ?`;

    // Execute the first UPDATE query to update the account status
    dbConnection.query(DMUpdateProjectDescSQL, [UpdateProjectDescription, UpdateProjectDescription, UpdateStartDate, UpdateStartDate, UpdateEndDate, UpdateEndDate, UpdateProjectID], function (err, accountResults) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

function getSchedule(accountID, callback) {

    const sql = `SELECT A.AccountID, A.ProjectID, DATE_FORMAT(A.StartDate, '%Y/%m/%d') AS FormattedStartDate, DATE_FORMAT(A.EndDate, '%Y/%m/%d') AS FormattedEndDate, P.ProjectName
    FROM Availability AS A
    JOIN Projects AS P ON A.ProjectID = P.ProjectID
    WHERE A.AccountID = ?;`;
  
    dbConnection.query(sql, [accountID], function (err, results) {
      if (err) {
        console.log('Error', err);
        callback(err, null);
      } else {
        //console.log('Successful', results);
        callback(null, results);
      }
    });
}

function getAllProjectSchedules(UEN, callback) {

    const sql = `SELECT
    Projects.ProjectID,
    Projects.ProjectName,
    DATE_FORMAT(Projects.StartDate, '%Y/%m/%d') AS ProjectStartDate,
    DATE_FORMAT(Projects.EndDate, '%Y/%m/%d') AS ProjectEndDate,
    ProjectDetails.ProjectSkillsAndManPowerID,
    ProjectDetails.Skill,
    DATE_FORMAT(ProjectDetails.StartDate, '%Y/%m/%d') AS SkillStartDate,
    DATE_FORMAT(ProjectDetails.EndDate, '%Y/%m/%d') AS SkillEndDate,
    ProjectDetails.Department,
    Accounts.Name AS AccountName
    FROM
    Projects
    JOIN
    ProjectDetails ON Projects.ProjectID = ProjectDetails.ProjectID
    JOIN
    Accounts ON ProjectDetails.AccountID = Accounts.AccountID
    WHERE
    Projects.UEN = ?;`;

    dbConnection.query(sql, [UEN], function (err, results) {
        if (err) {
          console.log('Error', err);
          callback(err, null);
        } else {
          //console.log('Successful', results);
          callback(null, results);
        }
      });
}

function getProjectDetails(projectID, callback) {

    const sql = `SELECT PD.ProjectSkillsAndManPowerID, PD.ProjectID, PD.Skill,
    DATE_FORMAT(PD.StartDate, '%Y-%m-%d') AS FormattedStartDate,
    DATE_FORMAT(PD.EndDate, '%Y-%m-%d') AS FormattedEndDate,
    PD.Department, PD.AccountID, A.Name AS AccountName
    FROM ProjectDetails PD
    LEFT JOIN Accounts A ON PD.AccountID = A.AccountID
    WHERE PD.ProjectID = ?;`;

    dbConnection.query(sql, [projectID], function (err, results) {
        if (err) {
          console.log('Error', err);
          callback(err, null);
        } else {
          console.log('Successful', results);
          callback(null, results);
        }
    });
}

// Function to delete an account by AccountID on SA-UpdateAccount
function RemoveProjectMembers(callback, AccountID, ProjectID) {
    const sqlAvailability = 'DELETE FROM Availability WHERE AccountID = ? AND ProjectID = ?';
    const sqlProjectDetails = 'DELETE FROM ProjectDetails WHERE AccountID = ? AND ProjectID = ?';
    // console.log(AccountID);

    // Execute the DELETE query
    dbConnection.query(sqlAvailability, [AccountID, ProjectID], function(err, results) {
        if (err) {
            callback(err);
        } else {
            dbConnection.query(sqlProjectDetails, [AccountID, ProjectID], function(err, results) {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                    // Check if there are any remaining members for the same ProjectID
                    dbConnection.query('SELECT COUNT(*) AS count FROM ProjectDetails WHERE ProjectID = ?', [ProjectID], function (err, results) {
                        if (err) {
                            console.error('Error checking member count:', err);
                        } else {
                            const memberCount = results[0].count;
                            if (memberCount === 0) {
                                // If there are no remaining members, delete the project from the Projects table
                                dbConnection.query('DELETE FROM Projects WHERE ProjectID = ?', [ProjectID], function (err, result) {
                                    if (err) {
                                        console.error('Error deleting project:', err);
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    });
}

function getEmailandName(UEN, callback) {

    const sql = `SELECT Email, Name
    FROM Accounts
    WHERE UEN = ? AND Role = 'CompanyAdmin';`;

    dbConnection.query(sql, [UEN], function(err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null,results);
        }
    });
}

function getAcra(ACRAUEN, callback) {
    const sql = `SELECT ACRA FROM Company WHERE UEN = ?;`;

    dbConnection.query(sql, [ACRAUEN], function (err, results) {
        if (err) {
            callback(err);
        } else {
            callback(null, results);
        }
    });
}

function checkProjectEndDate(projectID,endDate) {
    return new Promise((resolve,reject) => {
        const sql = `SELECT *
        FROM Projects
        WHERE ProjectID = ?
          AND ? > EndDate;`;
    
        dbConnection.query(sql, [projectID,endDate], function (err, results) {
            if (err) {
                reject(err);
            } else {
                resolve(results.length > 0 ? results : null);
            }
        });
    });
}

function checkOtherAssignedDates(AccountID,endDate,projectID,CurProjectStartDate) {

    return new Promise((resolve,reject) => {
        const sql = `SELECT A.*, P.ProjectName AS ProjectName, P.ProjectDescription, P.StartDate AS ProjectStartDate, P.EndDate AS ProjectEndDate
        FROM Availability A
        JOIN Projects P ON A.ProjectID = P.ProjectID
        WHERE A.AccountID = ?
          AND A.StartDate < ?
          AND A.ProjectID != ?
          AND A.StartDate > ?;`;
    
        dbConnection.query(sql, [AccountID,endDate,projectID,CurProjectStartDate], function (err, results) {
            if (err) {
                reject(err);
            } else {
                resolve(results.length > 0 ? results : null);
            }
        });
    });

}

function updateAvailabilityAndProjectDetailsTables(date, projectID, accountID) {
    const sql = `
        UPDATE Availability AS a, ProjectDetails AS pd
        SET a.EndDate = ?, pd.EndDate = ?
        WHERE a.ProjectID = ? AND a.AccountID = ?
        AND pd.ProjectID = ? AND pd.AccountID = ?;`;

    dbConnection.query(sql, [date, date, projectID, accountID, projectID, accountID], function (err, results) {
        if (err) {
            console.log('error with update:', err);
        } else {
            console.log('successful update');
        }
    });
}

function handleClash1(accountID,projectID,newEndDate) {
    const sql1 = `UPDATE Availability AS Av
    JOIN ProjectDetails AS PD ON Av.ProjectID = PD.ProjectID AND Av.AccountID = PD.AccountID
    SET Av.EndDate = ?,
        PD.EndDate = ?
    WHERE Av.AccountID = ? AND Av.ProjectID = ?;`;
    const sql2 = `UPDATE Projects
    SET EndDate = ?
    WHERE ProjectID = ?;`;

    dbConnection.query(sql1, [newEndDate,newEndDate,accountID,projectID], function (err, results) {
        if (err) {
            console.log('error with update:', err);
        } else {
            console.log('successful update');
        }
    });

    dbConnection.query(sql2, [newEndDate,projectID], function (err, results) {
        if (err) {
            console.log('error with update:', err);
        } else {
            console.log('successful update');
        }
    });
}

function fml(AccountID,endDate,projectID,startDate) {

    return new Promise((resolve,reject) => {
        const sql = `SELECT A.*, P.ProjectName AS ProjectName, P.ProjectDescription, P.StartDate AS ProjectStartDate, P.EndDate AS ProjectEndDate
        FROM Availability A
        JOIN Projects P ON A.ProjectID = P.ProjectID
        WHERE A.AccountID = ?
          AND A.StartDate < ?
          AND A.ProjectID != ?
          AND A.EndDate > ?;`;

        dbConnection.query(sql, [AccountID,endDate,projectID,startDate], function (err, results) {
            if (err) {
                reject(err);
            } else {
                resolve(results.length > 0 ? results : null);
            }
        });
    });

}

function handleClash2(projectID,projectEndDate) {

    const sql = `UPDATE Projects
    SET EndDate = ?
    WHERE ProjectID = ?;`;

    dbConnection.query(sql, [projectEndDate,projectID], function (err, results) {
        if (err) {
            console.log(err);
        } else {
            console.log('successful update', results);
        }
    });
}

function handleClash2part2(projectID,accountID,startDate,endDate) {

    const sql1 = `UPDATE Availability
    SET StartDate = ?,
        EndDate = ?
    WHERE ProjectID = ? 
      AND AccountID = ?;`;

    const sql2 = `UPDATE ProjectDetails
    SET StartDate = ?,
        EndDate = ?
    WHERE ProjectID = ? 
      AND AccountID = ?;`;

    dbConnection.query(sql1, [startDate,endDate,projectID,accountID], function (err, results) {
        if (err) {
            console.log(err);
        } else {
            console.log('successful update', results);
        }
    });

    dbConnection.query(sql2, [startDate,endDate,projectID,accountID], function (err, results) {
        if (err) {
            console.log(err);
        } else {
            console.log('successful update', results);
        }
    });
}

function handleClash2part3(accountID,projectID,date) {

    // const sql = `UPDATE Availability AS Av
    // JOIN ProjectDetails AS PD ON Av.ProjectID = PD.ProjectID AND Av.AccountID = PD.AccountID
    // SET Av.EndDate = ?,
    //     PD.EndDate = ?
    // WHERE Av.AccountID = ? AND Av.ProjectID = ?;`;

    // dbConnection.query(sql, [date,date,accountID,projectID], function (err, results) {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         console.log('successful update', results);
    //     }
    // });

    const sql1 = `UPDATE Availability
        SET EndDate = ?
        WHERE ProjectID = ? 
        AND AccountID = ?;`;

        const sql2 = `UPDATE ProjectDetails
        SET EndDate = ?
        WHERE ProjectID = ? 
        AND AccountID = ?;`;

        dbConnection.query(sql1, [date,projectID,accountID], function (err, results1) {
            if (err) {
                console.log(err);
            } else {
                console.log('successful update', results1);
                dbConnection.query(sql2, [date,projectID,accountID], function (err, results2) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('successful update', results2);
                    }
                });
            }
        });
}


function handleClash3part1_1(accountID,projectID,date) {

    return new Promise((resolve,reject) => {
        // const sql1 = `UPDATE Availability AS A
        // JOIN ProjectDetails AS PD ON A.ProjectID = PD.ProjectID AND A.AccountID = PD.AccountID
        // SET A.EndDate = ?,
        //     PD.EndDate = ?
        // WHERE A.ProjectID = ? 
        // AND A.AccountID = ?;`;

        const sql1 = `UPDATE Availability
        SET EndDate = ?
        WHERE ProjectID = ? 
        AND AccountID = ?;`;

        const sql2 = `UPDATE ProjectDetails
        SET EndDate = ?
        WHERE ProjectID = ? 
        AND AccountID = ?;`;

        dbConnection.query(sql1, [date,projectID,accountID], function (err, results) {
            if (err) {
                reject(err);
            } else {
                dbConnection.query(sql2, [date,projectID,accountID], function (err, results) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(results.length > 0 ? results : null);
                    }
                });
            }
        });
    });
    
}

function handleClash3part1_2(projectID,date) {

    return new Promise((resolve,reject) => {
        const sql2 = `UPDATE Projects
        SET EndDate = ?
        WHERE ProjectID = ?;`;

        dbConnection.query(sql2, [date,projectID], function (err, results) {
            if (err) {
                reject(err);
            } else {
                resolve(results.length > 0 ? results : null);
            }
        });
    });
    
}

function handleClash3part2(projectID,date) {

    sql = `UPDATE Projects
    SET EndDate = ?
    WHERE ProjectID = ?;`;

    dbConnection.query(sql, [date,projectID], function (err, results) {
        if (err) {
            console.log(err);
        } else {
            console.log('successful update', results);
        }
    });

}

function handleClash3part3(projectID,accountID,startDate,endDate) {

    const sql1 = `UPDATE Availability
    SET StartDate = ?,
        EndDate = ?
    WHERE ProjectID = ? 
      AND AccountID = ?;`;

    const sql2 = `UPDATE ProjectDetails
    SET StartDate = ?,
        EndDate = ?
    WHERE ProjectID = ? 
      AND AccountID = ?;`;

    dbConnection.query(sql1, [startDate,endDate,projectID,accountID], function (err, results) {
        if (err) {
            console.log(err);
        } else {
            console.log('successful update', results);
        }
    });

    dbConnection.query(sql2, [startDate,endDate,projectID,accountID], function (err, results) {
        if (err) {
            console.log(err);
        } else {
            console.log('successful update', results);
        }
    });
}




// Export function here, add function name into {}
module.exports = {
    getAccountInformation,registerCompany,registerCAaccount,
    getCompanyAdminAccounts,getAccountInformation,registerCompany,registerCAaccount,submitEnquiry,submitReview,
    getCompanyAdminAccounts, getCompanyAdminUpdateAccounts, deleteAccount, updateAccountStatus, getSAEnquiries, 
    deleteEnquiry, getSAPendingAccounts, approveAccount, declineAccount, getReviews, getProjectView,
    getEmployeeView, EmployeeAdd, deleteEmployee, getCAUpdateAccounts, getDepartmentOptions, EmployeeUpdate, 
    getCAcompanyView, companyupdate, getDMEmployee, getSkillsOptions, getURdescription, getURfeatures, getURreview,
    getContactInfo,getEnquiryByCategory,getReviewByCategory,updateDescription,addFeatures,deleteFeature,
    getCAinfoFromUEN, deleteReview, updatecontactinfo,submitRequest,getRequestHistory,getDepartmentRequests,getDepartmentEmployeeByName,
    updateAvailabilityAndProjectDetailsTables,handleClash1,fml,handleClash2,handleClash2part2
    //darrel
    ,updateProfile,getProfile,getDepartmentRequestsByType,getMC,getSchedule,updateProject,checkProjectName,checkAvailability,getProjectID,
    insertProjectDetails,insertAvailability,deleteProject,getAllProjectSchedules,getProjectDetails,checkUEN,getEmailandName,checkProjectEndDate
    ,checkOtherAssignedDates,handleClash2part3,handleClash3part1_1,handleClash3part1_2,handleClash3part2,handleClash3part3

    //weichoon
    ,postReview, getEmployeeByDepartment, getdepartmentview, getdepartmentSkills, deleteSkills, deleteDepartment
    ,Skillsadd, DMAddEmployees, DMEmployeeUpdate, approveRequest, declineRequest, getCADepartmentOptions
    , DMgetProjectView, getSearchProjectView, DMgetSearchProjectView, getCAProjectUpdate
    ,getCAProjectCurEmp, CAUpdateProjectDesc, getdepartmentFromDS, getskillFromDS, getUpdateEmployeeOptions
    ,CAAddProjectMembers, getDMProjectUpdate, DMUpdateProjectDesc, getDMProjectCurEmp, getskillFromDSForDM
    ,RemoveProjectMembers, RegisterDepartment, getdepartmentSkillsSearch, getAcra, getViewAllEmployee, getViewAllEmployeeSearch
    ,getCAProjectUpEmp, getDMSkillsOptions, RequestEmpAvail, CheckRequesteeOnProj
};