const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Feedback = db.define('feedback', {
    fbresponse : {
        type: Sequelize.STRING(1000)
    }
});
module.exports = Feedback;