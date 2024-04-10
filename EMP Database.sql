CREATE DATABASE EMP;
USE EMP;

CREATE TABLE Position (
    Position_ID INT IDENTITY(1,1) PRIMARY KEY,
    Position_Name NVARCHAR(MAX) NOT NULL,
	Hierarchy_Level INT NOT NULL
);

CREATE TABLE Employee (
    Employee_ID INT IDENTITY(1000,1) PRIMARY KEY,
    Employee_Name NVARCHAR(MAX) NOT NULL,
    Employee_Surname NVARCHAR(MAX) NOT NULL,
    Employee_Email NVARCHAR(MAX) NOT NULL,
	GravatarUrl NVARCHAR(MAX) NOT NULL,
    Birth_Date DATE,
    Salary DECIMAL(10, 2), 
    Position_ID INT NOT NULL,
    Manager_ID INT NOT NULL,
    FOREIGN KEY (Position_ID) REFERENCES Position(Position_ID)
);

INSERT INTO Position (Position_Name, Hierarchy_Level) VALUES
('CEO', 1),
('Vice President', 2),
('Director', 3),
('Manager', 4),
('Team Lead', 5),
('Software Engineer', 6);

-- CEO
INSERT INTO Employee (Employee_Name, Employee_Surname, Employee_Email, Birth_Date, Salary, Position_ID, Manager_ID, GravatarUrl) 
VALUES ('Cameron', 'Taberer', 'camerontaberer@icloud.com', '2001-06-13', 100000, 1, 0, 'camerontaberer@icloud.com/1');

-- Vice President
INSERT INTO Employee (Employee_Name, Employee_Surname, Employee_Email, Birth_Date, Salary, Position_ID, Manager_ID, GravatarUrl) 
VALUES ('Alexis', 'Terblanche', 'alexisterblanche@gmail.com', '2002-11-09', 90000, 2, 1000, 'alexisterblanche@gmail.com/2'); 

-- Director of Engineering
INSERT INTO Employee (Employee_Name, Employee_Surname, Employee_Email, Birth_Date, Salary, Position_ID, Manager_ID, GravatarUrl) 
VALUES ('Sergio', 'Singh', '97sergio@gmail.com', '1997-03-11', 85000, 3, 1001, 'emily.johnson@example.com/3'); 

-- Product Manager
INSERT INTO Employee (Employee_Name, Employee_Surname, Employee_Email, Birth_Date, Salary, Position_ID, Manager_ID, GravatarUrl) 
VALUES ('Michael', 'Williams', 'michael.williams@example.com', '1986-04-10', 80000, 4, 1001, 'michael.williams@example.com/4'); 

-- Development Team Lead
INSERT INTO Employee (Employee_Name, Employee_Surname, Employee_Email, Birth_Date, Salary, Position_ID, Manager_ID, GravatarUrl) 
VALUES ('David', 'Brown', 'david.brown@example.com', '1990-12-30', 75000, 5, 1002, 'david.brown@example.com/5'); 

-- QA Team Lead
INSERT INTO Employee (Employee_Name, Employee_Surname, Employee_Email, Birth_Date, Salary, Position_ID, Manager_ID, GravatarUrl) 
VALUES ('Elizabeth', 'Jones', 'elizabeth.jones@example.com', '1988-07-25', 72000, 5, 1002, 'elizabeth.jones@example.com/6'); 

-- Senior Software Engineer
INSERT INTO Employee (Employee_Name, Employee_Surname, Employee_Email, Birth_Date, Salary, Position_ID, Manager_ID, GravatarUrl) 
VALUES ('Christopher', 'Garcia', 'christopher.garcia@example.com', '1992-03-18', 65000, 6, 1003, 'christopher.garcia@example.com/7'); 

-- Software Engineer
INSERT INTO Employee (Employee_Name, Employee_Surname, Employee_Email, Birth_Date, Salary, Position_ID, Manager_ID, GravatarUrl) 
VALUES ('Jessica', 'Martinez', 'jessica.martinez@example.com', '1995-08-12', 60000, 6, 1003, 'jessica.martinez@example.com/8');

-- QA Engineer
INSERT INTO Employee (Employee_Name, Employee_Surname, Employee_Email, Birth_Date, Salary, Position_ID, Manager_ID, GravatarUrl) 
VALUES ('Brian', 'Wilson', 'brian.wilson@example.com', '1993-11-05', 55000, 6, 1004, 'brian.wilson@example.com/9');
