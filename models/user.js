const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email : {
        type: String, 
        required:  true
    }
    /*We do not need to define password and username for user because when schema is created in database then passport will automatically define it for us*/
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);
    

