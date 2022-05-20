const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const Agenda = db.define('agenda', {
    today: {
        type: Sequelize.STRING
    },
    agenda1: {
        type: Sequelize.STRING
    },
    agenda2: {
        type: Sequelize.STRING
    },
    agenda3: {
        type: Sequelize.STRING
    },
});
// INDEX.js
module.exports = Agenda;
