const express = require('express');
const app = express();              //Instantiate an express app
const port = 5000;

//Idiomatic expression in express to route and respond to a client request
app.get('/', (req, res) => {        //get requests to the root ("/") will route here
    res.sendFile('index.html', {root: __dirname});      //server responds by sending the index.html file to the client's browser
                                                        //the .sendFile method needs the absolute path to the file, see: https://expressjs.com/en/4x/api.html#res.sendFile 
});

app.get('/download/csv', function(req, res){
    const file = `${__dirname}/../locations.csv`;
    res.download(file);
  });
  
  app.get('/download/json', function(req, res){
    const file = `${__dirname}/../locations.json`;
    res.download(file);
  });


app.listen(port, () => {
    console.log(`Now listening on port ${port}`); 
});
