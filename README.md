# Petstore API Tests

API test project for the [Swagger Petstore API](https://petstore.swagger.io).

## Tools used

- [Jest](https://jestjs.io) — test runner
- [Supertest](https://www.npmjs.com/package/supertest) — 
- [Thunder Client]( www.thunderclient.com) —  lightweight Rest API Client Extension for VS Code

## Setup

```bash
npm install
npm test
```

## What is tested

A. Functional Lifecycle (Happy Path)
These tests ensure the core logic of the API works as expected:
* POST /pet: Creates a pet with a unique random ID.
* GET /pet/{petId}: Retrieves the created pet using a Path Parameter.
* PUT /pet: Updates the pet's data (name and status).
* GET /pet/findByStatus: Filters pets using a Query Parameter.
* DELETE /pet/{petId}: Removes the pet from the store.

B. Negative & Edge Case Testing
These tests probe the API’s resilience:

* Invalid Data Types: Sending strings where integers are expected.
* Boundary Values: Sending extremely long strings (30,000+ characters) in the name field.
* Malformed Requests: Empty JSON bodies and invalid header configurations.
* Security/Injection: Testing path parameters with SQL-like syntax (123 OR 1=1).

## Key faindings & bug discoveries

* Critical Bug (Format Incompatibility):
  Requesting text/plain via headers causes the server to crash. The response returns a full Java stack trace indicating that no "Message Body Writer" exists for that MIME type. This is a security risk as it leaks backend architecture details (Jetty/Jersey/Java).

* Information Leakage (Input Validation):
  When a non-numeric string is injected into the ID path parameter, the API returns a 404 error containing a raw java.lang.NumberFormatException. Ideally, the API should sanitize this input and return a 400 Bad Request without exposing internal Java exceptions.

* Lack of Content Length Validation:
  The name field within the /pet endpoint does not appear to have a character limit. Successfully posting a 30,000+ character string suggests the API is vulnerable to resource exhaustion or database bloat attacks.

* Generic Error Handling:
  Sending a string in the JSON id field triggers a generic "something bad happened" message with a 500 status code. This indicates a lack of a global  error-handling interceptor to catch type-mismatch errors before they reach the core logic.