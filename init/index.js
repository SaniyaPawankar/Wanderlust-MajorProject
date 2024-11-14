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
        await mongoose.connect(dbUrl);  // Simply pass the dbUrl without deprecated options
        console.log("Connected to DB");

        await initDB();
    } catch (err) {
        console.error("Error connecting to DB:", err);
    } finally {
        mongoose.connection.close();  // Close connection after initialization
    }
}

const initDB = async () => {
    try {
        await Listing.deleteMany();

        // Modify the data as needed
        const dataWithOwner = initData.data.map((obj) => ({
            ...obj,
            owner: "66b8ba897c928a693bfd5e32", // Replace with actual owner ID
        }));

        await Listing.insertMany(dataWithOwner);
        console.log("Data was initialized");
    } catch (err) {
        console.error("Error initializing database:", err);
    }
};

// Start the process
main();

