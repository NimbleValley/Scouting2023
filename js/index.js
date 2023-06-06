var tl = new TimelineMax();

const rowHighlight = document.getElementById("row-highlight");

const sidebar = document.getElementById("sidebar");
const openSidebarButton = document.getElementById("open-sidebar");
var sidebarOpen = false;

const body = document.body;
const settings = document.getElementById("settings");
var settingsOpen = false;
const eventSelect = document.getElementById("event-select");

const urlInput = document.getElementById("spreadsheet-url-input");
console.log(localStorage.getItem("spreadsheet-url"));

const breakdownLines = document.getElementById("breakdown-lines-container");
// CHANGE BELOW
const overallCategoryHeaders = ["Points", "Gp Moved", "Gp Points", "Auto Points", "Tele Points", "Cubes Moved", "Cones Moved", "High Gp (Tele)", "Mid Gp (Tele)", "Low Gp (Tele)"];
var firstOverall = true;

const graphContainer = document.getElementById("graph-container");
var firstGraph = true;

const frcGrid = document.getElementById("grid-frc");
var gridNodes = document.getElementsByClassName("node-item");
var previousGridScrollX = 0;
var previousGridScrollY = 0;

var previousTeamComment = -1;

const sideButtons = document.getElementsByClassName("side-button");
for (var i = 1; i < sideButtons.length - 1; i++) {
    sideButtons[i].addEventListener("click", function () {
        removeActive();
        this.classList.add("active");
    });
}

function removeActive() {
    for (var i = 0; i < sideButtons.length; i++) {
        sideButtons[i].classList = "side-button";
    }
}

if (localStorage.getItem("spreadsheet-url") == null || localStorage.getItem("spreadsheet-url") == "") {
    urlInput.value = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTqII95Z0qCbWjGeG_NiYPiiNxOLCPTRbHnpo-3fIAquhIigYd6tTTryEUYAvuqQTr1eGZ4W-VKWkFX/pub?gid=0&single=true&output=csv";
} else {
    urlInput.value = localStorage.getItem("spreadsheet-url");
}

const rawTable = document.getElementById("data-table");
//API Fetch Response
var DATA = new Array();
//Headers
var FIELDS = new Array();

var TEAM_FIELDS = new Array();
//Records, value data
var RECORDS = new Array();
//Records sorted into columns for filtering & sorting
var COLUMNS = new Array();

var TEAM_COLUMNS = new Array();
var TEAM_ROWS = new Array();
var TEAMS = new Array();
var TEAMS_FLIPPED = new Array();
var TEAMS_COMMS = new Array();
var TEAMS_DISABLED = new Array();
var TEAMS_DUMB = new Array();
var TEAMS_RECKLESS = new Array();

var PICK_LIST = new Array();
var PICK_LIST_TEAM_KEY = new Array();
var PICK_LIST_OBJECTS = new Array();

var PICK_LIST_ORDER = new Array();

const pickListContainer = document.getElementById("pick-list-container");
const innerPickListContainer = document.getElementById("inner-pick-list-container");
const teamColors = ["limegreen", "gold", "#fa1616"];
const pickListColors = ["#458a30", "#8a8130", "#8a3230"];
pickListContainer.style.display = "none";
new Sortable(innerPickListContainer, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    onUpdate: function (event) {
        console.log(event.oldIndex);
        let oldObject = PICK_LIST_OBJECTS[event.oldIndex];
        let oldKey = PICK_LIST_TEAM_KEY[event.oldIndex];
        let green = document.getElementsByClassName("pick-list-green-button");
        let yellow = document.getElementsByClassName("pick-list-yellow-button");
        let red = document.getElementsByClassName("pick-list-red-button");
        let info = document.getElementsByClassName("pick-list-info-button");
        for (var i = 0; i < Math.abs(event.oldIndex - event.newIndex); i++) {
            if (event.oldIndex > event.newIndex) {
                PICK_LIST_OBJECTS[event.oldIndex - i] = PICK_LIST_OBJECTS[event.oldIndex - i - 1];
                PICK_LIST_TEAM_KEY[event.oldIndex - i] = PICK_LIST_TEAM_KEY[event.oldIndex - i - 1];
                green[event.oldIndex - i].id = parseInt(green[event.oldIndex - i].id) + 1;
                yellow[event.oldIndex - i].id = parseInt(yellow[event.oldIndex - i].id) + 1;
                red[event.oldIndex - i].id = parseInt(red[event.oldIndex - i].id) + 1;
                info[event.oldIndex - i].id = parseInt(info[event.oldIndex - i].id) + 1;
            } else {
                PICK_LIST_OBJECTS[event.oldIndex + i] = PICK_LIST_OBJECTS[event.oldIndex + i + 1];
                PICK_LIST_TEAM_KEY[event.oldIndex + i] = PICK_LIST_TEAM_KEY[event.oldIndex + i + 1];
                green[event.oldIndex + i].id = parseInt(green[event.oldIndex + i].id) - 1;
                yellow[event.oldIndex + i].id = parseInt(yellow[event.oldIndex + i].id) - 1;
                red[event.oldIndex + i].id = parseInt(red[event.oldIndex + i].id) - 1;
                info[event.oldIndex + i].id = parseInt(info[event.oldIndex + i].id) - 1;
            }
        }
        PICK_LIST_OBJECTS[event.newIndex] = oldObject;
        PICK_LIST_TEAM_KEY[event.newIndex] = oldKey;
        green[event.newIndex].id = event.newIndex;
        yellow[event.newIndex].id = event.newIndex;
        red[event.newIndex].id = event.newIndex;
        info[event.newIndex].id = event.newIndex;
    }
});

const overallGrid = document.getElementById("overall-grid");

localStorage.setItem("previousHighlightRow", -1);

const pickListScaleSlider = document.getElementById("pick-list-scale");
pickListScaleSlider.addEventListener("input", function () {
    var pickListTeams = document.getElementsByClassName("pick-list-team");
    var warnings = document.getElementsByClassName("warning-container");
    //innerPickListContainer.style.scale = pickListScaleSlider.value;
    for (var i = 0; i < pickListTeams.length; i++) {
        pickListTeams[i].style.height = pickListScaleSlider.value + "vh";
    }

    for (var i = 0; i < warnings.length; i++) {
        warnings[i].style.height = pickListScaleSlider.value + "vh";
        warnings[i].style.width = pickListScaleSlider.value + "vh";
    }
});

var TBA_EVENT_KEYS;
var TBA_EVENT_NAMES = new Array();

var TBA_RECORDS;
var TBA_COLUMNS;

const options = {
    headers: {
        'X-TBA-Auth-Key': 'sBluV8DKQA0hTvJ2ABC9U3VDZunUGUSehxuDPvtNC8SQ3Q5XHvQVt0nm3X7cvP7j'
    }
}

//getTBA('https://www.thebluealliance.com/api/v3/events/2023/keys', 0);
getTBA('https://www.thebluealliance.com/api/v3/events/2023', 1);

var TABLE_TYPE = "raw";

//CHANGE THIS --------------------------
const TEAM_INDEX = 0;
const GRID_INDEX = 4;

const oprHeaders = ["Team", "CCWMS", "DPR", "OPR"];

getData();

function getPickList() {
    rawTable.innerHTML = "<h5>Fetching Pick List...</h5>";
    CSV.fetch({
        //url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQNEBYTlOcDv1NuaCd5U-55q2czmUc-HgvNKnaRDxkkL9J39MD_ht2-6GKY4jX3bipv7dONBcUVCpU_/pub?gid=1955868836&single=true&output=csv'
        url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQBOgllZqto92BsubFi-w9Fx0t8M3Qycv_1MhTDZ_bgGzw7KOACWde-AbUF6ujgTG9oGt7ZvUlP9RAZ/pub?gid=0&single=true&output=csv'
    }
    ).done(function (dataset) {
        var tempIndex = [];
        var tempNum = [];
        var tempColor = [];
        console.log(dataset);
        if (dataset.records.length != 0) {
            tempIndex = dataset.records[0][0].match(/\d+/g);
            tempNum = dataset.records[0][1].match(/\d+/g);
            tempColor = dataset.records[0][2].match(/\d+/g);
        }
        PICK_LIST = [];
        for (var i = 0; i < tempIndex.length; i++) {
            PICK_LIST[i] = new Array(tempIndex[i], tempNum[i], tempColor[i]);
        }
        console.log(PICK_LIST);
        PICK_LIST_OBJECTS = [];
        PICK_LIST_TEAM_KEY = [];
        for (var i = 0; i < PICK_LIST.length; i++) {
            PICK_LIST_OBJECTS[i] = new PickListTeam(PICK_LIST[i][0], PICK_LIST[i][1], PICK_LIST[i][2]);
            PICK_LIST_TEAM_KEY.push(PICK_LIST[i][1]);
            PICK_LIST_ORDER.push(PICK_LIST[i][1]);
        }
        console.log(PICK_LIST_TEAM_KEY);
        if (PICK_LIST_OBJECTS.length != TEAMS.length || PICK_LIST_OBJECTS.length == 0) {
            var pickListTeamsIncluded = [];
            console.log(TEAMS);
            for (var p = 0; p < PICK_LIST_OBJECTS.length; p++) {
                pickListTeamsIncluded.push(PICK_LIST_OBJECTS[p].getTeam());
            }
            for (var i = 0; i < TEAMS.length; i++) {
                if (!pickListTeamsIncluded.includes(TEAMS[i])) {
                    PICK_LIST_OBJECTS.push(new PickListTeam(PICK_LIST_OBJECTS.length, TEAMS[i], 0));
                    PICK_LIST_TEAM_KEY.push(TEAMS[i]);
                    PICK_LIST_ORDER.push(TEAMS[i]);
                }
            }
        }
        console.log(PICK_LIST_ORDER);
        openTeamOveralls();
    }).catch(error => {
        console.log(error);
        alert('Terrible Error :(.');
        let montyWindow = window.open("", "Error Report");
        montyWindow.document.body.innerHTML = `<h3>${error}</h3>`;
        if(error == "TypeError: Failed to fetch") {
            montyWindow.document.body.innerHTML = `<h3>Check Internet Connection: ${error}</h3>`;
        }
    });
}

function getData() {
    removeActive();
    sideButtons[1].classList.add("active");
    breakdownLines.style.display = "none";
    graphContainer.style.display = "none";
    pickListContainer.style.display = "none";
    rawTable.innerHTML = "<h5>Fetching Spreadsheet...</h5>";
    CSV.fetch({
        //url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQNEBYTlOcDv1NuaCd5U-55q2czmUc-HgvNKnaRDxkkL9J39MD_ht2-6GKY4jX3bipv7dONBcUVCpU_/pub?gid=1955868836&single=true&output=csv'
        url: urlInput.value
    }
    ).done(function (dataset) {
        rawTable.innerHTML = "";
        //console.log(dataset.records);
        DATA = dataset;
        FIELDS = dataset.fields;
        RECORDS = dataset.records;
        TEAMS_FLIPPED = [];
        TEAMS_COMMS = [];
        TEAMS_DISABLED = [];
        TEAMS_DUMB = [];
        TEAMS_RECKLESS = [];
        TEAMS = [];

        //Delete Time stamps
        for (var i = 0; i < RECORDS.length; i++) {
            RECORDS[i].splice(0, 1);
        }
        FIELDS.splice(0, 1);

        //var tableHeader = document.createElement("div");
        //tableHeader.id = "raw-table";

        FIELDS.push("Cubes");
        FIELDS.push("Cones");
        FIELDS.push("GP Moved");
        FIELDS.push("GP Points");
        FIELDS.push("Points");

        for (var i = 0; i < RECORDS.length; i++) {
            if (!TEAMS.includes(RECORDS[i][0])) {
                TEAMS[TEAMS.length] = RECORDS[i][0];
            }
        }
        TEAMS.sort(function (a, b) { return a - b });
        console.log(TEAMS);

        for (var i = 0; i < RECORDS.length; i++) {
            var totalCubes = 0;
            var totalCones = 0;
            for (var c = 0; c < RECORDS[i].length; c++) {
                if (FIELDS[c].includes("Placement")) {
                    var nodeData = JSON.parse("[" + RECORDS[i][c] + "]");
                    for (var n = 0; n < nodeData.length; n++) {
                        if (nodeData[n] == 1) {
                            totalCubes++;
                        } else if (nodeData[n] == 2) {
                            totalCones++;
                        }
                    }
                }
            }
            RECORDS[i].push(totalCubes);
            RECORDS[i].push(totalCones);
        }

        for (var i = 0; i < RECORDS.length; i++) {
            RECORDS[i].push(RECORDS[i][7] + RECORDS[i][8] + RECORDS[i][9] + RECORDS[i][15] + RECORDS[i][16] + RECORDS[i][17]);
        }

        for (var i = 0; i < RECORDS.length; i++) {
            RECORDS[i].push((RECORDS[i][7] * 6) + (RECORDS[i][8] * 4) + (RECORDS[i][9] * 3) + (RECORDS[i][15] * 5) + (RECORDS[i][16] * 3) + (RECORDS[i][17] * 2));
        }

        for (var i = 0; i < RECORDS.length; i++) {
            RECORDS[i].push(parseInt(RECORDS[i][4]) + parseInt(RECORDS[i][6]));
        }

        for (var h = 0; h < FIELDS.length; h++) {
            COLUMNS[h] = new Array();
            var col = document.createElement("div");
            var temp = document.createElement("div");

            var text = document.createElement("h3");
            text.innerText = FIELDS[h];
            temp.appendChild(text);

            temp.className = "table-header-section-raw";

            //console.log(RECORDS[1][h]);
            var dataType = new String(RECORDS[1][h]).substring(0, 1);
            if (RECORDS[1][h] == null) {
                dataType = 1;
            }
            temp.id = dataType;
            temp.classList.add(`${(h)}`);
            //console.log(temp.classList);
            //temp.classList.add(h - 1);
            temp.onclick = function () { sortColumn(this.classList[1], detectCharacter(this.id), RECORDS, COLUMNS, FIELDS, false, true) };

            col.className = "column";
            if (h % 2 == 1) {
                col.style.backgroundColor = "#4d4e4e";
            }
            col.appendChild(temp);
            rawTable.appendChild(col);
        }

        localStorage.setItem("direction", 0);
        localStorage.setItem("column", -1);

        for (var i = 0; i < RECORDS.length; i++) {
            for (var s = 0; s < RECORDS[i].length; s++) {
                if (FIELDS[s] == "Flip") {
                    if (RECORDS[i][s] == "Yes") {
                        TEAMS_FLIPPED.push(RECORDS[i][TEAM_INDEX]);
                    }
                }
                if (FIELDS[s] == "Lost Comms") {
                    if (RECORDS[i][s] == "Yes") {
                        TEAMS_COMMS.push(RECORDS[i][TEAM_INDEX]);
                    }
                }
                if (FIELDS[s] == "Disabled") {
                    if (RECORDS[i][s] == "Yes") {
                        TEAMS_DISABLED.push(RECORDS[i][TEAM_INDEX]);
                    }
                }
                if (FIELDS[s].includes("Unintelligent")) {
                    if (RECORDS[i][s] == "Yes") {
                        TEAMS_DUMB.push(RECORDS[i][TEAM_INDEX]);
                    }
                }
                if (FIELDS[s] == "Reckless") {
                    if (RECORDS[i][s] == "Yes") {
                        TEAMS_RECKLESS.push(RECORDS[i][TEAM_INDEX]);
                    }
                }
                COLUMNS[s][i] = RECORDS[i][s];
                //console.log(RECORDS[i][s]);
                var temp = document.createElement("div");
                temp.className = "data-value";
                temp.id = i;
                if (FIELDS[s].includes("Placement")) {
                    temp.innerText = "{ Show Grid }";
                    temp.classList.add(s);
                    temp.onclick = function () { showGrid(this.id, this.classList[1], RECORDS) }
                    temp.addEventListener("click", function () {
                        setRowHighlight(this.id, true);
                    });
                } else {
                    temp.innerText = RECORDS[i][s];
                    temp.addEventListener("click", function () {
                        setRowHighlight(this.id, false);
                    });
                }
                rawTable.children[s].appendChild(temp);
            }
        }
        getPickList();
    }).catch(error => {
        console.log(error);
        alert('Terrible Error :(.');
        let montyWindow = window.open("", "Error Report");
        montyWindow.document.body.innerHTML = `<h3>${error}</h3>`;
        if(error == "TypeError: Failed to fetch") {
            montyWindow.document.body.innerHTML = `<h3>Check Internet Connection: ${error}</h3>`;
        }
    });
}

function resetRaw() {
    breakdownLines.style.display = "none";
    graphContainer.style.display = "none";
    pickListContainer.style.display = "none";
    overallGrid.style.display = "none";

    rawTable.innerHTML = "";
    TEAMS_FLIPPED = [];
    TEAMS_COMMS = [];
    TEAMS_DISABLED = [];
    TEAMS_DUMB = [];
    TEAMS_RECKLESS = [];

    for (var h = 0; h < FIELDS.length; h++) {
        COLUMNS[h] = new Array();
        var col = document.createElement("div");
        var temp = document.createElement("div");

        var text = document.createElement("h3");
        text.innerText = FIELDS[h];
        temp.appendChild(text);

        temp.className = "table-header-section-raw";

        //console.log(RECORDS[1][h]);
        var dataType = new String(RECORDS[1][h]).substring(0, 1);
        if (RECORDS[1][h] == null) {
            dataType = 1;
        }
        temp.id = dataType;
        temp.classList.add(`${(h)}`);
        //console.log(temp.classList);
        //temp.classList.add(h - 1);
        temp.onclick = function () { sortColumn(this.classList[1], detectCharacter(this.id), RECORDS, COLUMNS, FIELDS, false, true) };

        col.className = "column";
        if (h % 2 == 1) {
            col.style.backgroundColor = "#4d4e4e";
        }
        col.appendChild(temp);
        rawTable.appendChild(col);
    }

    localStorage.setItem("direction", 0);
    localStorage.setItem("column", -1);

    for (var i = 0; i < RECORDS.length; i++) {
        for (var s = 0; s < RECORDS[i].length; s++) {
            if (FIELDS[s] == "Flip") {
                if (RECORDS[i][s] == "Yes") {
                    TEAMS_FLIPPED.push(RECORDS[i][TEAM_INDEX]);
                }
            }
            if (FIELDS[s] == "Lost Comms") {
                if (RECORDS[i][s] == "Yes") {
                    TEAMS_COMMS.push(RECORDS[i][TEAM_INDEX]);
                }
            }
            if (FIELDS[s] == "Disabled") {
                if (RECORDS[i][s] == "Yes") {
                    TEAMS_DISABLED.push(RECORDS[i][TEAM_INDEX]);
                }
            }
            if (FIELDS[s].includes("Unintelligent")) {
                if (RECORDS[i][s] == "Yes") {
                    TEAMS_DUMB.push(RECORDS[i][TEAM_INDEX]);
                }
            }
            if (FIELDS[s] == "Reckless") {
                if (RECORDS[i][s] == "Yes") {
                    TEAMS_RECKLESS.push(RECORDS[i][TEAM_INDEX]);
                }
            }
            COLUMNS[s][i] = RECORDS[i][s];
            //console.log(RECORDS[i][s]);
            var temp = document.createElement("div");
            temp.className = "data-value";
            temp.id = i;
            console.log(RECORDS[i][TEAM_INDEX])
            if(PICK_LIST_OBJECTS[PICK_LIST_TEAM_KEY.indexOf(String(RECORDS[i][TEAM_INDEX]))].getColor() != 0) {
                temp.style.color = teamColors[PICK_LIST_OBJECTS[PICK_LIST_TEAM_KEY.indexOf(String(RECORDS[i][TEAM_INDEX]))].getColor() - 1];
            }
            if (FIELDS[s].includes("Placement")) {
                temp.innerText = "{ Show Grid }";
                temp.id = i;
                temp.classList.add(s);
                temp.onclick = function () { showGrid(this.id, this.classList[1], RECORDS) }
                temp.addEventListener("click", function () {
                    setRowHighlight(this.id, true);
                });
            } else {
                temp.innerText = RECORDS[i][s];
                temp.addEventListener("click", function () {
                    setRowHighlight(this.id, false);
                });
            }
            rawTable.children[s].appendChild(temp);
        }
    }
}

function setRowHighlight(row, always) {
    var cols = document.getElementsByClassName("column");
    for (var c = 0; c < cols.length; c++) {
        for (var i = 1; i < cols[c].children.length; i++) {
            cols[c].children[i].style.backgroundColor = "#4d4e4e00";
        }
    }

    if (localStorage.getItem("previousHighlightRow") != row || always) {
        localStorage.setItem("previousHighlightRow", row);
        for (var c = 0; c < cols.length; c++) {
            for (var i = 1; i < cols[c].children.length; i++) {
                if (i - 1 == row) {
                    cols[c].children[i].style.setProperty("background-color", "#a8652d", "important");
                }
            }
        }
    } else {
        localStorage.setItem("previousHighlightRow", -1);
    }
}

function showGrid(recordNum, colNum, record) {
    // I can't deal with sticky I gave up haha
    previousGridScrollX = window.scrollX;
    previousGridScrollY = window.scrollY;
    window.scrollTo(0, 0);
    // Very clean code, great use of sticky
    breakdownLines.style.display = "none";
    graphContainer.style.display = "none";
    pickListContainer.style.display = "none";

    body.style.overflow = "hidden";
    frcGrid.style.display = "flex";

    var nodeData = JSON.parse("[" + record[recordNum][colNum] + "]");
    console.log(nodeData);

    for (var i = 0; i < gridNodes.length; i++) {
        //console.log(nodeData[Math.floor(i/9)][i%9]);
        gridNodes[i].style.backgroundColor = "#797979";
        console.log((9 - (i % 9)) * ((Math.floor(i / 9) + 1)));
        if (nodeData[i] > 0) {
            if (nodeData[i] == 1) {
                gridNodes[i].style.backgroundColor = "#6643DA";
            } else {
                gridNodes[i].style.backgroundColor = "#FDC955";
            }
        }
    }
}

function hideGrid() {
    body.style.overflow = "auto";
    frcGrid.style.display = "none";
    // The impossible sticky strikes again :(
    window.scrollTo(previousGridScrollX, previousGridScrollY);
}

function setUpGraph() {
    breakdownLines.style.display = "none";
    pickListContainer.style.display = "none";
    overallGrid.style.display = "none";

    if (TEAMS.length < 1) {
        getTeamData();
    }

    //graphContainer.innerHTML = "";
    graphContainer.style.display = "flex";
    rawTable.innerHTML = "";

    var tempTwo = document.createElement("select");
    tempTwo.id = "graph-category-select-two";
    tempTwo.addEventListener("input", doGraph);
    tempTwo.style.width = "30vh";
    tempTwo.style.marginRight = "5vh";
    for (var i = 1; i < TEAM_FIELDS.length; i++) {
        var op = document.createElement("option");
        op.text = TEAM_FIELDS[i];
        op.value = i;
        tempTwo.append(op);
    }
    if (localStorage.getItem("graph-two") != null) {
        tempTwo.value = localStorage.getItem("graph-two");
    }
    rawTable.appendChild(tempTwo);

    var temp = document.createElement("select");
    temp.id = "graph-number-select";
    temp.style.width = "20vh";
    for (var i = 0; i < 2; i++) {
        var op = document.createElement("option");
        if (i == 0) {
            op.text = i + 1 + " Value";
        } else {
            op.text = i + 1 + " Values";
        }
        op.value = i + 1;
        temp.append(op);
    }

    if (localStorage.getItem("graph-mode") != null) {
        temp.value = localStorage.getItem("graph-mode");
    }

    temp.addEventListener("input", doGraph);
    rawTable.appendChild(temp);

    var tempT = document.createElement("select");
    tempT.id = "graph-category-select";
    tempT.addEventListener("input", doGraph);
    tempT.style.width = "30vh";
    tempT.style.marginLeft = "5vh";
    for (var i = 1; i < TEAM_FIELDS.length; i++) {
        var op = document.createElement("option");
        op.text = TEAM_FIELDS[i];
        op.value = i;
        tempT.append(op);
    }
    rawTable.appendChild(tempT);

    if (localStorage.getItem("graph-one") != null) {
        tempT.value = localStorage.getItem("graph-one");
    }

    doGraph();
}

function doGraph() {
    var graphMode = parseInt(document.getElementById("graph-number-select").value);

    if (graphMode == 2) {
        document.getElementById("graph-category-select-two").style.display = "block";
    } else {
        document.getElementById("graph-category-select-two").style.display = "none";
    }

    graphContainer.innerHTML = "";

    var graphColumn = document.getElementById("graph-category-select").value;
    var sortedGraphColumn = JSON.parse(JSON.stringify(TEAM_COLUMNS));
    sortedGraphColumn = sortedGraphColumn[graphColumn].sort(function (a, b) { return a - b });

    var lower_bound = sortedGraphColumn[0];
    var upper_bound = sortedGraphColumn[sortedGraphColumn.length - 1];

    if (graphMode == 2) {
        var secondGraphColumn = document.getElementById("graph-category-select-two").value;
        var secondSortedGraphColumn = JSON.parse(JSON.stringify(TEAM_COLUMNS));
        secondSortedGraphColumn = secondSortedGraphColumn[secondGraphColumn].sort(function (a, b) { return b - a });

        var second_lower_bound = secondSortedGraphColumn[0];
        var second_upper_bound = secondSortedGraphColumn[secondSortedGraphColumn.length - 1];
    }

    var leftContainer = document.createElement("div");
    leftContainer.id = "graph-left-legend";

    var bottomContainer = document.createElement("div");
    bottomContainer.id = "graph-bottom-legend";

    var tickContainer = document.createElement("div");
    tickContainer.id = "graph-tick-container";

    var tempAverageVertical = document.createElement("div");
    tempAverageVertical.id = "graph-average-vertical";

    var tempAverageHorizontal = document.createElement("div");
    tempAverageHorizontal.id = "graph-average-horizontal";

    /*window.addEventListener("resize", function() {
        doGraph();
    });*/

    for (var i = 0; i < TEAMS.length; i++) {
        var tempGraphLine = document.createElement("div");
        tempGraphLine.className = "graph-line";
        tempGraphLine.innerHTML = `
                                        <div class="graph-track">
                                            <div class="graph-inner-line"></div>
                                        </div>
                                    `;
        if (graphMode == 1) {
            var tempLeft = document.createElement("h6");
            tempLeft.innerText = `${TEAMS[i]}`;
            leftContainer.appendChild(tempLeft);
        }

        var tempDot = document.createElement("div");
        tempDot.className = "graph-dot";
        tempDot.id = TEAMS[i];
        tempDot.style.left = 0;
        tempDot.style.top = 0;
        tempDot.style.scale = 0.5;

        var tempDotPopup = document.createElement("div");
        tempDotPopup.className = "dot-popup";
        if (graphMode == 1) {
            tempDotPopup.innerText = TEAMS[i] + "\n" + TEAM_COLUMNS[graphColumn][i];
        } else {
            tempDotPopup.innerText = TEAMS[i] + "\n" + TEAM_COLUMNS[graphColumn][i] + ", " + TEAM_COLUMNS[secondGraphColumn][i];
        }
        tempDot.appendChild(tempDotPopup);

        var tempTick = document.createElement("div");
        tempTick.className = "graph-tick-container";
        tempTick.innerHTML = `<div class = "graph-tick"> </div>`;

        tempDot.style.left = `0vh`;
        tempDot.style.top = `${0}vh`;
        tempDot.id = i;

        tickContainer.appendChild(tempDot);
        //graphContainer.appendChild(tempGraphLine);
    }

    if (graphMode == 2) {
        for (var i = 0; i < 5; i++) {
            var tempLeft = document.createElement("h6");
            tempLeft.innerText = `${((second_upper_bound - second_lower_bound) * (i / 4)) + second_lower_bound}`;
            leftContainer.appendChild(tempLeft);
        }

    }

    for (var i = 0; i < 5; i++) {
        var tempBottom = document.createElement("h6");
        tempBottom.innerText = `${((upper_bound - lower_bound) * (i / 4)) + lower_bound}`;
        bottomContainer.appendChild(tempBottom);
    }

    tickContainer.appendChild(tempAverageVertical);
    if (graphMode == 2) {
        tickContainer.appendChild(tempAverageHorizontal);
    } else {
        tempAverageHorizontal.style.display = "none";
    }

    graphContainer.appendChild(leftContainer);
    graphContainer.appendChild(tickContainer);
    graphContainer.appendChild(bottomContainer);

    // Left, Tick, Bottom, sounds like trouble :(

    var dots = document.getElementsByClassName("graph-dot");
    var graphTickContainer = document.getElementById("graph-tick-container");
    console.log(graphTickContainer.offsetHeight);
    for (var i = 0; i < dots.length; i++) {
        console.log(upper_bound + ", " + lower_bound + ", " + TEAM_COLUMNS[graphColumn][i]);
        var percentage = (TEAM_COLUMNS[graphColumn][i] - lower_bound) / (upper_bound - lower_bound);
        console.log(percentage);
        if (graphMode == 1) {
            dots[i].style.top = `${(graphTickContainer.offsetHeight * ((parseInt(dots[i].id) + 0) / (dots.length - 1))) + (((i + 1) % 2) * 12) - (window.innerHeight * (1 / 100))}px`;
        } else {
            var secondPercentage = (TEAM_COLUMNS[secondGraphColumn][i] - second_lower_bound) / (second_upper_bound - second_lower_bound);
            dots[i].style.top = `${(graphTickContainer.offsetHeight * secondPercentage) + (((i + 1) % 2) * 12) - (window.innerHeight * (1 / 100))}px`;
        }
        // I'm so clever I thought of the solution on the walk home from school with mod
        dots[i].style.left = `${(graphTickContainer.offsetWidth * percentage) + ((i % 2) * 12) - (window.innerHeight * (1 / 100))}px`;
        dots[i].style.scale = 1;
    }

    var avgVertical = 0;
    for (var i = 0; i < sortedGraphColumn.length; i++) {
        avgVertical += sortedGraphColumn[i];
    }

    avgVertical /= sortedGraphColumn.length;
    tempAverageVertical.style.left = `${(graphTickContainer.offsetWidth * ((avgVertical - lower_bound) / (upper_bound - lower_bound))) - (window.innerHeight * (1 / 100))}px`;

    if (graphMode == 2) {
        var avgHorizontal = 0;
        for (var i = 0; i < secondSortedGraphColumn.length; i++) {
            avgHorizontal += secondSortedGraphColumn[i];
        }
        avgHorizontal /= secondSortedGraphColumn.length;

        tempAverageHorizontal.style.top = `${(graphTickContainer.offsetHeight * ((avgHorizontal - second_lower_bound) / (second_upper_bound - second_lower_bound))) - (window.innerHeight * (1 / 100))}px`;
    }

    localStorage.setItem("graph-mode", document.getElementById("graph-number-select").value);
    localStorage.setItem("graph-one", document.getElementById("graph-category-select").value);
    localStorage.setItem("graph-two", document.getElementById("graph-category-select-two").value);
}

function setUpTeamOveralls() {
    //var overallGrid = document.createElement("div");
    //overallGrid.id = "overall-grid";

    graphContainer.style.display = "none";
    pickListContainer.style.display = "none";
    overallGrid.style.display = "grid";

    breakdownLines.innerHTML = "";
    rawTable.innerHTML = "";
    overallGrid.innerHTML = "";

    var temp = document.createElement("select");
    temp.id = "team-overall-select";
    temp.addEventListener("input", openTeamOveralls);
    for (var i = 0; i < TEAMS.length; i++) {
        var op = document.createElement("option");
        op.text = TEAMS[i];
        op.value = TEAMS[i];
        temp.append(op);
    }
    if(localStorage.getItem("breakdown-team") != null ) {
        temp.value = localStorage.getItem("breakdown-team");
    }

    for (var i = 0; i < overallCategoryHeaders.length; i++) {

        var tempContainer = document.createElement("div");
        tempContainer.className = "line-container";

        var tempLine = document.createElement("div");
        tempLine.className = "breakdown-line";

        var tempPopup = document.createElement("div");
        tempPopup.className = "breakdown-popup";
        tempContainer.appendChild(tempPopup);

        var tempInnerLine = document.createElement("div");
        tempInnerLine.className = "inner-breakdown-line";
        tempInnerLine.style.height = `0 % `;

        var temph4 = document.createElement("h4");
        temph4.innerText = overallCategoryHeaders[i];

        tempLine.appendChild(tempInnerLine);
        tempContainer.appendChild(tempLine);
        tempContainer.appendChild(temph4);
        breakdownLines.appendChild(tempContainer);
    }

    let breakdownData = document.createElement("div");
    breakdownData.id = "breakdown-data-container";

    let feedbackContainer = document.createElement("div");
    feedbackContainer.id = "feedback-container";
    
    overallGrid.appendChild(temp);
    overallGrid.appendChild(breakdownData);
    overallGrid.appendChild(breakdownLines);
    overallGrid.appendChild(feedbackContainer);
    document.body.appendChild(overallGrid);
}

function openTeamOveralls() {
    //breakdownLines.innerText = "";
    if (TEAM_COLUMNS.length < 1) {
        getTeamData();
    }

    if (firstOverall) {
        setUpTeamOveralls();
        firstOverall = false;
    }

    breakdownLines.style.display = "flex";
    graphContainer.style.display = "none";
    pickListContainer.style.display = "none";


    //console.log(TEAM_COLUMNS);
    var overallData = [];

    var sortIndexes = [13, 11, 12, 1, 2, 9, 10, 6, 7, 8, 0, 0, 0];

    localStorage.setItem("breakdown-team", document.getElementById("team-overall-select").value);

    for (var i = 0; i < overallCategoryHeaders.length; i++) {
        var teamsSorted = [];
        for (var t = 0; t < getSortedIndex(sortIndexes[i], 456, TEAM_ROWS, TEAM_COLUMNS).length; t++) {
            teamsSorted[t] = getSortedIndex(sortIndexes[i], 456, TEAM_ROWS, TEAM_COLUMNS)[t][0];
        }

        // Sort the column, return the index that was matched up with the data
        if (true) {
            overallData[i] = teamsSorted.indexOf(parseInt(document.getElementById("team-overall-select").value)) / parseFloat(TEAMS.length - 1);
        } else {
           // Lol this will never happen, everyone loves if true statements 
            overallData[i] = 0.25;
        }
    }

    for (var i = 0; i < overallCategoryHeaders.length; i++) {
        document.getElementsByClassName("inner-breakdown-line")[i].style.height = `${overallData[i] * 100}% `;
        document.getElementsByClassName("breakdown-popup")[i].innerText = `${(overallData[i] * (TEAMS.length - 1)) + 1} out of ${TEAMS.length} `;
    }

    let breakdownDataContainer = document.getElementById("breakdown-data-container");
    breakdownDataContainer.innerHTML = "";
    for(var i = 1; i < TEAM_COLUMNS.length-1; i ++) {
        let tempDataContainer = document.createElement("div");
        tempDataContainer.className = "breakdown-data";

        let tempData = document.createElement("h8");
        tempData.innerText = TEAM_ROWS[TEAMS.indexOf(parseInt(document.getElementById("team-overall-select").value))][i];

        let tempDataTitle = document.createElement("h9");
        tempDataTitle.innerText = TEAM_FIELDS[i];

        tempDataContainer.appendChild(tempDataTitle);
        tempDataContainer.appendChild(tempData);
        breakdownDataContainer.appendChild(tempDataContainer);
    }
    let tempFeedbackContainer = document.getElementById("feedback-container");
    tempFeedbackContainer.innerHTML = "";

    let tempWarningContainer = document.createElement("div");
    tempWarningContainer.id = "breakdown-warning-container";

    let tempWarningTitle = document.createElement("p");
    tempWarningTitle.className = "breakdown-warning-text";
    tempWarningTitle.style.fontWeight = "bold";
    tempWarningTitle.style.scale = "1.5";
    tempWarningTitle.style.textDecoration = "underline";
    tempWarningTitle.innerText = "Issues:";
    tempWarningContainer.appendChild(tempWarningTitle);

    let warningTypes = ["Flip/s", "Comm Issue/s", "Disabled", "Unintelligent", "Reckless"];
    let compiledWarnings = [TEAMS_FLIPPED, TEAMS_COMMS, TEAMS_DISABLED, TEAMS_DUMB, TEAMS_RECKLESS];
    for(var w = 0; w < warningTypes.length; w ++) {
        let tempWarningText = document.createElement("p");
        tempWarningText.className = "breakdown-warning-text";
        tempWarningText.innerText = "0 " + warningTypes[w];
        if(compiledWarnings[w].includes(parseInt(document.getElementById("team-overall-select").value))) {
            let numOccurances = 0;
            for(var t = 0; t < compiledWarnings[w].length; t ++) {
                if(compiledWarnings[w][t] == parseInt(document.getElementById("team-overall-select").value)) {
                    numOccurances ++;
                }
            }
            tempWarningText.innerText = numOccurances + " " + warningTypes[w];
        }
        tempWarningContainer.appendChild(tempWarningText);
    }

    tempFeedbackContainer.appendChild(tempWarningContainer);
}

function getSortedIndex(colNum, team, records, columns) {
    var sortedColumn = JSON.parse(JSON.stringify(columns));
    console.log(sortedColumn);
    sortedColumn = sortedColumn[colNum].sort(function (a, b) { return a - b });
    //console.log(sortedColumn);

    var sortedRows = [];
    var previousRows = [];
    var takenRows = [];
    var counter = 0;

    var tempColumns = JSON.parse(JSON.stringify(columns));

    for (var r = 0; r < records.length; r++) {
        for (var i = 0; i < tempColumns[0].length; i++) {
            //console.log(tempColumns[colNum][i]);
            //console.log(takenRows.includes(i));
            if (columns[colNum][i] == sortedColumn[r] && !takenRows.includes(i)) {
                sortedRows[counter] = records[i];
                previousRows[counter] = i;
                takenRows[counter] = i;
                counter++;
                break;
            }
        }
    }

    //console.log(sortedRows);

    return sortedRows;
}

function sortColumn(colNum, type, records, columns, field, team, useCols) {
    var direction = parseInt(localStorage.getItem("direction"));
    var previousColumn = parseInt(localStorage.getItem("column"));
    localStorage.setItem("column", colNum);
    localStorage.setItem("direction", parseInt(direction) + 1);
    if (previousColumn != colNum) {
        direction = 0;
        localStorage.setItem("direction", 1);
    }

    if (useCols) {
        var cols = document.getElementsByClassName("column");
        for (var i = 0; i < cols.length; i++) {
            cols[i].style.background = "";
            if (i % 2 == 1) {
                cols[i].style.background = "#4D4E4E";
            }
        }
        if (direction % 3 == 0) {
            cols[colNum].style.background = 'linear-gradient(0deg, rgba(159,99,48,1) 0%, rgba(102,95,81,1) 100%)';
            cols[colNum].style.animation = `column-sort-up ${document.documentElement.scrollHeight / 500}s infinite`;
        } else {
            cols[colNum].style.background = 'linear-gradient(180deg, rgba(159,99,48,1) 0%, rgba(102,95,81,1) 100%)';
            cols[colNum].style.animation = `column-sort-down ${document.documentElement.scrollHeight / 500}s infinite`;
        }
        cols[colNum].style.backgroundSize = "100% 500%";
    }

    if (type == 1) {
        var sortedColumn = JSON.parse(JSON.stringify(columns));
        //console.log(dir);
        if (direction % 3 == 0) {
            sortedColumn = sortedColumn[colNum].sort(function (a, b) { return a - b });
        } else if (direction % 3 == 1) {
            sortedColumn = sortedColumn[colNum].sort(function (a, b) { return b - a });
        } else {
            //console.log(team);
            if (team) {
                getTeamData();
            } else {
                resetRaw();
            }
            //originalSort(records, columns, field);
            return;
        }

        var sortedRows = [];
        var previousRows = [];
        var takenRows = [];
        var counter = 0;

        var tempColumns = JSON.parse(JSON.stringify(columns));

        for (var r = 0; r < records.length; r++) {
            for (var i = 0; i < tempColumns[0].length; i++) {
                //console.log(tempColumns[colNum][i]);
                //console.log(takenRows.includes(i));
                if (columns[colNum][i] == sortedColumn[r] && !takenRows.includes(i)) {
                    sortedRows[counter] = records[i];
                    previousRows[counter] = i;
                    takenRows[counter] = i;
                    counter++;
                    break;
                }
            }
        }

        //console.log(sortedColumn);

        var cols = document.getElementsByClassName("column");
        for (var i = 0; i < records.length; i++) {
            var sub = 0;
            if (team) {
                sub = 1;
            }
            for (var s = 0; s < records[i].length - sub; s++) {
                //console.log(RECORDS[i][s]);
                var tempCol = cols[s];
                var temp = tempCol.children[i + 1];
                if (team) {
                    temp.classList[1] = i;
                }
                //console.log(temp.classList);
                if (field[s].includes("Placement")) {
                    temp.innerText = "{ Show Grid }";
                    temp.id = i;
                    temp.onclick = function () { showGrid(this.id, this.classList[1], sortedRows) }
                } else {
                    if (team) {
                        if (s == 0) {
                            for (var q = 0; q < sortedRows.length; q++) {
                                if (sortedRows[i][0] == TEAMS[q]) {
                                    temp.id = q;
                                }
                            }
                        }
                    }
                    temp.innerText = sortedRows[i][s];
                    temp.style.color = "white";
                    if (true) {
                        console.log(PICK_LIST_OBJECTS[PICK_LIST_TEAM_KEY.indexOf(String(sortedRows[i][0]))].color);
                        if (PICK_LIST_OBJECTS[PICK_LIST_TEAM_KEY.indexOf(String(sortedRows[i][0]))].getColor() != 0) {
                            temp.style.setProperty("color", `${teamColors[PICK_LIST_OBJECTS[PICK_LIST_TEAM_KEY.indexOf(String(sortedRows[i][0]))].getColor() - 1]}`, "important");
                            //console.log(tempData.style.backgroundColor);
                        }
                    }
                }
            }
        }
        // This code is a mess

        if (team) {
            if (parseInt(localStorage.getItem("previousHighlightRow")) != -1) {
                var previousTeam = TEAM_ROWS[parseInt(localStorage.getItem("previousHighlightRow"))][0];
                var originalHighlight = localStorage.getItem("previousHighlightRow");
                console.log(previousTeam);
                for (var i = 0; i < sortedRows.length; i++) {
                    if (sortedRows[i][0] == previousTeam) {
                        setRowHighlight(i, true);
                        localStorage.setItem("previousHighlightRow", originalHighlight);
                    }
                }
            }
        }

    } else {
        console.log("Sad");
    }
}

// FOR TEAMS --------------------------------------------------

/*function sortTeamColumn(colNum, type, col, dk) {
    var direction = parseInt(localStorage.getItem("direction"));
    console.log(direction);
    var previousColumn = parseInt(localStorage.getItem("column"));
    localStorage.setItem("column", colNum);
    localStorage.setItem("direction", parseInt(direction) + 1);
    if (previousColumn != colNum) {
        direction = 0;
        localStorage.setItem("direction", 1);
    }

    if (type == 1) {
        var sortedColumn = JSON.parse(JSON.stringify(TEAM_COLUMNS));
        //console.log(dir);
        console.log(sortedColumn);
        //console.log(dk)
        if (direction % 3 == 0) {
            sortedColumn = sortedColumn[colNum].sort(function (a, b) { return a - b });
        } else if (direction % 3 == 1) {
            sortedColumn = sortedColumn[colNum].sort(function (a, b) { return b - a });
        } else {
            originalSort(TEAM_ROWS, TEAM_COLUMNS);
            return;
        }

        console.log(sortedColumn);

        var sortedRows = [];
        var takenRows = [];
        var counter = 0;

        var tempColumns = JSON.parse(JSON.stringify(TEAM_COLUMNS));

        for (var r = 0; r < TEAMS.length; r++) {
            for (var i = 0; i < tempColumns[0].length; i++) {
                //console.log(tempColumns[colNum][i]);
                //console.log(takenRows.includes(i));
                if (TEAM_COLUMNS[colNum][i] == sortedColumn[r] && !takenRows.includes(i)) {
                    sortedRows[counter] = TEAM_ROWS[i];
                    takenRows[counter] = i;
                    counter++;
                    break;
                }
            }
        }

        var cols = document.getElementsByClassName("column");
        for (var i = 0; i < TEAMS.length; i++) {
            for (var s = 0; s < TEAM_COLUMNS.length; s++) {
                console.log(sortedRows);
                var tempCol = cols[s];
                var temp = tempCol.children[i + 1];
                temp.innerText = sortedRows[i][s];
            }
        }

    } else {
        console.log("Sad");
    }
}*/

function detectCharacter(val) {
    //console.log(val);
    if (val == "0" || val == "1" || val == "2" || val == "3" || val == "4" || val == "5" || val == "6" || val == "7" || val == "8" || val == "9") {
        return 1;
    }
    return 0;
}

function originalSort(record, column, field) {
    var cols = document.getElementsByClassName("column");
    for (var x = 0; x < record.length; x++) {
        for (var y = 0; y < record[x].length - 1; y++) {
            //console.log(RECORDS[i][s]);
            var tempCol = cols[y];
            var temp = tempCol.children[x + 1];
            if (field[s].includes("Placement")) {
                temp.innerText = "{ Show Grid }";
                temp.id = i;
                temp.onclick = function () { showGrid(this.id, this.classList[1], record) }
            } else {
                temp.innerText = column[y][x];
            }
        }
    }
}

function toggleSidebar() {
    sidebarOpen = !sidebarOpen;

    if (sidebarOpen) {
        tl.to(sidebar, { left: "0vh", duration: 0.5, ease: "power2" });
        //tl.to(rawTable, { marginLeft: "23vw", duration: 0.5, ease: "power2"}, "-=0.5");
        tl.to(openSidebarButton, { scale: "-1 1", duration: 0.5, ease: "power2" }, "-=0.5");
    } else {
        tl.to(sidebar, { left: "-25vh", duration: 0.5, ease: "power2" });
        //tl.to(rawTable, { marginLeft: "3vw", duration: 0.5, ease: "power2"}, "-=0.5");
        tl.to(openSidebarButton, { scale: "1 1", duration: 0.5, ease: "power2" }, "-=0.5");
    }
}

function refreshData() {
    rawTable.innerHTML = "";
    getData();
}

function setUpPickList() {
    breakdownLines.style.display = "none";
    graphContainer.style.display = "none";
    overallGrid.style.display = "none";
    rawTable.innerHTML = "";
    pickListContainer.style.display = "block";

    innerPickListContainer.innerHTML = "";
    for (var i = 0; i < TEAMS.length; i++) {
        var tempTeam = document.createElement("div");
        tempTeam.className = "pick-list-team";
        tempTeam.id = i;

        var tempTeamText = document.createElement("h7");
        tempTeamText.innerText = PICK_LIST_OBJECTS[i].getTeam();

        var warnings = [];
        /*for (var w = 0; w < 3; w++) {
            let tempWarning = document.createElement("div");
            tempWarning.className = "warning-container";
            let tempWarningText = document.createElement("div");
            tempWarningText.className = "warning-popup";
            tempWarning.appendChild(tempWarningText);
            warnings.push(tempWarning);
        }*/

        tempTeam.appendChild(tempTeamText);

        console.log(TEAMS_FLIPPED)
        if (TEAMS_FLIPPED.includes(PICK_LIST_OBJECTS[i].getTeam())) {
            let tempWarning = document.createElement("div");
            tempWarning.className = "warning-container";
            let tempWarningText = document.createElement("div");
            tempWarningText.className = "warning-popup";
            tempWarning.appendChild(tempWarningText);
            tempWarning.style.backgroundImage = "url('svg/flip.svg')";
            let counter = 0;
            for (var x = 0; x < TEAMS_FLIPPED.length; x++) {
                if (TEAMS_FLIPPED[x] == PICK_LIST_OBJECTS[i].getTeam()) {
                    counter++;
                }
            }
            if (counter == 1) {
                tempWarningText.innerText = counter + " Flip";
            } else {
                tempWarningText.innerText = counter + " Flips";
            }
            tempTeam.appendChild(tempWarning);
        }

        if (TEAMS_COMMS.includes(PICK_LIST_OBJECTS[i].getTeam())) {
            let tempWarning = document.createElement("div");
            tempWarning.className = "warning-container";
            let tempWarningText = document.createElement("div");
            tempWarningText.className = "warning-popup";
            tempWarning.appendChild(tempWarningText);
            tempWarning.style.backgroundImage = "url('svg/comms.svg')";
            let counter = 0;
            for (var x = 0; x < TEAMS_COMMS.length; x++) {
                if (TEAMS_COMMS[x] == PICK_LIST_OBJECTS[i].getTeam()) {
                    counter++;
                }
            }
            if (counter == 1) {
                tempWarningText.innerText = counter + " Comm Lost";
            } else {
                tempWarningText.innerText = counter + " Comms Lost";
            }
            tempTeam.appendChild(tempWarning);
        }

        if (TEAMS_DISABLED.includes(PICK_LIST_OBJECTS[i].getTeam())) {
            let tempWarning = document.createElement("div");
            tempWarning.className = "warning-container";
            let tempWarningText = document.createElement("div");
            tempWarningText.className = "warning-popup";
            tempWarning.appendChild(tempWarningText);
            tempWarning.style.backgroundImage = "url('svg/disabled.svg')";
            let counter = 0;
            for (var x = 0; x < TEAMS_DISABLED.length; x++) {
                if (TEAMS_DISABLED[x] == PICK_LIST_OBJECTS[i].getTeam()) {
                    counter++;
                }
            }
            if (counter == 1) {
                tempWarningText.innerText = counter + " Time Disabled";
            } else {
                tempWarningText.innerText = counter + " Times Disabled";
            }
            tempTeam.appendChild(tempWarning)
        }

        if (TEAMS_DUMB.includes(PICK_LIST_OBJECTS[i].getTeam())) {
            let tempWarning = document.createElement("div");
            tempWarning.className = "warning-container";
            let tempWarningText = document.createElement("div");
            tempWarningText.className = "warning-popup";
            tempWarning.appendChild(tempWarningText);
            tempWarning.style.backgroundImage = "url('svg/dumb.svg')";
            let counter = 0;
            for (var x = 0; x < TEAMS_DUMB.length; x++) {
                if (TEAMS_DUMB[x] == PICK_LIST_OBJECTS[i].getTeam()) {
                    counter++;
                }
            }
            if (counter == 1) {
                tempWarningText.innerText = counter + " Dumb Report";
            } else {
                tempWarningText.innerText = counter + " Dumb Reports";
            }
            tempTeam.appendChild(tempWarning)
        }

        if (TEAMS_RECKLESS.includes(PICK_LIST_OBJECTS[i].getTeam())) {
            let tempWarning = document.createElement("div");
            tempWarning.className = "warning-container";
            let tempWarningText = document.createElement("div");
            tempWarningText.className = "warning-popup";
            tempWarning.appendChild(tempWarningText);
            tempWarning.style.backgroundImage = "url('svg/reckless.svg')";
            let counter = 0;
            for (var x = 0; x < TEAMS_RECKLESS.length; x++) {
                if (TEAMS_RECKLESS[x] == PICK_LIST_OBJECTS[i].getTeam()) {
                    counter++;
                }
            }
            if (counter == 1) {
                tempWarningText.innerText = counter + " Reckles Report";
            } else {
                tempWarningText.innerText = counter + " Reckless Reports";
            }
            tempTeam.appendChild(tempWarning)
        }

        var tempControlPanel = document.createElement("div");
        tempControlPanel.className = "pick-list-control-panel";

        var toggleControlPanel = document.createElement("div");
        toggleControlPanel.className = "pick-list-toggle-control-panel";

        tempControlPanel.appendChild(toggleControlPanel);

        tempControlPanel.addEventListener("click", function (event) {
            if (event.target.className == "pick-list-control-panel") {
                var toggles = document.getElementsByClassName("pick-list-control-panel");
                for (var i = 0; i < toggles.length; i++) {
                    if (this != toggles[i]) {
                        toggles[i].children[0].style.display = "none";
                    }
                }
                if (this.children[0].style.display != "flex") {
                    this.children[0].style.display = "flex";
                } else {
                    this.children[0].style.display = "none";
                }
            } else {

            }
        });

        var tempGreemButton = document.createElement("div");
        tempGreemButton.className = "pick-list-green-button";
        tempGreemButton.innerText = "";
        tempGreemButton.id = i;
        if (PICK_LIST_OBJECTS[i].getColor() == 1) {
            tempGreemButton.style.backgroundColor = teamColors[0];
        }
        tempGreemButton.onclick = function () {
            document.getElementsByClassName("pick-list-yellow-button")[this.id].style.backgroundColor = "";
            document.getElementsByClassName("pick-list-red-button")[this.id].style.backgroundColor = "";
            if (PICK_LIST_OBJECTS[this.id].getColor() == 1) {
                PICK_LIST_OBJECTS[this.id].setColor(0);
                this.style.backgroundColor = "";
            } else {
                PICK_LIST_OBJECTS[this.id].setColor(1);
                this.style.backgroundColor = teamColors[0];
            }
            let tempClickedTeam = document.getElementsByClassName("pick-list-team")[this.id];
            if (PICK_LIST_OBJECTS[this.id].getColor() == 0) {
                tempClickedTeam.style.backgroundColor = "#5b5b5b";
            } else {
                tempClickedTeam.style.setProperty("background-color", pickListColors[PICK_LIST_OBJECTS[this.id].getColor() - 1], "important");
            }
            console.log(this.id);
        }
        toggleControlPanel.appendChild(tempGreemButton);

        var tempYellowButton = document.createElement("div");
        tempYellowButton.className = "pick-list-yellow-button";
        tempYellowButton.innerText = "";
        tempYellowButton.id = i;
        if (PICK_LIST_OBJECTS[i].getColor() == 2) {
            tempYellowButton.style.backgroundColor = teamColors[1];
        }
        tempYellowButton.onclick = function () {
            document.getElementsByClassName("pick-list-green-button")[this.id].style.backgroundColor = "";
            document.getElementsByClassName("pick-list-red-button")[this.id].style.backgroundColor = "";
            if (PICK_LIST_OBJECTS[this.id].getColor() == 2) {
                PICK_LIST_OBJECTS[this.id].setColor(0);
                this.style.backgroundColor = "";
            } else {
                PICK_LIST_OBJECTS[this.id].setColor(2);
                this.style.backgroundColor = teamColors[1];
            }
            let tempClickedTeam = document.getElementsByClassName("pick-list-team")[this.id];
            if (PICK_LIST_OBJECTS[this.id].getColor() == 0) {
                tempClickedTeam.style.backgroundColor = "#5b5b5b";
            } else {
                tempClickedTeam.style.setProperty("background-color", pickListColors[PICK_LIST_OBJECTS[this.id].getColor() - 1], "important");
            }
        }
        toggleControlPanel.appendChild(tempYellowButton);

        var tempRedButton = document.createElement("div");
        tempRedButton.className = "pick-list-red-button";
        tempRedButton.innerText = "";
        tempRedButton.id = i;
        if (PICK_LIST_OBJECTS[i].getColor() == 3) {
            tempRedButton.style.backgroundColor = teamColors[2];
        }
        tempRedButton.onclick = function () {
            document.getElementsByClassName("pick-list-yellow-button")[this.id].style.backgroundColor = "";
            document.getElementsByClassName("pick-list-green-button")[this.id].style.backgroundColor = "";
            if (PICK_LIST_OBJECTS[this.id].getColor() == 3) {
                PICK_LIST_OBJECTS[this.id].setColor(0);
                this.style.backgroundColor = "";
            } else {
                PICK_LIST_OBJECTS[this.id].setColor(3);
                this.style.backgroundColor = teamColors[2];
            }
            let tempClickedTeam = document.getElementsByClassName("pick-list-team")[this.id];
            if (PICK_LIST_OBJECTS[this.id].getColor() == 0) {
                tempClickedTeam.style.backgroundColor = "#5b5b5b";
            } else {
                tempClickedTeam.style.setProperty("background-color", pickListColors[PICK_LIST_OBJECTS[this.id].getColor() - 1], "important");
            }
        }
        toggleControlPanel.appendChild(tempRedButton);

        tempTeam.appendChild(tempControlPanel);

        var tempInfoButton = document.createElement("div");
        tempInfoButton.className = "pick-list-info-button";
        tempInfoButton.innerText = "i";
        tempInfoButton.id = i;
        tempInfoButton.onclick = function () {
            removeActive();
            sideButtons[2].classList.add("active");
            getTeamData();
            console.log(TEAMS);
            setRowHighlight(TEAMS.indexOf(parseInt(PICK_LIST_OBJECTS[this.id].getTeam())), true);
        }
        tempTeam.appendChild(tempInfoButton);

        if (PICK_LIST_OBJECTS[i].getColor() != 0) {
            tempTeam.style.setProperty("background-color", pickListColors[PICK_LIST_OBJECTS[i].getColor() - 1], "important");
        }

        innerPickListContainer.appendChild(tempTeam);
    }
    /*let tempSyncButton = document.createElement("button");
    tempSyncButton.innerText = "Sync";
    tempSyncButton.id = "sync-pick-list-button";
    pickListContainer.appendChild(tempSyncButton);*/
}

function getTeamData() {

    breakdownLines.style.display = "none";
    graphContainer.style.display = "none";
    pickListContainer.style.display = "none";
    overallGrid.style.display = "none";

    TABLE_TYPE = "team";
    rawTable.innerHTML = "";
    TEAM_COLUMNS = [];
    TEAM_ROWS = [];
    TEAM_FIELDS = [];

    var dataToKeep = [];
    var dCounter = 0;
    for (var i = 0; i < FIELDS.length; i++) {
        var dataType = new String(RECORDS[1][i]).substring(0, 1);
        if (RECORDS[1][i] == null) {
            dataType = 1;
        }
        if (detectCharacter(dataType) == 1 && FIELDS[i] != "Match Number" && !FIELDS[i].includes("Placement")) {
            dataToKeep[dCounter] = i - 1;
            dCounter++;
            TEAM_FIELDS.push(FIELDS[i]);
        }
    }
    console.log(dataToKeep);

    TEAMS = [];
    var tCounter = 0;
    for (var i = 0; i < RECORDS.length; i++) {
        if (!TEAMS.includes(RECORDS[i][TEAM_INDEX]) && RECORDS[i][TEAM_INDEX] != null && RECORDS[i][TEAM_INDEX] != "?") {
            TEAMS[tCounter] = RECORDS[i][TEAM_INDEX];
            tCounter++;
        }
    }

    TEAMS.sort((a, b) => a - b);
    console.log(TEAMS);

    for (var i = 0; i < dataToKeep.length; i++) {
        var tempC = document.createElement("div");
        tempC.className = "column";

        if (i % 2 == 1) {
            tempC.style.backgroundColor = "#4d4e4e";
        }

        var temp = document.createElement("div");
        var text = document.createElement("h3");
        if (dataToKeep[i] == -5) {
            //text.innerText = "Comments";
        } else {
            text.innerText = FIELDS[dataToKeep[i] + 1];
        }
        temp.appendChild(text);
        temp.className = "table-header-section-raw";
        temp.id = 9;
        temp.classList.add(`${(i)}`);
        //console.log(temp.classList);
        //temp.classList.add(h - 1);
        tempC.appendChild(temp);

        rawTable.appendChild(tempC);
    }

    for (var g = 0; g < dataToKeep.length + 1; g++) {
        TEAM_COLUMNS[g] = new Array();
    }

    for (var t = 0; t < TEAMS.length; t++) {
        TEAM_ROWS[t] = new Array();
    }

    for (var i = 0; i < TEAMS.length; i++) {
        var teamRows = [];
        var rCounter = 0;
        for (var t = 0; t < RECORDS.length; t++) {
            if (RECORDS[t][TEAM_INDEX] == TEAMS[i]) {
                teamRows[rCounter] = t;
                rCounter++;
            }
        }
        for (var c = 0; c < dataToKeep.length; c++) {
            var average = 0;
            for (var r = 0; r < teamRows.length; r++) {
                average += parseInt(RECORDS[teamRows[r]][dataToKeep[c] + 1]);
            }
            //console.log(average / teamRows.length);
            var tempData = document.createElement("div");
            tempData.className = "data-value";
            tempData.classList.add(i);
            tempData.id = i;
            if (c == 0) {
                if (c != 0) {
                    //tempData.innerText = "See Comments";
                } else {
                    tempData.innerText = Math.floor(average / teamRows.length * 10) / 10;
                }

                tempData.addEventListener("click", function () {
                    setRowHighlight(parseInt(this.classList[1]), true);
                    if (this.children.length > 0) {
                        closeTeamComments(this.id, parseInt(this.classList[1]), this);
                    } else {
                        openTeamComments(this.id, parseInt(this.classList[1]), this);
                    }
                });
            } else {
                tempData.innerText = Math.floor(average / teamRows.length * 10) / 10;
                tempData.addEventListener("click", function () {
                    setRowHighlight(parseInt(this.classList[1]), false);
                });
            }
            console.log(PICK_LIST_OBJECTS[PICK_LIST_TEAM_KEY.indexOf(String(TEAMS[i]))]);
            if (PICK_LIST_OBJECTS[PICK_LIST_TEAM_KEY.indexOf(String(TEAMS[i]))].getColor() != 0) {
                tempData.style.setProperty("color", `${teamColors[PICK_LIST_OBJECTS[PICK_LIST_TEAM_KEY.indexOf(String(TEAMS[i]))].getColor() - 1]}`, "important");
                //console.log(tempData.style.backgroundColor);
            }
            tempData.id = i;
            rawTable.children[c].appendChild(tempData);
            // Flashback to 2023 charged up lol
            if (true) {
                TEAM_COLUMNS[c][i] = Math.floor(average / teamRows.length * 10) / 10;
                TEAM_ROWS[i][c] = Math.floor(average / teamRows.length * 10) / 10;
            }
        }
        var tempComment = ""
        for (var q = 0; q < RECORDS.length; q++) {
            if (RECORDS[q][TEAM_INDEX] == TEAMS[i]) {
                //console.log(RECORDS[q][FIELDS.indexOf("Comments")]);
                tempComment += RECORDS[q][FIELDS.indexOf("Comments")] + "\n";
            }
        }
        TEAM_ROWS[i].push(tempComment);
        TEAM_COLUMNS[dataToKeep.length].push(tempComment);
        console.log(TEAM_COLUMNS)
    }
    //console.log(TEAM_ROWS);
    for (var i = 0; i < dataToKeep.length; i++) {
        document.getElementsByClassName("column")[i].children[0].onclick = function () {
            var commentsPreviouslyOpenedId = [];
            var commentsPreviouslyOpenedClass = [];
            var cols = document.getElementsByClassName("column");
            for (var i = 0; i < TEAMS.length; i++) {
                if (cols[0].children[i + 1].children.length > 0) {
                    commentsPreviouslyOpenedId.push(cols[0].children[i + 1].id);
                    commentsPreviouslyOpenedClass.push(cols[0].children[i + 1].classList[1]);
                    closeTeamComments(cols[0].children[i + 1].id, parseInt(cols[0].children[i + 1].classList[1]), cols[0].children[i + 1]);
                }
                for (var c = 0; c < cols.length; c++) {
                    cols[c].children[i + 1].style.backgroundColor = "#4d4e4e00";
                }
            }
            sortColumn(this.classList[1], detectCharacter(1), TEAM_ROWS, TEAM_COLUMNS, TEAM_FIELDS, true, true);
            for (var i = 0; i < TEAMS.length; i++) {
                if (commentsPreviouslyOpenedId.includes(cols[0].children[i + 1].id)) {
                    var tempIndex = commentsPreviouslyOpenedId.indexOf(cols[0].children[i + 1].id);
                    console.log(tempIndex);
                    openTeamComments(cols[0].children[i + 1].id, parseInt(cols[0].children[i + 1].classList[1]), cols[0].children[i + 1]);
                }
            }
            /*for (var i = 0; i < TEAMS.length; i++) {
                for (var i = 0; i < )
                    if (TEAM_ROWS[i][TEAM_INDEX] == originalTeam) {
                        this.id = i;
                        alert(i);
                    }
            }*/
        };
    }
    setRowHighlight(parseInt(localStorage.getItem("previousHighlightRow")), true);
    //localStorage.setItem("previousHighlightRow", originalHighlight);
}

function openTeamComments(id, oldId, element) {
    //alert(TEAM_COLUMNS[TEAM_FIELDS.indexOf("Comments")][id]);

    var commentLength = TEAM_ROWS[id][TEAM_FIELDS.length].split(/\r\n|\r|\n/).length - 1;

    var cols = document.getElementsByClassName("column");

    var tempComment = document.createElement("div");
    tempComment.innerText = TEAM_ROWS[id][TEAM_COLUMNS.length - 1];
    tempComment.classList.add("team-comments");
    element.appendChild(tempComment);

    for (var i = 0; i < cols.length; i++) {
        if (cols[i].children[parseInt(oldId) + 1] != element) {
            cols[i].children[parseInt(oldId) + 1].style.paddingBottom = `${tempComment.offsetHeight * 1 + (window.innerHeight * (0.8 / 100))}px`;
        }
        if (cols[i].children[parseInt(oldId) + 1] == element) {
        }
    }
    cols[0].children[parseInt(oldId) + 1].style.setProperty("border", "0.5vh solid #a8652d", "important");
    previousTeamComment = id;
}

function closeTeamComments(id, oldId, element) {
    //alert(TEAM_COLUMNS[TEAM_FIELDS.indexOf("Comments")][id]);
    var cols = document.getElementsByClassName("column");
    for (var i = 0; i < cols.length; i++) {
        if (cols[i].children[parseInt(oldId) + 1] != element) {
            cols[i].children[parseInt(oldId) + 1].style.paddingBottom = `0`;
        }
    }
    var tempText = TEAMS[id];
    element.innerHTML = "";
    element.innerText = tempText;
    previousTeamComment = -1;
    cols[0].children[parseInt(oldId) + 1].style.setProperty("border", "0vh solid #a8652d", "important");
}

function getTBA(url, type) {
    breakdownLines.style.display = "none";
    pickListContainer.style.display = "none";
    graphContainer.style.display = "none";

    fetch(url, options)
        .then((response) => response.json())
        .then((json) => {
            if (type == 0) {
                TBA_EVENT_KEYS = json;
            } else if (type == 1) {
                console.log(json.length);
                eventSelect.innerHTML = "";
                for (var i = 0; i < json.length; i++) {
                    TBA_EVENT_NAMES[i] = json[i].name;
                    var tempO = document.createElement("option");
                    tempO.innerText = json[i].name;
                    tempO.value = json[i].key;
                    if (json[i].key == localStorage.getItem("event-key")) {
                        tempO.selected = "selected";
                    }
                    eventSelect.appendChild(tempO);
                    if (TBA_EVENT_NAMES[i].length > 25) {
                        TBA_EVENT_NAMES[i] = TBA_EVENT_NAMES[i].substring(0, 25);
                    }
                }
            } else if (type == 2) {
                //console.log(json);
                getTBAOPRS(json);
            }
        });
}

function getTBAOPRS(json) {
    rawTable.innerHTML = "";
    for (var h = 0; h < 4; h++) {
        var col = document.createElement("div");
        var temp = document.createElement("div");

        var text = document.createElement("h3");
        temp.appendChild(text);

        temp.className = "table-header-section-raw";

        temp.id = 1;
        temp.classList.add(`${(h)}`);
        //console.log(temp.classList);
        //temp.classList.add(h - 1);
        temp.onclick = function () { sortColumn(this.classList[1], detectCharacter(this.id), COLUMNS, false) };

        col.className = "column";
        if (h % 2 == 0) {
            col.style.backgroundColor = "#4d4e4e";
        }
        col.appendChild(temp);
        rawTable.appendChild(col);
    }

    for (var i = 0; i < 4; i++) {
        rawTable.children[i].children[0].innerText = oprHeaders[i];
    }

    localStorage.setItem("direction", 0);
    localStorage.setItem("column", -1);

    //var tempArray = JSON.parse(json);
    //console.log(tempArray);

    var entries = Object.entries(json);

    console.log(Object.entries(Object.entries(entries[0])[1][1])[1][0]);
    console.log(entries[0]);

    for (var i = 0; i < Object.entries(Object.entries(entries[0])[1][1]).length; i++) {
        var temp = document.createElement("div");
        var teamCode = Object.entries(Object.entries(entries[0])[1][1])[i][0];
        temp.className = "data-value"
        temp.innerText = teamCode.substring(3);
        rawTable.children[0].appendChild(temp);
    }

    for (var headerKey = 0; headerKey < 3; headerKey++) {
        //console.log(Object.keys(keys[headerKey]));
        var innerEntries = Object.entries(Object.entries(entries[headerKey])[1][1]);
        console.log(innerEntries);
        for (var innerKey = 0; innerKey < innerEntries.length; innerKey++) {
            console.log(innerEntries[innerKey]);
            var temp = document.createElement("div");
            temp.className = "data-value"
            temp.innerText = Math.floor(innerEntries[innerKey][1] * 100) / 100;
            rawTable.children[headerKey + 1].appendChild(temp);
        }
    }
}

function getTBATeams() {
    console.log(eventSelect.value);
    getTBA(`https://www.thebluealliance.com/api/v3/event/${eventSelect.value}/oprs`, 2);
}

async function toggleSettings() {
    settingsOpen = !settingsOpen;
    if (settingsOpen) {
        settings.style.display = "flex";
        body.style.overflow = "hidden";
        //var eventOptions = new Array();
        console.log(TBA_EVENT_NAMES);
    } else {
        settings.style.display = "none";
        body.style.overflow = "auto";
        localStorage.setItem("event-key", eventSelect.value);
        localStorage.setItem("spreadsheet-url", urlInput.value);
    }
}