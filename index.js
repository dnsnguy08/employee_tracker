// used for command line inputs
const inquirer = require('inquirer');
// const connection = require('./config/connection');
const mysql = require('mysql2');

// display data table in command line 
const { printTable } = require('console-table-printer');

// jumbotron alert in command-line
const figlet = require('figlet');

let roles;
let departments;
let managers;
let employees;

// database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'employees_db',
})

figlet('Employee Manager', (err, result) => {
    console.log(err || result);
});

// Connect to database and assign data to the roles, departments, managers, employees variables
connection.connect(function (err) {
    if (err) throw err;
    start();
    getDepartments();
    getRoles();
    getManagers();
    getEmployees();
});

// Function for starting the app question options
start = () => {
    inquirer
        .prompt({
            name: "choices",
            type: "list",
            message: "What would you like to do?",
            choices: [
                "ADD", "VIEW", "UPDATE", "DELETE", "EXIT"
            ]
        })
        .then(function (answer) {
            if (answer.choices === "ADD") {
                addOptions();
            }
            else if (answer.choices === "VIEW") {
                viewOptions();
            }
            else if (answer.choices === "UPDATE") {
                updateOptions();
            }
            else if (answer.choices === "DELETE") {
                deleteOptions();
            }
            else if (answer.choices === "EXIT") {
                figlet('Thanks, Bye!', (err, result) => {
                    console.log(err || result);
                });

                connection.end();
                process.exit();
            }
            else {
                connection.end();
                process.exit();
            }
        });
}

// query and get roles
getRoles = () => {
    connection.query("SELECT id, title FROM employees_db.role;", (err, res) => {
        if (err) throw err;
        roles = res;
    })
};

// query and get departments
getDepartments = () => {
    connection.query("SELECT id, name FROM department;", (err, res) => {
        if (err) throw err;
        departments = res;
    })
};

// query and get managers
getManagers = () => {
    connection.query("SELECT id, first_name, last_name, CONCAT_WS(' ', first_name, last_name) AS managers FROM employee;", (err, res) => {
        if (err) throw err;
        managers = res;
    })
};

// query and get employees
getEmployees = () => {
    connection.query("SELECT id, CONCAT_WS(' ', first_name, last_name) AS Employee_Name FROM employee;", (err, res) => {
        if (err) throw err;
        employees = res;
    })
};

// Options for adding to tables in database
addOptions = () => {
    inquirer.prompt([
        {
            name: "add",
            type: "list",
            message: "What would you like to add?",
            choices: ["DEPARTMENT", "ROLE", "EMPLOYEE", "EXIT"]
        }
    ]).then(function (answer) {
        if (answer.add === "DEPARTMENT") {
            console.log(`Add a new: ${answer.add}`);
            addDepartment();
        }
        else if (answer.add === "ROLE") {
            console.log(`Add a new: ${answer.add}`);
            addRole();
        }
        else if (answer.add === "EMPLOYEE") {
            console.log(`Add a new: ${answer.add}`);
            addEmployee();
        }
        else if (answer.add === "EXIT") {
            figlet('Thanks, Bye!!', (err, result) => {
                console.log(err || result);
            });

            connection.end();
            process.exit();
        } else {
            connection.end();
            process.exit();
        }
    })
};

addDepartment = () => {
    inquirer.prompt([
        {
            name: "department",
            type: "input",
            message: "What department would you like to add?"
        }
    ]).then(function (answer) {
        connection.query(`INSERT INTO department (name) VALUES ('${answer.department}');`, (err, res) => {
            if (err) throw err;
            console.log(`New department added: ${answer.department}`);
            getDepartments();
            start();
        })
    })
};

addRole = () => {
    let departmentOptions = [];
    for (i = 0; i < departments.length; i++) {
        departmentOptions.push(Object(departments[i]));
    };

    inquirer.prompt([
        {
            name: "title",
            type: "input",
            message: "What role would you like to add?"
        },
        {
            name: "salary",
            type: "input",
            message: "What is the salary for this position?"
        },
        {
            name: "department_id",
            type: "list",
            message: "What is the department for this position?",
            choices: departmentOptions
        },
    ]).then(function (answer) {
        for (i = 0; i < departmentOptions.length; i++) {
            if (departmentOptions[i].name === answer.department_id) {
                department_id = departmentOptions[i].id
            }
        }
        connection.query(`INSERT INTO role (title, salary, department_id) VALUES ('${answer.title}', '${answer.salary}', ${department_id});`, (err, res) => {
            if (err) throw err;

            console.log(`New role added: ${answer.title}`);
            getRoles();
            start();
        })
    })
};

addEmployee = () => {
    getRoles();
    getManagers();
    let roleOptions = [];
    for (i = 0; i < roles.length; i++) {
        roleOptions.push(Object(roles[i]));
    };
    let managerOptions = [];
    for (i = 0; i < managers.length; i++) {
        managerOptions.push(Object(managers[i]));
    }
    inquirer.prompt([
        {
            name: "first_name",
            type: "input",
            message: "What is the employee's first name?"
        },
        {
            name: "last_name",
            type: "input",
            message: "What is the employee's last name?"
        },
        {
            name: "role_id",
            type: "list",
            message: "What is the role for this employee?",
            choices: function () {
                var choiceArray = [];
                for (var i = 0; i < roleOptions.length; i++) {
                    choiceArray.push(roleOptions[i].title)
                }
                return choiceArray;
            }
        },
        {
            name: "manager_id",
            type: "list",
            message: "Who is the employee's manager?",
            choices: function () {
                var choiceArray = [];
                for (var i = 0; i < managerOptions.length; i++) {
                    choiceArray.push(managerOptions[i].managers)
                }
                return choiceArray;
            }
        }
    ]).then(function (answer) {
        for (i = 0; i < roleOptions.length; i++) {
            if (roleOptions[i].title === answer.role_id) {
                role_id = roleOptions[i].id
            }
        }

        for (i = 0; i < managerOptions.length; i++) {
            if (managerOptions[i].managers === answer.manager_id) {
                manager_id = managerOptions[i].id
            }
        }

        connection.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${answer.first_name}', '${answer.last_name}', ${role_id}, ${manager_id});`, (err, res) => {
            if (err) throw err;

            console.log(`Added new employee: ${answer.first_name} ${answer.last_name}`);
            getEmployees();
            start()
        })
    })
};

// Options for viewing tables from database
viewOptions= () => {
    inquirer.prompt([
        {
            name: "viewChoice",
            type: "list",
            message: "What would you like to view?",
            choices: ["DEPARTMENTS", "ROLES", "EMPLOYEES", "EXIT"]
        }
    ]).then(answer => {
        if (answer.viewChoice === "DEPARTMENTS") {
            viewDepartments();
        }
        else if (answer.viewChoice === "ROLES") {
            viewRoles();
        }
        else if (answer.viewChoice === "EMPLOYEES") {
            viewEmployees();
        }
        else if (answer.viewChoice === "EXIT") {
            figlet('Thanks, Bye!!', (err, result) => {
                console.log(err || result);
            });

            connection.end();
            process.exit();
        } else {
            connection.end();
            process.exit();
        }
    })
};

viewDepartments = () => {
    connection.query("SELECT * FROM department;", (err, res) => {
        if (err) throw err;
        figlet('Departments', (err, result) => {
            console.log(err || result);
        });

        printTable(res);
        start();
    });
};

viewRoles = () => {
    connection.query("SELECT  role.id, role.title, role.salary, department.name as department_name FROM role INNER JOIN department ON role.department_id = department.id;", (err, res) => {
        if (err) throw err;
        figlet('Roles', (err, result) => {
            console.log(err || result);
        });

        printTable(res);
        start();
    });
};

viewEmployees = () => {
    connection.query('SELECT e.id, e.first_name, e.last_name, d.name AS department, r.title, r.salary, CONCAT_WS(" ", m.first_name, m.last_name) AS manager FROM employee e LEFT JOIN employee m ON m.id = e.manager_id INNER JOIN role r ON e.role_id = r.id INNER JOIN department d ON r.department_id = d.id ORDER BY e.id ASC;', (err, res) => {
        if (err) throw err;
        figlet('Employees', (err, result) => {
            console.log(err || result);
        });

        printTable(res);
        start();
    });
};

// Options for updating tables in database
updateOptions = () => {
    inquirer.prompt([
        {
            name: "update",
            type: "list",
            message: "Choose something to update:",
            choices: ["Update employee roles", "Update employee managers", "EXIT"]
        }
    ]).then(answer => {
        if (answer.update === "Update employee roles") {
            updateEmployeeRole();
        }
        else if (answer.update === "Update employee managers") {
            updateEmployeeManager();
        }
        else if (answer.update === "EXIT") {
            figlet('Thanks, Bye!', (err, result) => {
                console.log(err || result);
            });

            connection.end();
            process.exit();
        } else {
            connection.end();
            process.exit();
        }
    })
};

updateEmployeeRole = () => {
    let employeeOptions = [];

    for (var i = 0; i < employees.length; i++) {
        employeeOptions.push(Object(employees[i]));
    }
    inquirer.prompt([
        {
            name: "updateRole",
            type: "list",
            message: "Which employee's role do you want to update?",
            choices: function () {
                var choiceArray = [];
                for (var i = 0; i < employeeOptions.length; i++) {
                    choiceArray.push(employeeOptions[i].Employee_Name);
                }
                return choiceArray;
            }
        }
    ]).then(answer => {
        let roleOptions = [];
        for (i = 0; i < roles.length; i++) {
            roleOptions.push(Object(roles[i]));
        };
        for (i = 0; i < employeeOptions.length; i++) {
            if (employeeOptions[i].Employee_Name === answer.updateRole) {
                employeeSelected = employeeOptions[i].id
            }
        }
        inquirer.prompt([
            {
                name: "newRole",
                type: "list",
                message: "Select a new role:",
                choices: function () {
                    var choiceArray = [];
                    for (var i = 0; i < roleOptions.length; i++) {
                        choiceArray.push(roleOptions[i].title)
                    }
                    return choiceArray;
                }
            }
        ]).then(answer => {
            for (i = 0; i < roleOptions.length; i++) {
                if (answer.newRole === roleOptions[i].title) {
                    newChoice = roleOptions[i].id
                    connection.query(`UPDATE employee SET role_id = ${newChoice} WHERE id = ${employeeSelected};`), (err, res) => {
                        if (err) throw err;
                    };
                }
            }
            console.log(`${employeeSelected} updated succesfully`);
            getEmployees();
            getRoles();
            start();
        })
    })
};


updateEmployeeManager = () => {
    let employeeOptions = [];

    for (var i = 0; i < employees.length; i++) {
        employeeOptions.push(Object(employees[i]));
    }
    inquirer.prompt([
        {
            name: "updateManager",
            type: "list",
            message: "Which employee's manager do you want to update?",
            choices: function () {
                var choiceArray = [];
                for (var i = 0; i < employeeOptions.length; i++) {
                    choiceArray.push(employeeOptions[i].Employee_Name);
                }
                return choiceArray;
            }
        }
    ]).then(answer => {
        getEmployees();
        getManagers();
        let managerOptions = [];
        for (i = 0; i < managers.length; i++) {
            managerOptions.push(Object(managers[i]));
        };
        for (i = 0; i < employeeOptions.length; i++) {
            if (employeeOptions[i].Employee_Name === answer.updateManager) {
                employeeSelected = employeeOptions[i].id
            }
        }
        inquirer.prompt([
            {
                name: "newManager",
                type: "list",
                message: "Select a new manager:",
                choices: function () {
                    var choiceArray = [];
                    for (var i = 0; i < managerOptions.length; i++) {
                        choiceArray.push(managerOptions[i].managers)
                    }
                    return choiceArray;
                }
            }
        ]).then(answer => {
            for (i = 0; i < managerOptions.length; i++) {
                if (answer.newManager === managerOptions[i].managers) {
                    newChoice = managerOptions[i].id
                    connection.query(`UPDATE employee SET manager_id = ${newChoice} WHERE id = ${employeeSelected};`), (err, res) => {
                        if (err) throw err;
                    };
                    console.log("Manager Updated Succesfully");
                }
            }
            getEmployees();
            getManagers();
            start();
        })
    })
};

// Options for deleting content from tables in database
deleteOptions = () => {
    inquirer.prompt([
        {
            name: "delete",
            type: "list",
            message: "Select something to delete:",
            choices: ["Delete department", "Delete role", "Delete employee", "EXIT"]
        }
    ]).then(answer => {
        if (answer.delete === "Delete department") {
            deleteDepartment();
        }
        else if (answer.delete === "Delete role") {
            deleteRole();
        }
        else if (answer.delete === "Delete employee") {
            deleteEmployee();
        } else if (answer.delete === "EXIT") {
            figlet('Thanks, Bye!', (err, result) => {
                console.log(err || result);
            });

            connection.end();
            process.exit();
        }
        else {
            connection.end();
            process.exit();
        }
    })
};

deleteDepartment = () => {
    let departmentOptions = [];
    for (var i = 0; i < departments.length; i++) {
        departmentOptions.push(Object(departments[i]));
    }

    inquirer.prompt([
        {
            name: "deleteDepartment",
            type: "list",
            message: "Select a department to delete",
            choices: function () {
                var choiceArray = [];
                for (var i = 0; i < departmentOptions.length; i++) {
                    choiceArray.push(departmentOptions[i])
                }
                return choiceArray;
            }
        }
    ]).then(answer => {
        for (i = 0; i < departmentOptions.length; i++) {
            if (answer.deleteDepartment === departmentOptions[i].name) {
                newChoice = departmentOptions[i].id
                connection.query(`DELETE FROM department Where id = ${newChoice};`), (err, res) => {
                    if (err) throw err;
                };
                console.log(`${answer.deleteDepartment} was deleted.`);
            }
        }
        getDepartments();
        start();
    })
};

deleteRole = () => {
    let roleOptions = [];
    for (var i = 0; i < roles.length; i++) {
        roleOptions.push(Object(roles[i]));
    }

    inquirer.prompt([
        {
            name: "deleteRole",
            type: "list",
            message: "Select a role to delete",
            choices: function () {
                var choiceArray = [];
                for (var i = 0; i < roleOptions.length; i++) {
                    choiceArray.push(roleOptions[i].title)
                }
                return choiceArray;
            }
        }
    ]).then(answer => {
        for (i = 0; i < roleOptions.length; i++) {
            if (answer.deleteRole === roleOptions[i].title) {
                newChoice = roleOptions[i].id
                connection.query(`DELETE FROM role Where id = ${newChoice};`), (err, res) => {
                    if (err) throw err;
                };
                console.log(`${answer.deleteRole} was deleted.`);
            }
        }
        getRoles();
        start();
    })
};

deleteEmployee = () => {
    let employeeOptions = [];
    for (var i = 0; i < employees.length; i++) {
        employeeOptions.push(Object(employees[i]));
    }

    inquirer.prompt([
        {
            name: "deleteEmployee",
            type: "list",
            message: "Select a employee to delete",
            choices: function () {
                var choiceArray = [];
                for (var i = 0; i < employeeOptions.length; i++) {
                    choiceArray.push(employeeOptions[i].Employee_Name)
                }
                return choiceArray;
            }
        }
    ]).then(answer => {
        for (i = 0; i < employeeOptions.length; i++) {
            if (answer.deleteEmployee === employeeOptions[i].Employee_Name) {
                newChoice = employeeOptions[i].id
                connection.query(`DELETE FROM employee Where id = ${newChoice};`), (err, res) => {
                    if (err) throw err;
                };
                console.log(`Employee: ${answer.deleteEmployee} was deleted.`);
            }
        }
        getEmployees();
        start();
    })
};
