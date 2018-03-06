function createDiv(content, classList, left, top){
    let div = document.createElement("div");

    for(let i = 0; i < classList.length; i++){
        div.className += classList[i]
        if (i !== classList.length - 1){
            div.className += " ";
        }
    }
    div.style.left = left + "px";
    div.style.top = top + "px";
    div.innerHTML = content;

    return div;
}

function randomInt(min, max) {
	return Math.floor(random(min, max + 0.99999));
}

function random(min, max) {
	return min + ((max - min) * Math.random());
}