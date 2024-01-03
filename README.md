# Let It Crash Approach Demonstration

This application is a demonstration of the "Let It Crash" approach in software development. The "Let It Crash" model is a design philosophy in system development where the system is designed to stop and restart in response to certain types of errors, rather than attempting to account for all possible error conditions.

## Overview

In this application, I use Node.js' Async LocalStorage to retrieve the response object from a global handle. This allows us to respond to individual customers even in the event of a critical error.

If a database connection is off, the application will prevent receiving new connections, stop the current database connection, and then terminate. This approach allows the system to recover from errors quickly and continue operating, rather than attempting to handle every possible error condition and potentially causing more problems.

## Prerequisites

Before you can run this application, you must have the following installed:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

These are used to spin up the PostgreSQL database that the application interacts with.

## Running the Application

To run the application, follow these steps:

1. Start the PostgreSQL database with Docker Compose:

    ```bash
    docker-compose up
    ```

2. Install the necessary dependencies with `npm install`.

3. Start the application with `npm start`.

## Usage

This application exposes an API endpoint at `localhost:3000` that accepts JSON payloads. The endpoint interacts with a PostgreSQL database, which is spun up using Docker Compose.

Here are some examples of how to use the API:

### Inserting an Item

You can insert an item into the database by sending a POST request with a JSON payload. Here's an example using `curl`:

```bash
curl \
    -H "Content-Type: application/json" \
    -d '{"name":"John Wick", "power": "superhuman strength"}' \
    localhost:3000
```

This will insert a new item with the name "John Wick" and the power "superhuman strength" into the database.

### Causing the Application to Crash

You can cause the application to crash and stop accepting new connections by sending a malformed JSON payload. Here's an example:

```bash
curl \
    -H "Content-Type: application/json" \
    -d '{"}' \
    localhost:3000
```

which will log:
```
postgres is running
server running at 3000
req: [ff1] crashed but will be nicely handled!
unhandledRejection received!
message: SyntaxError: Unterminated string in JSON at position 3

http server closed
DB connection closed
```
Or you can stop the docker compose instance and trigger the payload below:

```bash
curl \
    -H "Content-Type: application/json" \
    -d '{"name":"John Wick", "power": "superhuman strength"}' \
    localhost:3000
```
which will log:
```
postgres is running
server running at 3000
req: [387] crashed but will be nicely handled!
unhandledRejection received!
message: SequelizeConnectionRefusedError

http server closed
```
This will cause the application to throw a JSON parsing error, which will trigger the "Let It Crash" behavior.

