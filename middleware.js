const Listing = require("./models/listing");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema} = require("./schema.js");
const Review = require("./models/review")
/*Middleware to check whether it is logged in or not*/
module.exports.isLoggedIn = (req, res, next) => {
    console.log(req.path, "..", req.originalUrl);
    if (!req.isAuthenticated()) {
        //redirectUrl save
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to create a new listing");
        return res.redirect("/login");
    }
    next();
}

/*middleware to save the req.session.redirecturl as a local parameter so that we directly redirect to the req.original url  */
/*passport refreshes all the info saved in session after logged in so it will automatically delete the req.session.originalUrl after logged in*/
/*But passport don't have any access of locals(are the variables that can be accessible from anywhere) */

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }next();
};

/*this middleware will check whether the curUser is owner of the listing or not */
module.exports.isOwner = async(req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.curUser._id)){
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.isReviewAuthor = async(req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.curUser._id)){
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
}


module.exports.validateListing = (req, res, next) => {
    console.log(req.body);
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(", ");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message.join(","));
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};