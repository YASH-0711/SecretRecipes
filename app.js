var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var fs = require('fs');
var path = require('path');
// const jwt = require('jsonwebtoken');

require('dotenv/config');

mongoose.connect(process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true }, err => {
        console.log('DataBase Connected')
    });

    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())

    // Set EJS as templating engine 
    app.set("view engine", "ejs");
    app.use(express.static(path.join(__dirname, 'public')));

    var multer = require('multer');
 
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});


var upload = multer({ storage: storage });
var Admin = require('./model');
var User = require('./model-1');


// TO OPEN HOME PAGE

app.get("/", (req,res) => {
    res.render("Home")
});

// TO OPEN PIZZA MENU PAGE
app.get('/Menu', (req, res) => {
    Admin.find( (err, items) => {
        res.render('P_menu' , {items:items})
    });
});



// TO SHOW ADD MENU PAGE
app.get('/addMenu', (req, res) => {
    res.render("addMenu")
});
  
app.post('/addMenu', upload.single('image'), (req, res, next) => {
  
    var obj = {
        name: req.body.name,
        price: req.body.price,
        size: req.body.size,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    }
    Admin.create(obj, (err, item) => {
        console.log(obj)
        // console.log(item)
        if (err) {
            console.log(err);
        }
        else {
            item.save();
            
            res.redirect('/Menu');
        }
    });
});


// TO GET ALL THE DATA FROM DATABASE


app.get('/DataTable' , (req, res)=> {
	Admin.find(function(err,data){
		res.render('dataTable' , {title : 'User Information', records:data});

	})
});

// TO DELETE  THE DATA FROM USERDATA

app.get('/delete/:id' , (req, res) => {
    var id = req.params.id;
    var del = Admin.findByIdAndDelete(id);

    del.exec(function(err){
        if(err) throw err;
        res.redirect("/DataTable")
    });
});

// TO EDIT THE DATA from userdata

app.get('/edit/:id' , (req, res) => {
    var id = req.params.id;
    var edit = Admin.findById(id);

    edit.exec(function(err,data) {
        if(err) throw err;
        res.render("edit" , { title : "Edit" , records : data})
    });
});

app.post('/edit' , upload.single('image'), (req, res) => {
    if(req.file){
        var dataRecords ={
            
                name: req.body.name,
                price: req.body.price,
                size: req.body.size,
                img: {
                    data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
                    contentType: 'image/png'
                }      
        }

    }
    else{
        var dataRecords ={
            
            name: req.body.name,
            price: req.body.price,
            size: req.body.size,    
    }
    };
    console.log(req.body.food_id)

    var update = Admin.findByIdAndUpdate(req.body.food_id, dataRecords);

    update.exec(function(err) {
        if(err) throw err;
        res.redirect('/DataTable')
    });
});


// TO SHOW REGISTER PAGE

app.get('/register', (req, res) => {
    res.render("register")
});

app.post('/register', (req, res, next) => {
    if (  !req.body.fullname || !req.body.email ||  !req.body.phone || !req.body.password || !req.body.passwordConf){
        req.flash('error_message' , "Please enter full details.")
       
    } else {
        if (req.body.password == req.body.passwordConf){

            User.findOne({ email: req.body.email }, (err, data) =>{

                if(!data){
                    let c;
                    User.findOne({}, (err, data) =>{
                        var obj = {
                            // unique_id: c,
                            fullname: req.body.fullname,
                            email: req.body.email,
                            phone: req.body.phone,
                            password: req.body.password,
                            passwordConf: req.body.passwordCon,     
                        };
                        User.create(obj, (err, item) => {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                // item.save();
                                 res.redirect('/login');
                            }
                        });
                    })
                    
                    
                } else{
                    res.send({ "success": "Email is already registered" });
                }
                
            });
           
        } else {
            res.send({ "Success": "password is not matched" });
        }
    };

});


// TO SHOW LOGIN PAGE

app.get('/login', (req, res) => {
    res.render("login")
});

app.post('/login', (req, res, next) => {
    User.findOne({ email: req.body.email }, (err, data) => {
        if (data) {

            if (data.password == req.body.password) {
                res.redirect("/")
            } else {
                res.send({ "Success": "Email or Password is wrong" });
            }
        } else {
            res.send({ "Success": "This Email Is not regestered!" });
        }
    });
});

// TO OPEN CART PAGE 

app.get('/cart', (req, res) => {
    res.render("cart")
});

// to start the server 
var port = process.env.PORT || '5000'
app.listen(port, err => {
    if (err)
        throw err
    console.log('Server listening on port', port)
})