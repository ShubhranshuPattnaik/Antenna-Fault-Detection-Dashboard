const { log } = require("console");
const express = require("express");
const { load } = require("mime");
const mysql = require("mysql2");
const app = express();
const multer = require('multer');
const upload = multer();
const cors = require("cors"); 
app.use(express.json());
app.use(cors());

//sql connection
const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'nitttr1234',
    database: 'dashboard'
});

//check connection
con.connect((err)=>{
    if(err){
        console.log(err);
        console.warn("error");
    } else{
        console.warn("connected");
    }
});

//port
app.listen("8080");

//APIs
app.post('/dbstore', upload.single('image_data'), (req, res) => {
    const elements = req.body.elements.map(element => JSON.parse(element));
    const image = req.file.buffer; // 'image_data' is the field name for the uploaded file
    
    const base64Image = image.toString('base64'); // Convert the image to a Base64 string

    // Now, perform the database insertion using 'elements' for elements and 'base64Image' for the image data
    con.query("INSERT INTO dashboard.model_database (element_array, image_data) VALUES (?, ?)", [JSON.stringify(elements), base64Image], (err, result) => {
        if (err) {
            res.send("Error");
            console.log(err);
        } else {
            res.send("Success");
        }
    });
});

app.post('/getDb', (req, res) => { //fetch from db
    let time = req.body.time;

    if (!time) {
        con.query("SELECT element_array, image_data FROM model_database ORDER BY entry_timestamp DESC LIMIT 1", (err, result) => {
            if (err) {
                res.send("Error");
            } else {
                if (result.length > 0) {
                    const elementArrayString = result[0].element_array;
                    const elementArray = JSON.parse(elementArrayString);
                    const imageData = result[0].image_data; // Assuming image_data is a BLOB or similar binary data

                    // Convert the binary image data to a Base64 string if the image data is not null
                    const imageBase64 = imageData ? Buffer.from(imageData).toString('base64') : null;
                    
                    var obj = { result: elementArray, image_data: imageBase64 };
                    res.send(obj);
                } else {
                    res.send("No data found");
                }
            }
        });
    } else {
        con.query("SELECT element_array, image_data FROM model_database WHERE entry_timestamp = ?", [time], (err, result) => {
            if (err) {
                res.send("Error");
            } else {
                if (result.length > 0) {
                    const elementArrayString = result[0].element_array;
                    const elementArray = JSON.parse(elementArrayString);
                    const imageData = result[0].image_data; // Assuming image_data is a BLOB or similar binary data

                    // Convert the binary image data to a Base64 string if the image data is not null
                    const imageBase64 = imageData ? Buffer.from(imageData).toString('base64') : null;
                    
                    var obj = { result: elementArray, image_data: imageBase64 };
                    res.send(obj);
                } else {
                    res.send("No data found");
                }
            }
        });
    }
});


app.get('/getTime', (req, res) => {
    con.query("SELECT DATE_FORMAT(entry_timestamp, '%Y-%m-%d %H:%i:%s') AS formatted_timestamp FROM model_database", (err, result) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).send("Error");
      } else {
        if (result.length > 0) {
          // Extract "formatted_timestamp" property from each object and create an array
          const timestamps = result.map(item => item.formatted_timestamp);
  
          var obj = { result: timestamps };
          res.status(200).send(obj);
  
        } else {
          res.status(404).send("No data found");
        }
      }
    });
  });
  
  


