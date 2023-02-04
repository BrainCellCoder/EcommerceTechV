const express = require("express");
const app = express();
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const Product = require("./models/productModel");
const User = require("./models/userModel");
const session = require("express-session");

//DB connection
const DB = "mongodb+srv://techv-ecom:techv-ecom@cluster0.h2kbo.mongodb.net/mernEcommerce";
mongoose.connect(DB,{
    useNewUrlParser: true,
    useUnifiedTopology:true
}).then(con => {
    console.log("DB connected successfuly");
}).catch(e => {
    console.log(e);
})

// express-session
const sessionOptions = {
    secret: "thisisnotagoodsecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionOptions));

//express body parser
app.use(express.json());

// isLoggedIn middleware
const isLoggedIn = (req,res,next) =>{
    if(!req.session.user){
        return res.status(400).json({
            message: "You must be logged in"
        })
    }
    next();
}
// isAdmin middleware
const isAdmin = (req,res,next) =>{
    if(req.session.user.role !== "admin"){
        return res.status(400).json({
            message: "You are not an admin (Access Denied)"
        })
    }
    next();
}

//get all products
app.get("/products",async (req,res)=>{
    try{
        const productCount = await Product.countDocuments();
        console.log(productCount);

        const {name, category, price} = req.query;
        const queryObj = {};
        if(name){
            queryObj.name = {$regex: name, $options: "i"}//filter by name
        }
        if(category){
            queryObj.category = {$regex: category, $options: "i"}//filter by category
        }
        if(price){
            let p = JSON.stringify(price)
            console.log(p);
            p = p.replace(/\b(gt|gte|lt|lte)\b/g,(key) => `$${key}`)
            console.log("*****",p);
            queryObj.price = JSON.parse(p)//filter by price
        }
        //pagination
        let page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 3;//result per page
        let skip = (page-1)*limit;
        console.log(queryObj);

        const products = await Product.find(queryObj).skip(skip).limit(limit);
        res.status(200).json({
            numberOfProduct: products.length,
            products : products.length === 0 ? "No product found" : products,
            totalNumberOfProducts: productCount
        })
    }catch(err){
        console.log(err);
    }
});

//get single product 
app.get("/product/:id", async(req,res)=>{
    try{
        const {id} = req.params;
        const product = await Product.findById(id);
        if(product){
            return res.status(200).json({
                message: "Product details found",
                product
            })
        }else{
            return res.status(400).json({
                message: "Product not found"
            })
        }
    }catch(err){
        res.status(400).json({
            error: err.message
        })
    }
})

//Create Product by Admin
app.post("/product/new",isLoggedIn, isAdmin, async (req,res)=>{
    try{
        req.body.createdBy = req.session.user._id;
        const product = await Product.create(req.body);
        if(product){
            return res.status(200).json({
                message: "Product created",
                product
            })
        }else{
            return res.status(400).json({
                message: "Faild to create a product"
            })
        }
    }catch(err){
        res.status(400).json({
            error: err.message
        })
    }
});

//update product by admin
app.put("/product/:id", isLoggedIn, isAdmin, async (req,res)=>{
    const {id} = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body);
    if(!product) {
            return res.status(400).json({
            message: "Product not found"
        })
    }
    res.status(200).json({
        message: "Product updated",
        product
    });
});

//detete product by admin
app.delete("/product/:id", isLoggedIn, isAdmin, async(req,res)=>{
    try{
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({
            message: "Product deleted"
        })
    }catch(err){
        console.log(err);
    }
});

//User register
app.post("/register", async (req,res)=>{
    try{
        const {name, email, password, role} = req.body;
        const user = await User.create({
            name, email, password, role,
            avtaar:{
                public_id: "this is a sample id",
                url: "profileURL"
            }
        });
        req.session.user = user;
        res.status(200).json({
            message: "User registered successfuly",
            user
        })
    }catch(err){
        res.status(400).json({
            message: "Error!!",
            error: err
        })
    }
});

//User Login
app.post("/login", async (req,res)=>{
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                message: "Please enter email and password"
            })
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                message: "User not found. Please register yourself"
            })
        }else{
            if(password === user.password){
                req.session.user = user
                console.log(req.session.user);
                res.status(200).json({
                    message: "Logged in successfuy"
                })
            }else{
                res.status(400).json({
                    message: "Incorrect Username/Password"
                })
            }
        }
    } catch (err) {
        console.log(err);
    }
});

// User logout
app.post('/logout', (req, res) => {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          res.status(400).json({
            message: 'Unable to log out'
          })
        } else {
          res.status(200).json({
            message: 'Logout successful'
          })
        }
      });
    } else {
      res.end()
    }
  })

 
app.listen(8000, (req,res)=>{
    console.log("Listening in PORT 8000");
})