onmessage = message => {
    // this worker will return all connection wiki titles with given wiki title
    // title -> message.data
    newTitleConnections = fetchPageConnectionTitles(message.data)
    postMessage(newTitleConnections)
}

let fetchPageConnectionTitles = (page_title) => {
    let node_source  = getSourceFromTitle(page_title)
    // let node_source = node_source_response.then(response => response)
    let connection_titles = extractConnectionTitlesfromSource(node_source)

    // console.log("these are my" + connection_titles)

    return connection_titles;
}

let getSourceFromTitle = (page_title) => {
    let source;
    // let response = await fetch(
    //     "https://en.wikipedia.org/w/rest.php/v1/page/" + page_title, {
    //         method: "GET",
    // })
    // let data = await response.json()
    let data;
    let xhr = new XMLHttpRequest();
    // xhr.open("GET", "https://en.wikipedia.org/w/rest.php/v1/page/" + page_title, false);
    xhr.open("GET", "https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&origin=*&titles=" + page_title, false);
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
        let page = data.query.pages
        let pageId = Object.keys(page)[0]
        console.log(page[pageId].title)
        source = page[pageId].revisions[0]['*']
    } else {
        source = getSourceFromTitle(extractTitleFromURL(data.redirect_target))
    }

    return source;
}

let extractConnectionTitlesfromSource = (node_source) => {
    // console.log(node_source)
    // const regex = /\[\[(.*?)\]\]/g;
    // const regex = /\[\[(.*?)\|.*?\]\]|\[\[(.*?)\]\]/g
    const regex = /\[\[(?!Category:)([^[\]]+)\]\]/g

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