const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
/* Creates a user(s) table in MySQL Database.
Note that Sequelize automatically pleuralizes the entity name as the table name
*/
const SurveyQuestions = db.define('surveyqn', {
    scode: {
        type: Sequelize.INTEGER
    },
    stitle: {
        type: Sequelize.STRING
    },
    sdescription: {
        type: Sequelize.STRING
    },
    sqn1: {
        type: Sequelize.STRING
    },
    sqn2: {
        type: Sequelize.STRING
    },
    sqn3: {
        type: Sequelize.STRING
    },
    sqn4: {
        type: Sequelize.STRING
    },
    sqn5: {
        type: Sequelize.STRING
    }
    
});
module.exports = SurveyQuestions;
