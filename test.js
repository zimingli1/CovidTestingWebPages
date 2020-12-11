const express = require ("express");
const driver = express();
const url = require("url");
const bodyParser = require('body-parser');
driver.use(bodyParser.urlencoded({ extended: false})) 
driver.set('view engine', 'html');
driver.use(bodyParser.json()); 
driver.get("/",(req,res)=>{
    res.sendFile(__dirname + '/Select.html')
});
//1
var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "LZMfall2020cse316",
    database: "employeecovidtestingdb"
});

//
driver.get("/TestCollection",(req,res)=>{
    res.sendFile(__dirname + '/TestCollection.html')
});
driver.get("/WellTesting",(req,res)=>{
    res.sendFile(__dirname + '/WellTesting.html')
});
driver.get("/employeeLogin",(req,res)=>{
    res.sendFile(__dirname + '/employeeLogin.html')
});
driver.get("/Labhome",(req,res)=>{
    res.sendFile(__dirname + '/Labhome.html')
});
driver.get("/facultyHome",(req,res)=>{
    res.sendFile(__dirname + '/facultyHome.html')
});
driver.post("/employeeLogin",(req,res)=>{
    console.log(req.body)
    console.log(req.body.password)
    var body=req.body
    //2
    // con.connect(function(err) {
    //     if (err) throw err;
    con.query("SELECT * FROM employee", function (err, result, fields) {
    if (err) throw err;
    if(checkexistEmail(body,result)) {
        //add the respose page here
        res.redirect('/facultyHome');
    }
    else{
        res.redirect('/err');
    }
});
    //
  
    })
driver.get("/labLogin",(req,res)=>{
    res.sendFile(__dirname + '/labLogin.html')
});
driver.post("/labLogin",(req,res)=>{
    console.log(req.body)
    console.log(req.body.password)
    console.log(req.body.username)
    var body=req.body;
    
        
    con.query("SELECT * FROM labemployee", function (err, result, fields) {
        if (err) throw err;
        if(checkexist(body,result)) {
            //add the respose page here
            res.redirect('/Labhome');
        }
        else{
            res.redirect('/err');
        }
    });
})

//set port to 1000
port = process.env.PORT || 1000
driver.listen(port,()=>{
    console.log("server started")
});
//using to check the user exist
function checkexist(body,result){
    var passwordFlag=false;
    for (let index = 0; index < result.length; index++) {
        const element = result[index];
        if(body.username == element.labID && body.password == element.password){
            passwordFlag=true;
        }
    }
    return passwordFlag;
}

function checkexistEmail(body,result){
    var passwordFlag=false;
    for (let index = 0; index < result.length; index++) {
        const element = result[index];
        if(body.email == element.email && body.password == element.passcode){
            passwordFlag=true;
            console.log(element.email)
            console.log(element.passcode)
            console.log(passwordFlag)
        }
    }
    return passwordFlag;
}
        
        

function employeeR(){
    return null;
}
