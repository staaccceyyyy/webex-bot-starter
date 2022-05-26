const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const Report = db.define('report', {
    reportguy: {
        type: Sequelize.STRING
    },
    report1: {
        type: Sequelize.STRING
    },
    report2: {
        type: Sequelize.STRING
    },
    report3: {
        type: Sequelize.STRING
    },
    report4: {
        type: Sequelize.STRING
    },
});
 
module.exports = Report;
