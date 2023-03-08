document.getElementById("search-button").onclick = () => {
    let start = document.getElementById("startNode").value
    let end = document.getElementById("endNode").value

    // srk -> University of San Francisco 4 steps
    // srk -> doordarshan [with slice] 3 steps
    // srk -> tom cruise [without slice] 2 steps

    // refine start, end and get corresponding Wiki page title 

    const start_page_title = getTitleForSearchText(start)

    const end_page_title = getTitleForSearchText(end)

    console.log("from " + start_page_title + " to " + end_page_title)

    // let start_connection_titles = await fetchPageConnectionTitles(start_page_title)
    // console.log(start_connection_titles)

    searchByBfs(start_page_title, end_page_title)
    // searchByBfs(end_page_title, end_page_title)
    
}

let getTitleForSearchText = (search_text) => {
    let wiki_page_url;
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

    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://en.wikipedia.org/w/api.php?action=opensearch&origin=*&search=" + search_text, false);
    try {
        xhr.send();
        if (xhr.status != 200) {
            console.log(`Error ${xhr.status}: ${xhr.statusText}`);
        } else {
            data = JSON.parse(xhr.response);
            wiki_page_url = data[3][0]
            let page_title = extractTitleFromURL(wiki_page_url)
            // get wiki page title redirect one
            let wiki_page_title = getWikiTitleFromSearchTitle(page_title)
            return wiki_page_title
        }
    } catch(err) { // instead of onerror
        console.log("Request failed", err);
    }
}

let fetchPageConnectionTitles = (page_title) => {
    let node_source  = getSourceFromTitle(page_title)
    // let node_source = node_source_response.then(response => response)
    let connection_titles = extractConnectionTitlesfromSource(node_source)

    // console.log("these are my" + connection_titles)

    return connection_titles;
}

let getWikiTitleFromSearchTitle = (search_page_title) => {
    let wiki_title;
    // let response = await fetch(
    //     "https://en.wikipedia.org/w/rest.php/v1/page/" + page_title, {
    //         method: "GET",
    // })
    // let data = await response.json()

    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://en.wikipedia.org/w/rest.php/v1/page/" + search_page_title, false);
    try {
        xhr.send();
        if (xhr.status != 200) {
            console.log(`Error ${xhr.status}: ${xhr.statusText}`);
        } else {
            data = JSON.parse(xhr.response);
        }
    } catch(err) { // instead of onerror
        console.log("Request failed", err);
    }
    
    if (data.redirect_target == undefined) {
        // console.log(data.title)
        wiki_title = data.title
    } else {
        wiki_title = getWikiTitleFromSearchTitle(extractTitleFromURL(data.redirect_target))
    }

    return wiki_title;
}

let getSourceFromTitle = (page_title) => {
    let source;
    // let response = await fetch(
    //     "https://en.wikipedia.org/w/rest.php/v1/page/" + page_title, {
    //         method: "GET",
    // })
    // let data = await response.json()

    let xhr = new XMLHttpRequest();
    xhr.open("GET", "https://en.wikipedia.org/w/rest.php/v1/page/" + page_title, false);
    try {
        xhr.send();
        if (xhr.status != 200) {
            console.log(`Error ${xhr.status}: ${xhr.statusText}`);
        } else {
            data = JSON.parse(xhr.response);
        }
    } catch(err) { // instead of onerror
        console.log("Request failed", err);
    }
    
    if (data.redirect_target == undefined) {
        console.log(data.title)
        source = data.source
    } else {
        source = getSourceFromTitle(extractTitleFromURL(data.redirect_target))
    }

    return source;
}

let extractConnectionTitlesfromSource = (node_source) => {
    // console.log(node_source)
    // const regex = /\[\[(.*?)\]\]/g;
    // const regex = /\[\[(.*?)\|.*?\]\]|\[\[(.*?)\]\]/g
    const regex = /\[\[(?!File:)([^[\]]+)\]\]/g

    // finding matches in the string for the given regular expression
    let results = node_source.matchAll(regex);

    let connection_titles = new Set()

    for (const result of results) {
        // console.log(result)
        const title_text = result[1].split("|")[0] // || result[2];
        // console.log(title_text)

        // const title = getTitleForSearchText(title_text)
        connection_titles.add(title_text)
        
    }

    // TODO: multithreading??
    // slicing for exploring more than 2 path nodes 
    return [...connection_titles].slice(0, 5); 
}

let extractTitleFromURL = url => {
    let page_split = url.split("/")
    let title = page_split[page_split.length - 1]
    return title
}

let nums = 25
let visited = new Set()

let searchByBfs = (start_node_title, end_node_title) => {
    let end_node_found = false
    let q = new Queue() // enqueue(), dequeue(), peek(), length, isEmpty  
    q.enqueue([start_node_title])
    visited.add(start_node_title)

    while (nums>0 && !q.isEmpty && !end_node_found) {
        // getting path
        let path = q.dequeue()
        // console.log(typeof(Array.from(path)))
        // last title
        let newTitle = path[path.length - 1]

        // console.log(await newTitle)
        newTitleConnections = fetchPageConnectionTitles(newTitle)
        // console.log(newTitleConnections)
        newTitleConnections.forEach(title => {
            if (visited.has(title)) return false;
            visited.add(title)
            tempPath = path.slice()
            if (title == end_node_title) {
                console.log(title + " FOUND!!!!!!!!!!")
                tempPath.push(title)
                end_node_found = true
                document.getElementById("foundText").append(title + " FOUND. Here is the path -> " + tempPath)
                return false
            }

            tempPath.push(title)
            // console.log(tempPath)
            q.enqueue(tempPath)
            // console.log(q)
            return true
        });
        nums--;
    }
    nums = 25;
    visited = new Set()
    
}