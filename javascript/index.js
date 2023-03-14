const axios = require("axios")
let fs = require("fs")
const Queue = require("./queue")

// assigning json contents to variable
let graphData = fs.readFileSync("./data/graph.json")
let graph = JSON.parse(graphData)

let nums = 500
let visited = new Set()
let running = 0
let useWebWorkers = false;

// document.getElementById("search-button").onclick = () => {
let searchButtonClick = async (start, end) => {
    // let start = document.getElementById("startNode").value
    // let end = document.getElementById("endNode").value

    // srk -> University of San Francisco 4 steps
    // srk -> doordarshan [with slice] 3 steps
    // srk -> tom cruise [without slice] 2 steps

    // refine start, end and get corresponding Wiki page title 

    const start_page_title = getTitleForSearchText(start)

    const end_page_title = getTitleForSearchText(end)

    console.log("from " + await start_page_title + " to " + await end_page_title)

    // let start_connection_titles = await fetchPageConnectionTitles(start_page_title)
    // console.log(start_connection_titles)

    nums = 20
    visited = new Set()
    running = 0
    useWebWorkers = false

    let message = await searchByBfs(await start_page_title, await end_page_title)
    return message
    // searchByBfs(end_page_title, end_page_title)
}

let getTitleForSearchText = async (search_text) => {
    let wiki_page_url;
    let wiki_page_title;
    // fetch(
    //     "https://en.wikipedia.org/w/api.php?action=opensearch&origin=*&search=" + search_text, {
    //         method : "GET",
    // })
    // .then(response => response.json())
    // .then(data => {
    //     wiki_page_url = data[3][0]
    //     console.log(wiki_page_url)
    //     let page_title = extractTitleFromURL(wiki_page_url)
    //     console.log(page_title)
    //     return page_title
    // })
    // .catch(error => console.log('Fetch failed : ' + error.message));

    await axios.get("https://en.wikipedia.org/w/api.php?action=opensearch&origin=*&search=" + search_text)
    .then(async response => {
        // console.log(response.data)
        wiki_page_url = response.data[3][0]
        let page_title = extractTitleFromURL(wiki_page_url)
        // get wiki page title redirect one
        console.log(page_title)
        wiki_page_title = await getWikiTitleFromSearchTitle(page_title)
    })

    return wiki_page_title

    // let xhr = new XMLHttpRequest();
    // xhr.open("GET", "https://en.wikipedia.org/w/api.php?action=opensearch&origin=*&search=" + search_text, false);
    // try {
    //     xhr.send();
    //     if (xhr.status != 200) {
    //         console.log(`Error ${xhr.status}: ${xhr.statusText}`);
    //     } else {
    //         data = JSON.parse(xhr.response);
    //         wiki_page_url = data[3][0]
    //         let page_title = extractTitleFromURL(wiki_page_url)
    //         // get wiki page title redirect one
    //         let wiki_page_title = getWikiTitleFromSearchTitle(page_title)
    //         return wiki_page_title
    //     }
    // } catch(err) { // instead of onerror
    //     console.log("Request failed", err);
    // }
}

let fetchPageConnectionTitles = async (page_title) => {
    let node_source  = await getSourceFromTitle(page_title)
    // let node_source = node_source_response.then(response => response)
    let connection_titles = extractConnectionTitlesfromSource(node_source)

    // console.log("these are my" + connection_titles)

    return connection_titles;
}

let getWikiTitleFromSearchTitle = async (search_page_title) => {
    let wiki_title;
    // let response = await fetch(
    //     "https://en.wikipedia.org/w/rest.php/v1/page/" + page_title, {
    //         method: "GET",
    // })
    // let data = await response.json()

    await axios.get("https://en.wikipedia.org/w/rest.php/v1/page/" + search_page_title)
    .then(async response => {
        // console.log(response.data)
        if (response.data.redirect_target == undefined) {
            // console.log(data.title)
            wiki_title = response.data.title
        } else {
            wiki_title = await getWikiTitleFromSearchTitle(extractTitleFromURL(response.data.redirect_target))
        }
    })
    return wiki_title

    // let xhr = new XMLHttpRequest();
    // xhr.open("GET", "https://en.wikipedia.org/w/rest.php/v1/page/" + search_page_title, false);
    // try {
    //     xhr.send();
    //     if (xhr.status != 200) {
    //         console.log(`Error ${xhr.status}: ${xhr.statusText}`);
    //     } else {
    //         data = JSON.parse(xhr.response);
    //     }
    // } catch(err) { // instead of onerror
    //     console.log("Request failed", err);
    // }
    
    // if (data.redirect_target == undefined) {
    //     // console.log(data.title)
    //     wiki_title = data.title
    // } else {
    //     wiki_title = getWikiTitleFromSearchTitle(extractTitleFromURL(data.redirect_target))
    // }

    // return wiki_title;
}

let getSourceFromTitle = async (page_title) => {
    let source;
    // let response = await fetch(
    //     "https://en.wikipedia.org/w/rest.php/v1/page/" + page_title, {
    //         method: "GET",
    // })
    // let data = await response.json()
    let data;
    const ampersandRegex = /&/g
    page_title = await page_title.replace(ampersandRegex, '%26');

    await axios.get("https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&origin=*&titles=" + page_title)
    .then(async response => {
        if (response.data.redirect_target == undefined) {
            // console.log(data.title)
            // source = data.source
            // console.log(data.title)
            try {
                let page = response.data.query.pages
                let pageId = Object.keys(page)[0]
                console.log(page[pageId].title)
                source = page[pageId].revisions[0]['*']
            } catch (error) {
                console.log("ERROR: " + error)
            }
            
        } else {
            source = await getSourceFromTitle(extractTitleFromURL(response.data.redirect_target))
        }
    })
    return source;

    // let xhr = new XMLHttpRequest();
    // // xhr.open("GET", "https://en.wikipedia.org/w/rest.php/v1/page/" + page_title, false);
    // xhr.open("GET", "https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&origin=*&titles=" + page_title, false);
    // try {
    //     xhr.send();
    //     if (xhr.status != 200) {
    //         console.log(`Error ${xhr.status}: ${xhr.statusText}`);
    //     } else {
    //         data = JSON.parse(xhr.response);
    //     }
    // } catch(err) { // instead of onerror
    //     console.log("Request failed", err);
    // }
    
    // if (data.redirect_target == undefined) {
    //     // console.log(data.title)
    //     // source = data.source
    //     // console.log(data.title)
    //     let page = data.query.pages
    //     let pageId = Object.keys(page)[0]
    //     console.log(page[pageId].title)
    //     source = page[pageId].revisions[0]['*']
    // } else {
    //     source = getSourceFromTitle(extractTitleFromURL(data.redirect_target))
    // }

    // return source;
}

let extractConnectionTitlesfromSource = (node_source) => {
    // console.log(node_source)
    // const regex = /\[\[(.*?)\]\]/g;
    // const regex = /\[\[(.*?)\|.*?\]\]|\[\[(.*?)\]\]/g
    // const regex = /\[\[(?!Category:)([^[\]]+)\]\]/g
    const regex = /\[\[(?!File:)(?!Category)([^[\]]+)\]\]/g

    // finding matches in the string for the given regular expression
    let results = [];
    try {
        results = node_source.matchAll(regex);
    } catch (error) {
        console.log("ERROR: " + error)
    }

    let connection_titles = new Set()

    for (const result of results) {
        // console.log(result)
        const title_text = result[1].split("|")[0] // || result[2];

        // const ampersandRegex = /&/g
        // title_text = title_text.replace(ampersandRegex, '%26');
        // const title = getTitleForSearchText(title_text)
        connection_titles.add(title_text)
        
    }

    // TODO: multithreading??
    // slicing for exploring more than 2 path nodes 
    return [...connection_titles]//.slice(0, 5); 
}

let extractTitleFromURL = url => {
    let page_split = url.split("/")
    let title = page_split[page_split.length - 1]
    return title
}

let searchByBfs = async (start_node_title, end_node_title) => {
    let message = "";
    let end_node_found = false
    let q = new Queue() // enqueue(), dequeue(), peek(), length, isEmpty  
    q.enqueue([start_node_title])
    visited.add(start_node_title)

    while (nums>0 && !q.isEmpty && !end_node_found) {
        // console.log(nums)
        // getting path
        let path = q.dequeue()

        // last title
        let newTitle = path[path.length - 1]

        // console.log(useWebWorkers)
        if (useWebWorkers===false) {
            let newTitleConnections;
            if (graph[newTitle] == undefined) {
                console.log("went api for " + newTitle)
                newTitleConnections = await fetchPageConnectionTitles(newTitle)
                graph[newTitle] = newTitleConnections;
                setGraphData(graph)
                nums--
            } else {
                console.log("went graph for " + newTitle)
                newTitleConnections = graph[newTitle]
            }
            newTitleConnections.forEach(title => {
                if (visited.has(title)) return false;
                visited.add(title)
                tempPath = path.slice()
                if (title == end_node_title) {
                    console.log(title + " FOUND!!!!!!!!!!")
                    tempPath.push(title)
                    end_node_found = true
                    message = "Path from " + start_node_title + " to " + title + " FOUND with " + tempPath.length + " degrees. It is " + convertArrayToString(tempPath)
                    console.log(message)
                    // document.getElementById("foundText").innerText = title + " FOUND. Here is the path -> " + tempPath
                    return false
                }

                tempPath.push(title)
                q.enqueue(tempPath)
                
                return true
            });
        } else {
            running++;
            // console.log("worker " + running)
            const worker = new Worker("./worker.js")
            worker.postMessage(newTitle)
            worker.onmessage = newTitleConnections => {
                running--;
                newTitleConnections.data.forEach(title => {
                    if (visited.has(title)) return false;
                    visited.add(title)
                    tempPath = path.slice()
                    if (title == end_node_title) {
                        console.log(title + " FOUND!!!!!!!!!!")
                        tempPath.push(title)
                        end_node_found = true
                        document.getElementById("foundText").innerText = title + " FOUND. Here is the path -> " + tempPath
                        return false
                    }
        
                    tempPath.push(title)
                    q.enqueue(tempPath)
                    
                    return true
                });
                if (running===0) console.log("all workers complete")
            }
        }
        // nums--;
    }
    if (nums==0) message = "Path from " + start_node_title + " to " + end_node_title + " NOT FOUND with the current resources. Please attempt the search once more, as it will increase the likelihood of success. I need to scale the processing power to handle increased workload."
    return message;
}

let setGraphData = graph => {
    let graphData = JSON.stringify(graph)
    fs.writeFile("./data/graph.json", graphData, err => {
        console.log("file write complete")
    })
}

let convertArrayToString = path => {
    let pathString = "" + path[0]
    for (let i = 1; i < path.length; i++) {
        const stop = path[i];
        pathString += " -> " + stop
    }
    pathString += ""
    return pathString
}

module.exports = searchButtonClick;
