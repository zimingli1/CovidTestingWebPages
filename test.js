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
    writeWellTesting(req, res);
    //res.sendFile(__dirname + '/WellTesting.html')
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

driver.post("/modifyWells", (req, res) => {
    modifyWells(req, res);
});

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

function modifyWells(req, res){

    let body = req.body;
    console.log(body);

    switch(body.submitOptions) {
        case "add":
            insertInto_well(body.wellBarcode);
            insertInto_pool(body.poolBarcode);
            insertInto_welltesting(body);
            break;
        case "edit":
            insertInto_well(body.wellBarcode);
            insertInto_pool(body.poolBarcode);
            updateInto_welltesting(body, 10);
            break;
        case "delete":
            con.query(`DELETE FROM welltesting
                WHERE poolbarcode = '${body.originalPoolBarcode}' AND wellbarcode = '${body.originalWellBarcode}';`, 
                (err, results) => {
                if (err) {
                    console.log("\nDeleting Well Error\n");
                    throw err;
                }
            });
            break;
    }
    res.redirect('/WellTesting');
}

function writeWellTesting(req, res) {
    res.writeHead(200, { "Content-Type": "text/html" });
    
    var html =`
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        border {
            border: 1px solid black;
        }
    </style>
    <script>
function clickSelect() {
    var wells = document.getElementsByClassName("well");
    var selectedWell = null;
    for (let i = 0; i < wells.length; i++) {
        if (wells[i].firstElementChild.firstElementChild.checked == true) {
            selectedWell = wells[i];
            break;
        }
    }
    if (selectedWell != null) {
        var wellBarcode = selectedWell.children[1].innerHTML;
        var poolBarcode = selectedWell.children[2].innerHTML;
        var status = selectedWell.children[3].innerHTML;
        wellBarcodeElement = document.getElementById("wellBarcode");
        wellBarcodeElement.value = wellBarcode;
        poolBarcodeElement = document.getElementById("poolBarcode");
        poolBarcodeElement.value = poolBarcode;
        document.getElementById("originalWellBarcode").value = wellBarcode;
        document.getElementById("originalPoolBarcode").value = poolBarcode;
        document.getElementById("result").value = status;
    }
}
</script>
</head>
<body>
    <div>
        <form id="form1" action="/modifyWells" method="POST">
            <label for="wellBarcode" >well barcode</label> 
            <input type="hidden" id="originalWellBarcode" name="originalWellBarcode" value="null">
            <input name="wellBarcode" id="wellBarcode"> <br>
            <label for="poolBarcode">pool barcode</label>  
            <input type="hidden" id="originalPoolBarcode" name="originalPoolBarcode" value="null">
            <input name="poolBarcode" id="poolBarcode"> <br>
            <label for="result">result</label> 
            <select name="result" id="result" >
                <option value="in process">in process</option>
                <option value="negative">negative</option>
                <option value="positive">positive</option>
            </select>
            <div>
                <select name="submitOptions" id="wellTestOptions">
                    <option value="add">Add</option>
                    <option value="edit">Edit</option>
                    <option value="delete">Delete</option>
                </select>
                <input type="submit" value="Submit" onclick="window.location.href='/WellTesting'">
            </div>
            
        </form>
    </div>
    <table id="Result">
        <thead>
            <tr>
                <th>Select</th>
                <th>well barcode</th>
                <th>pool BarCode</th>
                <th>result</th>
            </tr>
        </thead>
        <tbody id="resultBody">`;

    con.query("SELECT * FROM welltesting;", (err, results) => {
        if (err){
            console.log("\nwelltesting query ERROR\n");
            throw err;
        }
        console.log("\nThere are " + results.length + " welltestings in DB.\n");
        for (let welltesting of results) {
            html +=`
            <tr class="well">
                <td><input type="checkbox"></td>
                <td>${welltesting.wellbarcode}</td>
                <td>${welltesting.poolbarcode}</td>
                <td>${welltesting.result}</td>
            </tr>
            `;
        }
        res.write(html+
            `</tbody>
            </table>
            <input type="button" value="Select" onclick="clickSelect()">
            </body>
            </html>
        `);
        res.end();
    });
    
}

function insertInto_well(wellbarcode) {
    con.query(`SELECT * FROM well
        WHERE wellbarcode = '${wellbarcode}';`, 
        (err, results) => {
        console.log("\nSearch is well existed in DB.\n");
        if (err) {
            console.log("\nAdding Well Error\n");
            throw err;
        }
        if (results.length == 0) {
            console.log("\nAdding a new pool into DB.\n");
            con.query(`INSERT INTO well(wellbarcode)
                VALUES ('${wellbarcode}');`, 
                (err, results) => {

                if (err) {
                    console.log("\nAdding Well Error\n");
                    throw err;
                }
            });
        }
    });
}

function insertInto_pool(poolbarcode) {
    con.query(`SELECT * FROM pool
        WHERE poolbarcode = '${poolbarcode}';`, 
        (err, results) => {
        console.log("\nSearch is pool existed in DB.\n");
        if (err) {
            console.log("\nAdding Pool Error\n");
            throw err;
        }
        if (results.length == 0) {
            console.log("\nNot Found. Adding new pool into DB.\n")
            con.query(`INSERT INTO pool(poolbarcode)
                VALUES ('${poolbarcode}');`, 
                (err, results) => {

                if (err) {
                    console.log("\nAdding Pool Error\n");
                    throw err;
                }
            });
        }
    });
}

function insertInto_welltesting(body) {
    con.query(`SELECT * FROM welltesting
        WHERE poolbarcode = '${body.poolBarcode}' AND wellbarcode = '${body.wellBarcode}' AND result = '${body.result}';`, 
        (err, results) => {
            console.log("\nSearch is WellTesting existed in DB.\n");
            if (err) {
                console.log("\nAdding WellTesting Error.\n");
                throw err;
            }
            if (results.length == 0) {
                console.log("\nNot Found. Adding new WellTesting into DB.\n");
                con.query(`INSERT INTO welltesting(poolbarcode, wellbarcode, testingstarttime, testingendtime, result) 
                    VALUES ('${body.poolBarcode}', '${body.wellBarcode}', NULL, NULL, '${body.result}');`, 
                    (err, results) => {

                    if (err) {
                        console.log("\nAdding WellTesting Error\n");
                        throw err;
                    }
                });
            }
    });
}

function updateInto_welltesting(body, times) {
    if (times == 0)
        return;
    con.query(`UPDATE welltesting
        SET poolbarcode = '${body.poolBarcode}', wellbarcode = '${body.wellBarcode}', result = '${body.result}'
        WHERE poolbarcode = '${body.originalPoolBarcode}' AND wellbarcode = '${body.originalWellBarcode}';`, 
        (err, results) => {

        if (err) {
            console.log("\nUpdating WellTesting Error\n");
            updateInto_welltesting(body, times-1);
        }
    });
}
  
