const mysql2 = require("mysql2");
const express = require("express");
const inquirer = require("inquirer");
const cTable = require("console.table");

let connection = mysql2.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "employee_db"
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("Connected as id " + connection.threadId);
  init();
});


//Initialize 
function init() {
  inquirer.prompt({
    type: "list",
    name: "toDo",
    message: "What would you like to do?",
    choices: ["View All Departments", "View All Roles","View All Employees", "View All Employees By Department","Add A Department", "Add A Role","Add An Employee","Update Employee Role", "Close Session"]
  })
    .then(function (response) {
      switch (response.toDo) {

        case "View All Departments":
          viewDepartments();
          break;

        case "View All Roles":
          viewRoles();
          break;
        
        case "View All Employees":
            viewEmployees();
            break;

        case "View All Employees By Department":
          viewByDept();
          break;
        
        case "Add A Department":
            addDept();
            break;
        
        case "Add A Role":
            addRole();
            break;
        
        case "Add An Employee":
            addEmployee();
            break;

        case "Update Employee Role":
            updateRole();
            break;
        
        case "Close Session":
            closeSession();
            break;
      }
    })
};

//Display Departments
function viewDepartments() {
    const deptQuery = `SELECT * FROM department`
    connection.query(deptQuery, (err, res) => {
      if (err) throw err;
      console.table(res);
      init();
    })
};

//Display Roles
function viewRoles() {
    const roleQuery = `SELECT * FROM role`
    connection.query(roleQuery, (err, res) => {
      if (err) throw err;
      console.table(res);
      init();
    })
};

//Display Employees
function viewEmployees() {
    const employeeQuery = `SELECT employee.id, employee.first_name, employee.last_name, role.title AS role, 
    CONCAT(manager.first_name,' ',manager.last_name) AS manager, department.name
    FROM employee 
    LEFT JOIN role ON employee.role_id = role.id 
    LEFT JOIN department ON role.department_id = department.id 
    LEFT JOIN employee manager ON  employee.manager_id = manager.id`
  
    connection.query(employeeQuery, (err, res) => {
      if (err) throw err;
      console.table(res);
      init();
    })
  };

//Display Employee by Department
function viewByDept() {
  const deptSelectViewQuery = ("SELECT * FROM department");

  connection.query(deptSelectViewQuery, (err, response) => {
    if (err) throw err;
    const departments = response.map(element => {
      return { name: `${element.name}` }
    });

    inquirer.prompt([{
      type: "list",
      name: "dept",
      message: "What department would you like to view?",
      choices: departments

    }]).then(answer => {
      const deptSelectViewQueryA = `SELECT employee.first_name, employee.last_name, employee.role_id AS role, CONCAT(manager.first_name,' ',manager.last_name) AS manager, department.name as department 
      FROM employee LEFT JOIN role on employee.role_id = role.id 
      LEFT JOIN department ON role.department_id =department.id LEFT JOIN employee manager ON employee.manager_id=manager.id
      WHERE ?`
      connection.query(deptSelectViewQueryA, [{ name: answer.dept }], function (err, res) {
        if (err) throw err;
        console.table(res)
        init();
      })
    })
  })
};
//Add Department
function addDept() {
    let deptSelectAddQuery = `SELECT * FROM department`
    connection.query(deptSelectAddQuery, (err, res) => {
      if (err) throw err
      inquirer.prompt([{
        type: "input",
        name: "deptId",
        message: "What is the Department ID?"
      }, 
      {
        type: "input",
        name: "deptName",
        message: "What is the Department Name?"
      }])
        .then(answers => {
          let deptInsertAddQuery = `INSERT INTO department VALUES (?,?)`
          connection.query(deptInsertAddQuery, [answers.deptId, answers.deptName], (err) => {
            if (err) throw err
            console.log(`${answers.deptName} added`)
            init();
          })
        })
    })
  };
  
     
//Add Role
function addRole() {
    let roleSelectQuery = `SELECT * FROM role`
    connection.query(roleSelectQuery, (err, data) => {
      if (err) throw err
      inquirer.prompt([
        {
          type: "input",
          name: "roleId",
          message: "What is the new role id?"
        }, 
        {
          type: "input",
          name: "role",
          message: "What is the new role title?"
        }, 
        {
          type: "input",
          name: "salary",
          message: "What is the new role salary?"
        }, 
        {
          type: "input",
          name: "deptId",
          message: "What is the department id for the new role?"
        }])
        .then(function (answers) {
          let roleInsertQuery = `INSERT INTO role VALUES (?,?,?,?)`
          connection.query(roleInsertQuery, [answers.roleId, answers.role, answers.salary, answers.deptId], function (err) {
            if (err) throw err;
            console.log(`${answers.role} added`)
            init();
          })
        })
    })
  }

//Add Employee
function addEmployee() {
    let addEmployeeQuery = `SELECT employee.id, employee.first_name, employee.last_name, employee.salary, employee.role_id, role.title, department.name,
    role.salary, employee.manager_id 
      FROM employee
      INNER JOIN role on role.id = employee.role_id
      INNER JOIN department ON department.id = role.department_id`
    connection.query(addEmployeeQuery, (err, results) => {
      if (err) throw err;
      inquirer.prompt([
        {
          type: "input",
          name: "first_name",
          message: "What is the employee's first name?"
        }, 
        {
          type: "input",
          name: "last_name",
          message: "What is the employee's last name?"
        }, 
        {
            type:"input",
            name: "salary",
            message: "What is the employee's salary?"
        },
        {
          type: "list",
          name: "role",
          message: "What is the employee's title",
          choices: results.map(role => {
            return { name: role.title, value: role.role_id }
          })
        }, 
        {
          type: "input",
          name: "manager",
          message: "What is the employee's manager id?"
        }])
        .then(answer => {
          console.log(answer);
          connection.query(
            "INSERT INTO employee (first_name, last_name, salary, role_id, manager_id) VALUES (?,?,?,?,?)",
            [answer.first_name, answer.last_name, answer.salary, answer.role, answer.manager],
            function (err) {
              if (err) throw err
              console.log(`${answer.first_name} ${answer.last_name} added`)
              init();
            })
        })
    })
  };

//Update Employee Role
function updateRole() {
    let updateQuery = ("SELECT * FROM employee")
    connection.query(updateQuery, (err, response) => {
        
        const employees = response.map(function (element) {
            return {
                name: `${element.first_name} ${element.last_name}`,
                value: element.id
            }
         });
         
         inquirer.prompt([
             {
                 type: "list",
                 name: "employeeId",
                 message: "What employees role needs updated?",
                 choices: employees
      }]).then(input1 => {
          connection.query("SELECT * FROM role", (err, data) => {
              
            const roles = data.map(function (role) {
                return {
                    name: role.title,
                    value: role.id
                }
            });
            
            inquirer.prompt([{
                type: "list",
                name: "roleId",
                message: "What's the employee's new role?",
                choices: roles
            }]).then(input2 => {
                const updateQuery1 = `UPDATE employee
                SET employee.role_id = ? 
                WHERE employee.id = ?`
                connection.query(updateQuery1, [input2.roleId, input1.employeeId], function (err, res) {
                    let tempPosition;
                    
                    for (let i = 0; i < roles.length; i++) {
                        if (roles[i].value == input2.roleId) {
                            tempPosition = roles[i].name;
                        }
                    }
                 let tempName;
                 for (let j = 0; j < employees.length; j++) {

                     if (employees[j].value == input1.employeeId) {
                         tempName = employees[j].name;
                        }
                    } 
                    
                    if (res.changedRows === 1) {
                        console.log(`Successfully updated ${tempName} to position of ${tempPosition}`);
                    } else {
                        console.log(`Error: ${tempName}'s current position did not update and is ${tempPosition}`)
                    }
                    init();
                })
              })
          })
        })
    })
  };







