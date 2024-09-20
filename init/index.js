// const mongoose = require("mongoose");
// const initData = require("./data.js");
// const Listing = require("../models/listing.js");
// if(process.env.NODE_ENV != "production"){
//     require("dotenv").config();
// }

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
// const dbUrl = process.env.ATLASDB_URL;

// main().then(() => {
//     console.log("connected to DB");
// }).catch((err) => {
//     console.log(err);
// });



// async function main(){
//     await mongoose.connect(dbUrl);
// }

// const initDB = async () => {
//     await Listing.deleteMany();
//     /* here data is a array*/
//     initData.data = initData.data.map((obj) => ({...obj, owner: "66b8ba897c928a693bfd5e32"}))
//     await Listing.insertMany(initData.data);
//     console.log("data was initialized");
// }

// initDB();

/*index.js helps to initialize the database*/


/*Updated Code*/ 
ATLASDB_URL= "mongodb+srv://saniyapawankar:eJ7jtECeGempQUYY@cluster0.lmlct.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
SECRET_CODE= "kjbsdfvyqvkh"
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

// Load environment variables only if not in production
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// Get the MongoDB URI from environment variables or use a default
const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    try {
        await mongoose.connect(dbUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to DB");

        await initDB();
    } catch (err) {
        console.error("Error connecting to DB:", err);
    } finally {
        // Close the connection after the operation is complete
        mongoose.connection.close();
    }
}

async function main(){
    await mongoose.connect(dbUrl);
}

const initDB = async () => {
    try {
        await Listing.deleteMany();

        // Modify the data as needed
        const dataWithOwner = initData.data.map((obj) => ({
            ...obj,
            owner: "66b8ba897c928a693bfd5e32" // Replace with actual owner ID
        }));

        await Listing.insertMany(dataWithOwner);
        console.log("Data was initialized");
    } catch (err) {
        console.error("Error initializing database:", err);
    }
};

main();

initDB();

