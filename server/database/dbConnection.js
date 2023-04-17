const mongoose = require("mongoose");

mongoose.set("strictQuery", true);

const dbConnection = () => {
    mongoose.connect(process.env.DB_URI).then((conn) => {
        console.log(`Database Connected ${conn.connection.host}`);
    });
    // .catch((err) => {
    //     console.log(`error: ${err}`);
    //     process.exit(1);
    // });
};

module.exports = dbConnection;
