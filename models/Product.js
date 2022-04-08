const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Product = db.define('product', {
    prodcode: {
        type: Sequelize.INTEGER
    },
    prodtitle: {
        type: Sequelize.STRING
    },
    proddesc: {
        type: Sequelize.STRING(500)
    },
    prodquantity: {
        type: Sequelize.INTEGER,
    },
    prodprice: {
        type: Sequelize.FLOAT
    }
});
module.exports = Product;