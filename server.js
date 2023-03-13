const express = require("express")
let fs = require("fs")
const searchButtonClick = require("./public/js/index")
const bodyParser = require('body-parser')

const app = express();
app.set('view-engine', 'ejs');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// serve your css as static
app.use(express.static(__dirname + "/public"));

let getGraphData = () => {
    // assigning json contents to variable
    let graphData = fs.readFileSync("./data/graph.json")
    let graph = JSON.parse(graphData)
    return graph
}
let graph = getGraphData()

app.get('/', (req, res) => {
    console.log("inside get request")
    // let graph = getGraphData()
    message = ""
    res.render("index.ejs", {message: message});

});

app.post('/', (req, res) => {
    console.log("inside post request")
    let startNodeText = req.body.startNode
    let endNodeText = req.body.endNode
    startNodeText = startNodeText.trim()
    endNodeText = endNodeText.trim()
    console.log(startNodeText, endNodeText)
    if (startNodeText === endNodeText) {
        message = "Really!!???!!"
        res.render("index.ejs", {message: message});
    } else {
        searchButtonClick(startNodeText, endNodeText).then(response => {
            console.log("inside post response")
            message = response
            res.render("index.ejs", {message: message});
        })
    }
})

app.listen(3000, () => 
    console.log('Example app listening on port 3000!'),
);