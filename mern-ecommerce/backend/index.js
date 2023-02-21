require('dotenv').config()
const express = require("express");
const app = express();
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const Product = require("./models/productModel");
const User = require("./models/userModel");
const session = require("express-session");
const PORT = process.env.PORT || 8000;
const {isLoggedIn, isAdmin} = require("./middlewares")

//DB connection
const DB = process.env.DB_URL;
mongoose.connect(DB,{
    useNewUrlParser: true,
    useUnifiedTopology:true
}).then(con => {
    console.log("DB connected successfully");
}).catch(e => {
    console.log(e);
})

// express-session
  const sessionOptions = {
    secret: process.env.SESSION_SECRET,
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

//get all products
app.get("/products",async (req,res)=>{
    try{
        const productCount = await Product.countDocuments();
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
            p = p.replace(/\b(gt|gte|lt|lte)\b/g,(key) => `$${key}`)
            queryObj.price = JSON.parse(p)//filter by price
        }
        //pagination
        let page = Number(req.query.page) || 1;
        let limit = Number(req.query.limit) || 3;//result per page
        let skip = (page-1)*limit;

        const products = await Product.find(queryObj).skip(skip).limit(limit);
        res.status(200).json({
            numberOfProduct: products.length,
            products : products.length === 0 ? "No product found" : products,
            totalNumberOfProducts: productCount
        })
    }catch(err){
         res.status(400).json({
            error: err.message
        })
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
app.post("/admin/product/new",isLoggedIn, isAdmin, async (req,res)=>{
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
app.put("/admin/product/:id", isLoggedIn, isAdmin, async (req,res)=>{
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
app.delete("/admin/product/:id", isLoggedIn, isAdmin, async(req,res)=>{
    try{
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({
            message: "Product deleted"
        })
    }catch(err){
         res.status(400).json({
            error: err.message
        })
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
        res.status(400).json({
            message: "Error!!",
            error: err
        })
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
  });

// add to cart
app.post("/cart/:id",isLoggedIn, async(req,res)=>{
    try{
        const {id} = req.params;
        const product = await Product.findById(id);
        if(!product){
            return res.status(400).json({
                message: "Product not found"
            })
        }
        const user = await User.findById(req.session.user._id);
        if(user.cart.includes(product._id)){
            return res.json({
                message: "Item is already in cart"
            })
        }
        user.cart.push(product);
        await user.save();
        res.status(200).json({
            message: "Product added to cart",
            user
        })
    }catch(err){
        res.status(400).json({
            message: "Error",
            err
        })
    }
});

// remove from cart
app.delete("/cart-remove/:id",isLoggedIn, async(req,res) => {
    try{
        const productId = req.params.id;
        const userId = req.session.user._id;
        await User.findByIdAndUpdate(userId, {$pull: {cart: productId}});
        return res.json({
            message: "Successfully removed from cart"
        })
    }catch(err){
        return res.status(400).json({
            message: "Error",
            err
        })
    }
});

// add to wishList
app.post("/wishlist/:id", isLoggedIn, async(req,res)=>{
    try{
        const {id} = req.params;
        const product = await Product.findById(id);
        if(!product){
            return res.status(400).json({
                message: "Product not found"
            })
        }
        const user = await User.findById(req.session.user._id);
        if(user.wishList.includes(product._id)){
            return res.json({
                message: "Item is already in Wish list"
            })
        }
        user.wishList.push(product);
        await user.save();
        res.status(200).json({
            message: "Product added to Wish List",
            user
        })
    }catch(err){
        res.status(400).json({
            message: "Error",
            err
        })
    }
})

// remove from wishlist
app.delete("/wishlist-remove/:id",isLoggedIn, async(req,res) => {
    try{
        const productId = req.params.id;
        const userId = req.session.user._id;
        await User.findByIdAndUpdate(userId, {$pull: {wishList: productId}});
        return res.json({
            message: "Successfully removed from Wish List"
        })
    }catch(err){
        return res.status(400).json({
            message: "Error",
            err
        })
    }
});

// get user details by user
app.get("/me", isLoggedIn, async(req,res)=>{
    try{
        const user = await User.findById(req.session.user._id);
        res.status(200).json({
            message: "User details",
            user
        })
    }catch(err){
        res.status(400).json({
            message: "Fetching user details failed",
            error: err
        })
    }
});

// update user details by user
app.put("/me/update", isLoggedIn, async(req,res)=>{
    try {
        const user = await User.findByIdAndUpdate(req.session.user._id, req.body,{
            new:true,
            runValidators:true,
            useFindAndModify: false
        })
        res.status(200).json({
            message: "Updated user details",
            user
        })
    } catch (error) {
        res.status(400).json({
            message: "Updation failed"
        })
    }
});

// get all users details by admin
app.get("/admin/users", isLoggedIn, isAdmin, async(req,res)=>{
    try {
        const users = await User.find({});
        res.status(200).json({
            message: "All users",
            numberOfUSers: users.length,
            users
        });
    } catch (error) {
        res.status(400).json({
            messsage: "Error",
            error: err
        })
    }
});

// get a user details by admin
app.get("/admin/user/:id", isLoggedIn, isAdmin, async(req,res)=>{
    try {
        const user = await User.findById(req.params.id);
        if(!user){
            return res.status(400).json({
                message: "User not found"
            })
        }
        res.status(200).json({
            message: "Single user details",
            user
        });
    } catch (error) {
        res.status(400).json({
            messsage: "Error",
            error: err
        })
    }
});

// delete a user by admin
app.delete("/admin/user/:id", isLoggedIn, isAdmin, async(req,res)=>{{
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if(!user){
            return res.status(400).json({
                message: "User doesn't exists" 
            })
        }
        res.status(200).json({
            message: "User Deleted"
        })
        
    } catch (error) {
        res.status(400).json({
            message: "Error!!",
            error: err
        })
    }
}});

 
app.listen(PORT, (req,res)=>{
    console.log(`Listening in PORT ${PORT}`);
})
