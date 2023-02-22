// isLoggedIn middleware
exports.isLoggedIn = (req,res,next) =>{
    if(!req.session.user){
        return res.status(400).json({
            message: "You must be logged in"
        })
    }
    next();
}
// isAdmin middleware
exports.isAdmin = (req,res,next) =>{
    if(req.session.user.role !== "admin"){
        return res.status(400).json({
            message: "You are not an admin (Access Denied)"
        })
    }
    next();
}