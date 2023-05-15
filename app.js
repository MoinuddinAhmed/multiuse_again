// require("dotenv").config();
const express = require("express");
const hbs = require("hbs");
const path = require("path");
require("./src/db/conn");
const Register = require("./src/models/userregister");
const bodyparser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const MongoDBSession = require('connect-mongodb-session')(session);
const bcrypt = require("bcryptjs");
var flash = require("connect-flash");


const app = express();




app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use(express.static(path.join(__dirname, "../public")));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../appfactory-multiuse/src/templates"));

const store = new MongoDBSession({
    uri: 'mongodb+srv://mahmed03:56768712@cluster0.zrso8by.mongodb.net/UserDB?retryWrites=true&w=majority',
    collection: 'mySessions'
});
app.use(session({
    secret: 'key that we will use to sign the cookie',
    resave: false,
    saveUninitialized: false,
    store: store,



}));
app.use(flash());

var invalid_email = "Invalid Email";
var invalid_password = "Invalid Password";
var register_invalid_password = "(Password must be 8 characters long and can contain special characters and numbers)";
var invalid_fname = "First name contains special characters or numbers";
var invalid_lname = "Last name contains special characters or numbers";
var register_success = "Registered Successfully!";


const isAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next();
    } else {
        res.redirect("/");
    }
};

app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", async (req, res) => {
    const { fname, lname, email, password1 } = req.body;
    var admin = "0";
    const hasedPswd = await bcrypt.hash(password1, 10);
    const newUser = new Register({
        fname,
        lname,
        email,
        password: hasedPswd,
        markasadmin: admin,
    });

    if (newUser.fname.match(/^[a-zA-Z]+$/)) {
        if (newUser.lname.match(/^[a-zA-Z]+$/)) {
            if (newUser.email.match(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+.[a-zA-Z]+$/)) {
                // password can contains special characters and numbers:
                Register.findOne({ email: newUser.email }, (err, user) => {
                    if (user) {
                        res.render("register", { invalid_email: "Email already Exists" });
                    } else {
                        if (password1.match(/^[a-zA-Z0-9!@#$%^&*]+$/)) {
                            newUser.save().then(() => {
                                res.render("login", { register_success: register_success });
                            }).catch((err) => {
                                res.status(400).send(err);
                            });
                        } else {
                            res.render("register", { register_invalid_password: register_invalid_password });
                        }
                    }

                });
            } else {
                res.render("register", { invalid_email: register_invalid_email });
            }
        } else {
            res.render("register", { invalid_lname: invalid_lname });
        }
    } else {
        res.render("register", { invalid_fname: invalid_fname });
    }
});



var cur_email = "";
app.get("/verifyemail", (req, res) => {
    res.render("verfyemail");
});
app.post("/verifyemail", (req, res) => {
    const { email } = req.body;
    Register.findOne({ email: email }, (err, user) => {
        if (user) {
            cur_email = email;
            req.session.isAuth = true;
            res.redirect("/resetpassword");
        } else {
            res.render("verfyemail", { invalid_email: invalid_email });
        }

    });
});

app.get("/resetpassword", isAuth,(req, res) => {
    res.render("resetpassword", { email: cur_email });
});
app.post("/resetpassword", isAuth,async(req, res) => {
    // req.session.isAuth = true;
    const {email,password, confirm_password } = req.body;
    if (password === confirm_password) {
        hasedPsd = await bcrypt.hash(password, 12);
        Register.updateOne({ email: email }, { password: hasedPsd }, (err, user) => {

            if (user) {
                req.session.context ='Password Changed Successfully!' ;
                res.redirect("/");
                req.session.destroy();
            }
        });
    } else {
        res.render("resetpassword", { invalid_password: "Password Does not match" });
    }
});

app.get("/", (req, res) => {
    var context = req.session.context;
    res.render("login", { register_success: context });
    // req.session.destroy();
});

app.post("/", (req, res) => {
    const { email, password } = req.body;

    Register.findOne({ email: email }, async(err, user) => {
        if (user) {
            if (await bcrypt.compare(password, user.password)) {
                req.session.isAuth = true;
                if (user.marksasadmin === "1") {
                    res.redirect("/adminhome");
                }
                else {
                    res.redirect("/home");
                }
            } else {
                res.render("login", { invalid_password: "Invalid Credentials!" });
                // res.send("invalid password");
            }
        } else {
            res.render("login", { invalid_email: "Invalid Credentials!" });
        }

    });

});
app.get("/home", isAuth, (req, res) => {
    res.render("home");
});

app.get("/adminhome",isAuth, (req, res) => {
    res.render("adminhome");
});


app.get("/logout",isAuth, (req, res) => {
    res.redirect("/");
    req.session.destroy();
});

// app.get("/forgotpassword", (req, res) => {
//     res.render("forgotpassword");
// });

// app.post("/forgotpassword", (req, res) => {
//     const { email, password, confirmpassword } = req.body;

//     Register.findOne({ email: email }, (err, user) => {
//         if (user) {
//             if (password === confirmpassword) {
//                 const hasedPswd = bcrypt.hash(password, 10);
//                 Register.updateOne({ email: email }, { $set: { password: hasedPswd } }, (err, user) => {
//                     if (err) {
//                         res.send(err);
//                     } else {
//                         res.render("login", { register_success: "Password Changed Successfully" });
//                     }
//                 });

//             } else {
//                 res.render("forgotpassword", { invalid_password: "Password and Confirm Password does not match" });
//             }
//         } else {
//             res.render("forgotpassword", { invalid_email: "Email not found" });
//         }
//     });

// });
app.listen(4002, () => console.log("listening on port 4002"));

