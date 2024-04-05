# Computer Laboratory Reservation Web Application Setup

This project uses Node.js and several packages. Follow the steps below to set up the project on your local machine.

## Prerequisites

Ensure that you have Node.js installed on your machine.

## Installation

1. Open your terminal.
2. Navigate to the project directory.
3. Run the following commands:

```bash
npm init -y
npm i express express-handlebars body-parser mongoose bcrypt express-session connect-mongodb-session
```

## Adding Sample Data

The project comes with sample data that you need to add to your MongoDB database.

Here’s how you can import the sample data into MongoDB:

1. Open your MongoDB.
2. Navigate to the `sample data` directory.
3. Create a collection named `labreservation`.
4. Create databases `faqs` and `labs` within the `labreservation` collection.
5. Import the data from `labreservations.faqs.json` into the `faqs` database and `labreservation.labs.json` into the `labs` database.