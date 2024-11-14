
if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
// console.log(process.env.SECRET);

const express = require("express");
const app = express();
const sampleListings = require("./init/data.js");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
import data from "./init/data.js";

const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const { default: axios } = require("axios");

/*For databases we create a async function*/
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("connected to DB");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));//parsing of form data
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);//similar  like includes and partial in ejs
app.use(express.static(path.join(__dirname, "/public")));//to use static file public

app.get('/api/listings', (req, res) => {
    Listing.find()
      .then(listings => {
        if (listings.length === 0) {
          res.json(sampleListings);
        } else {
          res.json(listings);
        }
      })
      .catch(err => res.status(500).json({ error: 'An error occurred' }));
  });

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET_CODE,
    },
    touchAfter: 24 * 3600,
});

store.on("error", ()=> {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET_CODE,
    resave: false,
    saveUninitialized : true,
    cookie: {
        expires: Date.now() * 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
    
};



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

app.get()



app.get("/listings/search/:searchValue",async(req,res,next)=>{
    const searchTerm = req.query.searchTerm;
    const query = {
        $or: [
          { title: new RegExp(searchTerm, 'i') }, 
          { location: new RegExp(searchTerm, 'i') },
          { country: new RegExp(searchTerm, 'i') },
          { description: new RegExp(searchTerm, 'i') }
        ]
      };
      try {

        const alllistings = await Listings.find(query);
        res.render("listing/index.ejs", { alllistings });
      } catch (error) {
        next(error);
      }

}); 



/*Generates a function that is used by passport to serialize users into the session*/
/* Storing all info related to user into session - serialization/ serializing user */
passport.serializeUser(User.serializeUser());
/*Generates a function that is used by passport to deserialize users into the session*/
passport.deserializeUser(User.deserializeUser());
/* Removing all info related to user from session - deserialization/ serializing user */

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.curUser = req.user;
    next();
});

// app.get("/demouser", async(req, res) => {
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "delta-student",
//   });
// /* register(static method) method will save the fakeuser in database*/
//   let registeredUser = await User.register(fakeUser, "helloworld");
//   res.send(registeredUser);
// });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


//Reviews
//Post Route



//Delete review route
// app.delete("/listings/:id/reviews/:reviewId", wrapAsync( async(req, res) => {
//     let {id, reviewId} = req.params;

//     await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId}});
//     await Review.findByIdAndDelete(reviewId);
//     res.redirect(`/listings/${id}`);
// }));





// app.get("/testListing",async (req, res) => {
//    let sampleListing = new Listing ({
//     title : "My New Villa",
//     description : "By the beach",
//     price : 1200,
//     location : "Calangute, Goa",
//     country : "India",
//    });
//    await sampleListing.save();
//    console.log("sample was saved");
//    res.send("successful testing");
// });


//Throwing new ExpressError 
// app.all("*", (req, res, next) => {
//     next(new ExpressError(404, "Page Not Found!"));
// });

app.use((err, req, res, next) => {
    /*The above express error will be catched here and further actions get performed*/
    let { statusCode = 500, message = "something went wrong" } = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", { err });
});


// axios.get('/listings', (req, res)=>{
//     params: {
//         country: 'USA' // Replace 'USA' with the actual value you want to filter by
//     }
//     console.log('Received query parameters:', req.query);
// })
// .then(response => {
//     console.log('Response:', response.data);
// })
// .catch(error => {
//     console.error('Error:', error);
// });

/*Basic Api*/
app.get("/", (req, res) => {
    res.send("hi, I am root");
});




app.listen(8080, () => {
    console.log("server is listening to port 8080");
});




