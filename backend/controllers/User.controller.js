import asynchandler from "../utilities/asynchandler.js";
import { User } from "../models/User.models.js";
import { validationResult } from "express-validator";
import ApiError from "../utilities/ApiError.js";
import jwt from "jsonwebtoken";
const generateAcessandRefreshToken = async (id) => {
    try {
        const user = await User.findById(id);

        const Accesstoken = await user.generateAccessToken();
        const Refreshtoken = await user.generateRefreshToken();
        console.log("Access token", Accesstoken);
        console.log("Refresh token", Refreshtoken);
        user.RefreshToken = Refreshtoken
        await user.save({ validateBeforeSave: false });
        return { Accesstoken, Refreshtoken };
    } catch (error) {
        console.error(error);
        throw new ApiError(401, "tokens cant be generated");

    }
}
const options = {
    httpOnly:true,
    secure: true,
    sameSite: 'none'
}
const registerUser = asynchandler(async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, fullname, password } = req.body;
    const{firstname,lastname}=fullname;
    console.log(email);
    if ([email, fullname.firstname, password].some((superman) => {
        return superman?.trim() === ""
    })) {
        throw new ApiError(401, " fill all the credentials")
    }
    const existed = await User.findOne(
        { email: req.body.email }
    )
    if (existed) {
        throw new ApiError(401, " user already exist");
    }
    const user = await User.create({
        email,
        fullname:{
            firstname,
            lastname
        },
       password


    })



    return res.status(200).json({ user });

});




const loginUser = asynchandler(async (req, res, next) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {

        return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body;
    if ([email, password].some((superman) => {
        return superman?.trim() === ""
    })) {
        throw new ApiError(420, " fill all the credentials")
    }
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        throw new ApiError(421, "user not register")
    }
    const ispasswordcorrect = await user.isPasswordCorrect(password);
    if (!ispasswordcorrect) {
        throw new ApiError(422, "incorrect password")
    }
    const { Accesstoken, Refreshtoken } = await generateAcessandRefreshToken(user?._id);

    return res.status(201)
    .cookie("Accesstoken",Accesstoken, options)
    .cookie("Refreshtoken",Refreshtoken, {httpOnly:true,secure:true,sameSite:'None'})
    .json({ message: "logged in" ,Accesstoken,Refreshtoken,user});
})

const logout = asynchandler(async (req, res, next) => {
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                RefreshToken: null
            },



        },
        { new: true },



    )




    return res.status(201).clearCookie("Accesstoken", options).clearCookie("Refreshtoken", options).json({ message: "logged out " })

})

// essential on reload  for thre context though
const Userdetails = asynchandler(async(req, res, next)=>  {

    const Users = await User.findById(req.user?._id).select('-password -RefreshToken');
    res.status(201).json({Users});
})
const refreshAccesstokens= asynchandler(async(req,res,next)=>{
// first of all check wether refresh axcces token  is there
try {
    const incomingRefreshToken=  req.cookie?.Refreshtoken ||req.body.Refreshtoken
    if(!incomingRefreshToken){
    
        throw new ApiError(403,"token not found")
    }
    const decodedtoken= await jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
    if(!decodedtoken){
        throw new ApiError(403,"not able to decode")
    }
    const Users= await User.findById(decodedtoken?._id);
    if(incomingRefreshToken!==Users?.RefreshToken){
        throw new ApiError(402,"tokens expired");
    }
    const {Accesstoken,Refreshtoken}= generateAcessandRefreshToken(Users?._id);
    res.status(201).cookie('Accesstoken',options).cookie('Refreshtoken',options).json({Accesstoken,Refreshtoken});
    
} catch (error) {
    console.log(error);
    throw new ApiError(404," both tokens are expired");
    
}
}


)
export {
    registerUser, loginUser, logout,Userdetails,refreshAccesstokens
};