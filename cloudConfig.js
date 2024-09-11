const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

/*configuration means combining */
/* this is for configuring backend with the cloudinary account*/
cloudinary.config({
   /* In this we pass configuration details  */
   //here we require the information stored in env file
   cloud_name: process.env.CLOUD_NAME,
   api_key: process.env.CLOUD_API_KEY,
   api_secret:  process.env.CLOUD_API_SECRET

});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'wanderlust_DEV',
      allowedFormats: ["png", "jpg", "jpeg"]// supports promises as well
    },
  });

  module.exports= {
    cloudinary,
    storage,
  };
  