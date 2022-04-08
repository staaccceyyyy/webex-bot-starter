const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const Survey = db.define('survey', {
    name: {
        type: Sequelize.STRING
    },
    email: {
        type: Sequelize.STRING
    },
    q1: {
        type: Sequelize.STRING
    },
    q2: {
        type: Sequelize.STRING
    },
    q3: {
        type: Sequelize.STRING
    },
});
module.exports = Survey;
