const express = require('express')
const path =require('path');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const router = express.Router();
const bodyParser = require('body-parser'); 

const bcrypt = require('bcryptjs');
const session = require('express-session');
const multer = require('multer')

const app=express();
app.use(express.json()); 
app.use(router);

//Keep the picture
const storage = multer.diskStorage({
    destination: (req,file,cb)=>{//Where pic got kept
        cb(null, 'public/uploads/');
    },
    filename:(req,file,cb)=>{//Upload picture this func will change its name into date+.jpg for example
        cb(null, `${Date.now()}-${file.originalname}`);
    }
})
const upload = multer({ 
    storage, 
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }
});
// Configure environment variables
dotenv.config();
//Set ejs as template engine
app.set('view engine','ejs');


//middleware
router.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
//Static file
app.use(express.static(path.join(__dirname,'public')))
// Session configuration
router.use(session({
    secret: process.env.SESSION_SECRET || 'nodesecret',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));


// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        message: 'Something went wrong', 
        error: process.env.NODE_ENV === 'production' ? {} : err 
    });
});

//Middleware to check if the user is login
function isAuthencicated(req,res,next){
    if(req.session.user){
        return next();
    }else{
        res.redirect('/login')
    }
}

function ifLoggedin(req,res,next){
    if(req.session.user){
        return res.redirect("/")
    }
    next();
}
// Role-based
const authPage = (permission) => {
    return (req, res, next) => {
        const userRole = req.session.user;
        if (userRole && permission.includes(userRole.role)) {
            next();
        } else {
            return res.status(401).json("No permission to access here");
        }
    };
};

//Create Sql connection

var dbcon = mysql.createConnection({
    host: process.env.DB_host,
    user:process.env.DB_user,
    password:process.env.DB_pass,
    database:process.env.DB_name
})

//Connect Databases
dbcon.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
    console.log(`Connected DB: ${process.env.DB_name}`);
});

// Routes
router.get("/", (req, res) => {
    const sql = "SELECT * FROM User";
    dbcon.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.render('home', { user: req.session.user });
    });
});

router.get("/team", (req, res) => {
    const sql = "SELECT * FROM User";
    dbcon.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.render('team', { user: req.session.user });
    });
});



router.get("/login", ifLoggedin, (req, res) => {
    const sql = "SELECT * FROM Car";
    dbcon.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.render('login', { car: results, user: req.session.user });
    });
});
router.get("/register", ifLoggedin, (req, res) => {
    res.render('register');
});

router.get("/search", (req, res) => {
    const sql = "SELECT * FROM Car";
    dbcon.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.render('search', {
            title: 'search',
            car: results,
            user: req.session.user 
        });
    });
});


router.get('/detail/:id', isAuthencicated, (req, res) => {
    const sql = "SELECT * FROM Car WHERE carid = ?";
    dbcon.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.render('detail', { car: result[0] });
    });
});

router.get("/productManagement", isAuthencicated, (req, res) => {
    const sql = "SELECT * FROM Car";
    dbcon.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.render('productManagement', { car: results });
    });
});
//Admin user only

router.get("/productManagementHistory", (req, res) => {
    const sql = "SELECT * FROM Car";
    dbcon.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.render('productManagementHistory', { car: results });
    });
});


router.get("/productManagementAddproduct", isAuthencicated, (req, res) => {
    res.render('productManagementAddproduct');
});

router.get("/UserManagementAdduser", isAuthencicated, (req, res) => {
    res.render('UserManagementAdduser');
});

router.get("/UserManagementOverview", authPage(["admin"]), (req, res) => {
    const sql = "SELECT * FROM User";
    dbcon.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.render('UserManagementOverview', { user: results });
    });
});


// router.get("/form-search", (req, res) => { 
//     console.log("Query params:", req.query);
//     const model = req.query.search;  
//     if (!model) {
//         return res.redirect('/search')
//     }
//     console.log(`Finding car with model: ${model}`);
    
//     const sql = `SELECT * FROM Car WHERE model = ?`;
//     dbcon.query(sql, [model], (error, results) => {
//         if (error) {
//             console.error("Database error:", error);
//             return res.status(500).send("Error querying the database");
//         }

//         console.log(`${results.length} row(s) returned`);

//         if (results.length === 0) {
//             console.log("Car not found");
//             return res.status(404).send("Car not found");
//         } else {
//             console.log(`Found car: ${results[0].Model}`);  
//         }
//         res.render('search',{
//             car: results
//         })
//     });
// });

router.get("/form-search", (req, res) => {
    console.log("Query params:", req.query);
    const model = req.query.search;  
    if (!model) {
        return res.redirect('/search');
    }
    
    const sql = `SELECT * FROM Car WHERE model = ?`;
    dbcon.query(sql, [model], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error querying the database");
        }

        res.render('search', { car: results });
    });
});



//POST Routes
router.post('/form-register', (req, res) => {
    const { fname, lname, email, username, password } = req.body;

    const checkEmailQuery = `SELECT * FROM User WHERE Email=?`;
    dbcon.query(checkEmailQuery, [email], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }

        if (results.length > 0) {
            return res.render('register', { error_msg: "Email already registered. Please use a different Email" });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const insertUserQuery = 'INSERT INTO User (fname,lname,email,username,password) VALUES(?,?,?,?,?)';
        dbcon.query(insertUserQuery, [fname, lname, email, username, hashedPassword], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Server error');
            }
            res.render('register', { success_msg: "Registration successful" });
        });
    });
});
// router.post('/form-login',(req,res)=>{ 
//   const{username,password} =req.body;

//   const sql ='SELECT * FROM user WHERE username = ?' //can't change it * also nav
//   dbcon.query(sql,[username],(err,result)=>{
//     if(err) throw err;
    
//     if(result.length>0){
//         const user = result[0];
//         if(bcrypt.compareSync(password,user.password)|| password ==user.password){//อันแรกจากregis อันสองปิดจุดdatabase
//             req.session.user = user;
//             return res.redirect('/search');
//         }else{
//             console.log("wrong")
//             res.render('login',{error_msg:'Incorrect Password'})
//         }
//     }
//      else{
//         console.log("No user")
//         res.render('login',{error_msg:'User not found'})
//     }
//   })
// });

router.post('/form-login', (req, res) => { 
    const { username, password } = req.body;
    const sql = 'SELECT * FROM User WHERE username = ?';
    dbcon.query(sql, [username], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        if (result.length > 0) {
            const user = result[0];
            if (bcrypt.compareSync(password, user.password)|| password ==user.password) {
                req.session.user = user;
                return res.redirect('/search');
            } else {
                res.render('login', { msg: 'Incorrect Password' });
            }
        } else {    
            res.render('login', { msg: 'User not found' });
        }
    });
});

router.get('/logout',(req,res)=>{
    req.session.destroy();
    res.redirect('/')
})

router.post('/create', upload.single('image'), (req, res) => {
    const { cartype, brand, model, mileage, year, description, carcondition, fuel, insurance, price } = req.body;
    const image = req.file ? req.file.filename : null;

    const sql = "INSERT INTO Car (cartype,brand,model,mileage,year,description,carcondition,fuel,insurance,price,image) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
    dbcon.query(sql, [cartype, brand, model, mileage, year, description, carcondition, fuel, insurance, price, image], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.redirect('/');
    });
});

router.get('/edit/:id', (req, res) => {
    const sql = "SELECT * FROM Car WHERE carid = ?";
    dbcon.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.render('edit', { car: result[0] });
    });
});

router.post('/edit/:id', upload.single('image'), (req, res) => {
    const { cartype, brand, model, mileage, year, description, fuel, insurance, price } = req.body;
    const image = req.file ? req.file.filename : req.body.oldImage;

    const sql = "UPDATE Car SET cartype=?, brand=?, model=?, mileage=?, year=?, description=?, fuel=?, insurance=?, price=?, image=? WHERE carid=?";
    dbcon.query(sql, [cartype, brand, model, mileage, year, description, fuel, insurance, price, image, req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.redirect('/search');
    });
});

router.get('/delete/:id', (req, res) => {
    const sql = "DELETE FROM Car WHERE carid = ?";
    dbcon.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.redirect('/search');
    });
});

router.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM Car WHERE carid = ?`;
    dbcon.query(sql, [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        if (results.affectedRows === 0) {
            return res.status(404).send({ error: "Record not found" });
        }
        res.send({ message: "Record deleted successfully" });
    });
});

//Create server
app.listen(process.env.PORT,function() {
    console.log("Server listening at Port"+process.env.PORT)
})

// module.exports =router