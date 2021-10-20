USE employee_db;

INSERT INTO department(name)
VALUES 
("Administration"),
("Human Resources"),
("Marketing"),
("Coaching Staff"),
("Team");



INSERT INTO role (title, salary, department_id)
VALUES 
('CEO/Owner', 500000, 1),
('Employee Relations', 300000, 2),
('Marketing Director', 100000, 3),
('Coach', 80000, 4),
('Assistance Coach', 60000, 4),
('Player', 40000, 5);


INSERT INTO employee(first_name, last_name, salary, role_id, manager_id)
VALUES 
('Rebecca', 'Boss', 500000, 1, null),
('Ted', 'Lasso', 80000, 4, 1),
('Roy', 'Kent', 60000, 5, 5),
('Keely', 'Jones', 100000, 3, 6),
('Coach', 'Beard', 60000, 4, 2),
('Higgins', 'HR', 300000, 2, 1),
('Sam', 'Obisanya', 40000, 6, 5);
