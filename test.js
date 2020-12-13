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
let currentLabID = null;
//
driver.get("/TestCollection",(req,res)=>{
    writeTestCollection(req, res);
    // res.sendFile(__dirname + '/TestCollection.html')
});
driver.get("/WellTesting",(req,res)=>{
    writeWellTesting(req, res);
});
driver.get("/PoolMapping",(req,res)=>{
    writePoolMapping(req, res);
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
            currentLabID = body.username;
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

driver.post("/modifyPools", (req, res) => {
    modifyPools(req, res);
});

driver.post("/addTest", (req, res) => {
    addEmployeeTest(req, res);
});

driver.post("/deleteTest", (req, res) => {
    deleteEmployeeTest(req, res);
});

driver.post("/", (req, res) => {

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

function modifyPools(req, res) {
    let body = req.body;
    console.log(body);
    switch(body.submitOptions) {
        case "add":
            insertInto_pool(body.poolBarcode);
            insertInto_poolMapping(body);
            break;
        case "edit":
            updateInto_poolMapping(body);
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
    res.redirect('/PoolMapping');
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

function writeTestCollection(req, res) {
    res.writeHead(200, { "Content-Type": "text/html" });
    var html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
            table {
                border: 1px solid black;
            }
        </style>
    </head>
    <body>
        <div>
            <form id="addTestForm" action="/addTest" method="POST">
                <label for="employeeID" >Employee ID</label> 
                <input name="employeeID" id="employeeID" > <br>
                <label for="testBarcode">Test Barcode</label> 
                <input name="testBarcode" id="testBarcode"> <br>
                <input type="submit" value="Add">
            </form>
        </div>
    
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Select</th>
                        <th>Employee ID</th>
                        <th>Test BarCode</th>
                    </tr>
                </thead>
                <tbody id="result">`;
    con.query("SELECT * FROM employeetest;", (err, results) => {
        if (err){
            console.log("\nEmployeeTest query ERROR\n");
            throw err;
        }
        console.log("\nThere are " + results.length + " employeetest in DB.\n");
        let index = 0;
        for (let test of results) {
            html += `
            <tr>
                <td><input type="checkbox" id="test${index}"  class="testCheck"></td>
                <td>${test.employeeID}</td>
                <td>${test.testBarcode}</td>
                <input type="hidden" id="testBarcodeSelect${index}" name="testBarcodeSelect${index}" value="${test.testBarcode}">
            </tr>
                `;
            index++;
        }
        res.write(html + `
        </tbody>
        </table>
        <input type="button" value="Delete" onclick="deleteTests()">
        <form id="deleteTestForm" action="/deleteTest" method="POST">
        </form>
    </div>
    
</body>
<script>
    function deleteTests() {
        let selectedTests = document.getElementsByClassName("testCheck");
        let form = document.getElementById("deleteTestForm");
        if (selectedTests.length == 0)
            return;

        for(let i = 0; i < selectedTests.length; i++) {
            let selectedInput = selectedTests[i].parentNode.nextElementSibling.nextElementSibling.nextElementSibling;
            form.appendChild(selectedInput);
        }
        form.submit();
        // let submit = document.createElement("input");
        // submit.setAttribute("type", "submit");
        // form.appendChild(submit);
        
    }
    
    
</script>
</html>
        `);
        res.end();
    });
}

function writePoolMapping(req, res) {
    res.writeHead(200, { "Content-Type": "text/html" });
    html =`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
    </head>
    <style>
        border {
            border: 1px solid black;
        }
    </style>
    <body>
        <form id="form1" action="/modifyPools"  method="POST">
            <div id="div1">
                <label for="poolBarcode" >pool barcode</label> 
                <input name="poolBarcode" id="poolBarcode"> <br>
                <label for="testBarcode">test barcode</label> 
                <ul>
                <li>
                    <input name="testBarcode0" id="testBarcode0">
                </li>
                <li>
                    <input name="testBarcode1" id="testBarcode1">
                </li>
                <li>
                    <input name="testBarcode2" id="testBarcode2">
                </li>
                <li>
                    <input name="testBarcode3" id="testBarcode3">
                </li>
                <li>
                    <input name="testBarcode4" id="testBarcode4">
                </li>
            </ul>
        </div>
        <select name="submitOptions" id="pollmapingOptions">
            <option value="add">Add</option>
            <option value="edit">Edit</option>
            <option value="delete">Delete</option>
        </select>
        <input type="submit" value="Submit">
    </form>
    
    <table id="Result">
        <thead>
            <tr>
                <th>Select</th>
                <th>pool BarCode</th>
                <th>test barcode</th>             
            </tr>
        </thead>
        <tbody id="resultBody">`;
    con.query("SELECT DISTINCT poolbarcode FROM poolmap;", (err, poolResults) => {
        if (err) {
            console.log("Pool Mapping Loading DB find poolbarcode Error");
            throw err;
        }
        Object.keys(poolResults).forEach(function(key) {
            let poolbarcode = poolResults[key].poolbarcode;
            console.log("\n" + poolbarcode +"\n");
            html += `
            <tr class="pool">
                <td><input type="checkbox"></td>
                <td>${poolbarcode}</td>
                <td>
            `;
            con.query(`SELECT testbarcode FROM poolmap
                WHERE poolbarcode = '${poolbarcode}';`, (err, testResults) => {
                if (err) {
                    console.log("Pool Mapping Loading DB find testbarcode Error");
                    throw err;
                }
                Object.keys(testResults).forEach(function(key) {
                    let testbarcode = testResults[key].testbarcode;
                    console.log("\n" + testbarcode);
                    html += `${testbarcode}, `;
                });
                html = html.substring(0, html.length-2);
                html += `</td>
                </tr>`;
            });
        });
            
        res.write(html + `</tbody>
        </table>
        <button onclick="selectTest()">Select</button>
    
    </body>
    
    <script>
        function selectTest() {
            var pools = document.getElementsByClassName("pool");
            var selectedPool = null;
            for (let i = 0; i < pools.length; i++) {
                if (pools[i].firstElementChild.firstElementChild.checked == true) {
                    selectedPool = pools[i];
                    break;
                }
            }
            if (selectedPool != null) {
                var poolBarcode = selectedPool.children[1].innerHTML;
                var testBarcode = selectedPool.children[2].innerHTML;
                var testBarcodes = testBarcode.split(", ");
    
                for(let i = 0; i < testBarcodes.length && i < 5; i++) {
                    let testBarcodeInput = document.getElementById("testBarcode" + i);
                    testBarcodeInput.value = testBarcodes[i];
                }
                poolBarcodeElement = document.getElementById("poolBarcode");
                poolBarcodeElement.value = poolBarcode;
            }
        }
    </script>
    </html>`);
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

function insertInto_poolMapping(body) {
    for (let i = 0; i < 5; i++) {
        let newTestBarcode = body["testBarcode" + i];
        if (newTestBarcode == null || newTestBarcode == "")
            break;
        con.query(`SELECT testbarcode FROM employeetest WHERE testbarcode = '${newTestBarcode}';`, (err, results) => {
            if (err) {
                console.log("\nError founding testbarcode "+ newTestBarcode)
            }
            if (results.length == 0) {
                console.log("\nNot Found TestBarcode " + newTestBarcode);
                return;
            }
            
            con.query(`INSERT INTO poolmap(testbarcode, poolbarcode) VALUES(${newTestBarcode},${body.poolBarcode});`, (err, insertResults) => {
                if (err) {
                    console.log("\nError Inserting Poolmap");
                    throw err;
                }

            });
        });
    }

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

function updateInto_poolMapping(body) {
    
}

function addEmployeeTest(req, res) {
    var body = req.body;
    console.log(body);
    con.query(`SELECT * FROM employeetest
        WHERE testbarcode = '${body.testBarcode}';`, 
        (err, results) => {
        console.log("\nSearch is employeetest existed in DB.\n");
        if (err) {
            console.log("\nAdding Test Error\n");
            throw err;
        }
        if (results.length == 0) {
            console.log("\nAdding a new test into DB.\n");
            con.query(`INSERT INTO employeetest(testbarcode, employeeid, collectiontime, collectedby)
                VALUES ('${body.testBarcode}', '${body.employeeID}', NULL, '${currentLabID}');`, 
                (err, results) => {

                if (err) {
                    console.log("\nAdding Test Error\n");
                    throw err;
                }
            });
        }
    });
    res.redirect('/TestCollection');
}

function deleteEmployeeTest(req, res) {
    var body = req.body;
    console.log(body);

    for (var key in body) {
        let testBarcode = body[key];
        con.query(`DELETE FROM employeetest
                WHERE testbarcode = '${testBarcode}';`, 
                (err, results) => {
                if (err) {
                    console.log("\nDeleting Test Error\n");
                    throw err;
                }
        });
    }
    
    res.redirect('/TestCollection');
}
  
