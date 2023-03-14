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