# Intro

I am a Product Manager and I want to create an application to simplify the management of Early Adopter programs within my company. Indeed, in the Product team we can execute Early Adopter programs to test our features before releasing them in GA.

Managing these programs is not particularly easy, especially for employees in contact with clients who can/want to register some of them in these programs. This is why I want to develop AB-EAM to simplify the management of these programs.

# Functional

## Personas

1. **Product People**: Member of the Product team who needs to manage Early Adopter programs. All Product People are also admins of the AB-EAM solution
2. **Client Manager**: Any person in the company in contact with clients who might want to register some of them in Early Adopter programs (Sales, KAM, CSM, ...)

## Features

### All Users

1. Any user can request to be registered in the application. When a user without an account arrives on the identification page, they can enter their email and request to be registered. This will create a registration request that can be reviewed by a Product People, validated (or not) and if applicable associated with a role either Product People or Client Manager

### Product People

1. As a product person, I want to be able to declare an Early Adopter program by describing mainly the feature considered, a brief description as well as the window in which the program will be included
2. As a product person, I want to be able to manage registration requests for my different programs, I can thus accept or refuse a client in the program
3. As a product person, I want to be able to manage the lifecycle of my projects, I want to be able to move them from staging to run to archived
4. As a product person, I want to be able to define whether a client has been active on an Early Adopter program or not, those in order to identify the real engagement of clients for potential future registrations in new programs
5. As a product person, I want to be able to review registration requests and depending on the situation validate them (by associating a role) or reject them

### Client Manager

1. As a Client Manager, I want to be able to consult the list of existing programs (in particular upcoming or ongoing programs) in order to be able to identify potentially interesting programs for our clients
2. As a Client Manager, I want to be able to request the registration of one of my clients in a program

## Concepts

1. A program will be characterized by the following information:
	- A creator (Product People)
	- A title
	- A description
	- A list of other Product people stakeholders of the program (the Product Designer ...)
	- A creation date
	- A start date (estimated)
	- An end date
	- a list of registration requests
	- a list of clients enrolled in the program
	- a current status (pending, live, stopped, archived)
2. A registration request will be characterized by the following information:
	- The client
	- The account ID(s) associated
	- The user(s) to contact (first name, last name, email)
	- The motivation for the request

# Technical

## Architecture

- 2 tiers: a Node/Express backend and a React frontend
- Coded in ES6 modules
- 1 ultra-light database that can be embedded in the solution, no third-party database
- Packageable and deployable in Docker
- Full REST API
- Development in TDD mode

# Process

I don't want you to start coding directly, I want you to start by writing a document at the root of the repository "Architecture.md" that lists the architectural rules, design patterns, ... that you will implement to produce this application.

I also want you to generate a "Logbook.md" file that will list all the tasks to be completed to implement this project. You will update these elements as the work progresses.

I want us to work on the backend first, and in particular on user management