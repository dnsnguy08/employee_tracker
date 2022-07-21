USE employees_db;

INSERT INTO department (name)
VALUES ("Sales"), ("Engineering"), ("Human Resources"), ("Legal"), ("Finance");

INSERT INTO role (title, salary, department_id)
VALUES ("Tech Lead", "180000", "5"), ("Software Developer", "90000", "2"), ("Lawyer", "100000", "4"), ("Writer", "70000", "3"), ("Salesperson", "60000", "1");

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Dennis", "Nguyen","2", "1"), ("Dave", "Chappelle", "2", "1"), ("Tupac", "Shakur", "4", "1"), ("Michael", "Jordan", "1", "1");
