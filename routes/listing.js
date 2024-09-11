const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");

const upload = multer({storage});

const listingController = require("../controllers/listings.js");

//index route
router.route("/")
.get(wrapAsync(listingController.index))
.post( 
     isLoggedIn,
     // validateListing,  
     upload.single("listing[image]"),
     wrapAsync(listingController.createListing)
);
// .post( ,(req, res) => { /* here upload.single() is a middleware that save a single file*/
//      res.send(req.file);
// });

//new route
//WE are passing isLoggedIn as a middleware to authenticate user whether it is logged in or not
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
//show route 
.get( wrapAsync(listingController.showListings))
//update route
.put(isLoggedIn, isOwner, upload.single("listing[image]"),validateListing,  wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner,  wrapAsync(listingController.destroyListing));












//Edit route
router.get("/:id/edit",  isLoggedIn,isOwner,  wrapAsync(listingController.renderEditForm));


//update route 
router
//delete route 
router


/* Corrected version*/
// router.delete("/:id", wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     let deleteListing = await Listing.findByIdAndDelete(id);
//     console.log(deleteListing);
//     res.redirect("/listings");
// }));

module.exports = router;