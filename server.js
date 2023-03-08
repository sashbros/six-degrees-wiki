const express = require("express")
const app = express();

// serve your css as static
app.use(express.static(__dirname + "/public"));

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/templates/index.html")
});

app.listen(3000, () => 
    console.log('Example app listening on port 3000!'),
);