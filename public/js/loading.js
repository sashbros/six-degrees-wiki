document.getElementById("search-button").onclick = () => {
    let start = document.getElementById("startNode").value
    let end = document.getElementById("endNode").value
    start = start.trim()
    end = end.trim()
    // null // same 
    if (start === "" || end === "") {
        document.getElementById("foundText").innerText = "";
    } else if (start === end) {
        document.getElementById("foundText").innerText = "Really!!???!!";
    } else {
        document.getElementById("foundText").innerHTML = "<div></div>";
    }
}

// document.getElementsByClassName('about')[0].onclick = () => {
//     showAbout()
// }

let showAbout = () => {
    let node = document.getElementsByClassName('about-open')[0]
    let visibility = node.style.visibility;
    node.style.visibility = visibility == "visible" ? 'hidden' : "visible"
}

document.onclick = event => {
    if (event.target.className === "about") {
        showAbout();
    } else if (event.target.className != "about-open") {
        let node = document.getElementsByClassName('about-open')[0]
        node.style.visibility = "hidden"
    }
}