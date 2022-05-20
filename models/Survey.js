const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const Survey = db.define('survey', {
    asurcode: {
        type: Sequelize.INTEGER
    },
    aname: {
        type: Sequelize.STRING
    },
    aemail: {
        type: Sequelize.STRING
    },
    aq1: {
        type: Sequelize.STRING
    },
    aq2: {
        type: Sequelize.STRING
    },
    aq3: {
        type: Sequelize.STRING
    },
    aq4: {
        type: Sequelize.STRING
    },
    aq5: {
        type: Sequelize.STRING
    },
});
module.exports = Survey;
