const cloudinary = require("cloudinary").v2; //! Cloudinary is being required
const dotenv = require("dotenv"); //! dotenv is being required
dotenv.config(); //! dotenv is being configured
exports.cloudinaryConnect = () => {
	try {
		cloudinary.config({
			//!    ########   Configuring the Cloudinary to Upload MEDIA ########
			cloud_name: process.env.CLOUD_NAME,
			api_key: process.env.API_KEY,
			api_secret: process.env.API_SECRET,
		});
	} catch (error) {
		console.log(error);
	}
};