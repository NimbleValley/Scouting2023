const scriptPickListURL = "https://script.google.com/macros/s/AKfycbwfoIvOO5IR5Yh8giY7Y-34Gg_fyddgLzTpOden6IGFnrxYnLuNrplBFb8rLOSSLGJU/exec";
const pickListSync = document.getElementById("sync-pick-list-button");
pickListSync.addEventListener("click", function() {
    postPickList(PICK_LIST_OBJECTS);
});

class PickListTeam {
    constructor(index, number, color) {
        this.index = index;
        this.number = number;
        this.color = color;
    }

    updateIndex(index) {
        this.index = index;
    }

    updateColor(color) {
        this.color = color;
    }

    getIndex() {
        return this.index;
    }

    getTeam() {
        return this.number;
    }

    getColor() {
        return this.color;
    }
}

function postPickList(data) {
    console.log(data);
}