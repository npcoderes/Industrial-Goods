const jwt = require("jsonwebtoken");
require("dotenv").config();


//auth
exports.auth = async (req, res, next) => {
    try{
        //extract token
        const token =  req.body.token 
                        || req.header("Authorization").replace("Bearer ", "");

        //if token missing, then return response
        console.log("pahse 1");
        console.log(token);
        if(!token) {
            return res.status(401).json({
                success:false,
                message:'Token is missing',
            });
        }
        console.log("pahse 2");

        //verify the token
        try{
            const decode =  jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode;
        }
        catch(err) {
            //verification - issue
            return res.status(401).json({
                success:false,
                message:'token is invalid',
            });
        }
        next();
    }
    catch(error) {  
        return res.status(401).json({
            success:false,
            message:'Something went wrong while validating the token',
        });
    }
}

