const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res)=> {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview);
    listing.reviews.push(newReview);

    await newReview.save();
    req.flash("success", "New Review Created");
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
}

module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;
    
    // Find the listing and remove the reference to the review
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    
    // Delete the actual review
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted");
    
    // Redirect back to the listing page
    res.redirect(`/listings/${id}`);
  }