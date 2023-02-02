//env
const env = require("dotenv");
env.config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
const session = require("express-session");
const Joi = require("joi");
const {userSchema} = require("./joiSchema");
const User = require("./models/user")

//to parser req.body
app.use(express.json());

//MongoDB Atlas connection
const DB = process.env.DB_URL;
mongoose.connect(DB,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(con => {
    console.log("DB connection successful");
}).catch(e=>{
    console.log(e);
});

//express-session
const sessionConfig = {
    name: "session",
    secret: "thisshouldbeabettersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,     /* ms    s    min  hr  days*/ 
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));

//isSignedIn middleware
const isSignedIn = (req,res,next) =>{
    if(!req.session.user){
        return res.json({
            message: "You must be signed in first",
        })
    }
    next();
}

// Server side validation using npm joi
const joiValidationUser = (req,res,next)=>{
    const {error} = userSchema.validate(req.body);
    if(error) {
        return res.status(400).json({
            message: error
        });
    }else{
        next();
    }
}


app.post("/signin", async (req,res)=>{
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            res.status(400).json({
                message: "User not found!! User/passowrd incorrect",
            })
        }else{
            if(password === user.password){
                req.session.user = user;
                res.status(200).json({
                    message: "Signed in successfuly"
                })
            }else{
                res.json({
                    message: "password not matched"
                })
            }
        }
    } catch (err) {
        console.log(err);
    }
})

app.post("/signup", joiValidationUser, async (req,res)=>{
    try{
        const {email} = req.body; 
        const userFound = await User.findOne({email});

        if(userFound){
            res.status(400).json({
                message: "User already registered"
            })
        }else{
        const newUser = await User.create(req.body); 
        res.status(200).json({
            user: newUser
        })
        }
    }catch(err){
        console.log(err);
    }
});

app.post("/user/profile", isSignedIn, (req,res)=>{
    res.status(200).json({
        user: "profile"
    })
})

app.listen(process.env.PORT, () => {
    console.log(`Listening in PORT: ${process.env.PORT}`);
})