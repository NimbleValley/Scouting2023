var tl = new TimelineMax();

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
const overallCategoryHeaders = ["Points", "Gp Moved", "Gp Points", "Auto Points", "Tele Points", "Auto %", "Charge %", "Cubes Moved", "Cones Moved", "High Gp", "Mid Gp", "Low Gp"];

const frcGrid = document.getElementById("grid-frc");
var gridNodes = document.getElementsByClassName("node-item");

if (localStorage.getItem("spreadsheet-url") == null) {
    urlInput.value = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6jLs728hFBfOHguzmWfDBGNNMSBCHlDCFpSccKipRI5TvtprN05ERYwJFYBQEmpbMx6hSJlUF2BVY/pub?gid=1743760764&single=true&output=csv";
} else {
    urlInput.value = localStorage.getItem("spreadsheet-url");
}

const rawTable = document.getElementById("data-table");
//API Fetch Response
var DATA;
//Headers
var FIELDS = new Array();
//Records, value data
var RECORDS = new Array();
//Records sorted into columns for filtering & sorting
var COLUMNS = new Array();

var TEAM_COLUMNS = new Array();
var TEAM_ROWS = new Array();
var TEAMS = new Array();

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
const TEAM_INDEX = 1;
const GRID_INDEX = 4;

const oprHeaders = ["Team", "CCWMS", "DPR", "OPR"];

getData();

function getData() {
    breakdownLines.style.display = "none";
    CSV.fetch({
        //url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQNEBYTlOcDv1NuaCd5U-55q2czmUc-HgvNKnaRDxkkL9J39MD_ht2-6GKY4jX3bipv7dONBcUVCpU_/pub?gid=1955868836&single=true&output=csv'
        url: urlInput.value
    }
    ).done(function (dataset) {
        //console.log(dataset.records);
        DATA = dataset;
        FIELDS = dataset.fields;
        RECORDS = dataset.records;
        //Delete Time stamps
        for (var i = 0; i < RECORDS.length; i++) {
            RECORDS[i].splice(0, 1);
        }
        FIELDS.splice(0, 1);

        //var tableHeader = document.createElement("div");
        //tableHeader.id = "raw-table";
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
            temp.onclick = function () { sortColumn(this.classList[1], detectCharacter(this.id), RECORDS, COLUMNS) };

            col.className = "column";
            if (h % 2 == 0) {
                col.style.backgroundColor = "#4d4e4e";
            }
            col.appendChild(temp);
            rawTable.appendChild(col);
        }

        localStorage.setItem("direction", 0);
        localStorage.setItem("column", -1);

        for (var i = 0; i < RECORDS.length; i++) {
            for (var s = 0; s < RECORDS[i].length; s++) {
                COLUMNS[s][i] = RECORDS[i][s];
                //console.log(RECORDS[i][s]);
                var temp = document.createElement("div");
                temp.className = "data-value"
                if (s == GRID_INDEX) {
                    temp.innerText = "{ Show Grid }";
                    temp.id = i;
                    temp.onclick = function () { showGrid(this.id) }
                } else {
                    temp.innerText = RECORDS[i][s];
                }
                rawTable.children[s].appendChild(temp);
            }
        }
        openTeamOveralls();
        breakdownLines.style.display = "flex";
    });
}

function resetRaw() {
    breakdownLines.style.display = "none";
    rawTable.innerHTML = "";

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
        temp.onclick = function () { sortColumn(this.classList[1], detectCharacter(this.id), RECORDS, COLUMNS) };

        col.className = "column";
        if (h % 2 == 0) {
            col.style.backgroundColor = "#4d4e4e";
        }
        col.appendChild(temp);
        rawTable.appendChild(col);
    }

    localStorage.setItem("direction", 0);
    localStorage.setItem("column", -1);

    for (var i = 0; i < RECORDS.length; i++) {
        for (var s = 0; s < RECORDS[i].length; s++) {
            COLUMNS[s][i] = RECORDS[i][s];
            //console.log(RECORDS[i][s]);
            var temp = document.createElement("div");
            temp.className = "data-value"
            if (s == GRID_INDEX) {
                temp.innerText = "{ Show Grid }";
                temp.id = i;
                temp.onclick = function () { showGrid(this.id) }
            } else {
                temp.innerText = RECORDS[i][s];
            }
            rawTable.children[s].appendChild(temp);
        }
    }
}

function showGrid(recordNum) {
    breakdownLines.style.display = "none";
    body.style.overflow = "hidden";
    frcGrid.style.display = "flex";

    var nodeData = JSON.parse(RECORDS[recordNum][GRID_INDEX]);

    for (var i = 0; i < gridNodes.length; i++) {
        //console.log(nodeData[Math.floor(i/9)][i%9]);
        gridNodes[i].style.backgroundColor = "#797979";
        if (nodeData[Math.floor(i / 9)][i % 9] == 1) {
            if (i % 3 == 1) {
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
}

function openTeamOveralls() {
    breakdownLines.innerText = "";
    if (TEAMS.length < 1) {
        getTeamData();
    }
    rawTable.innerHTML = "";
    var temp = document.createElement("select");
    temp.id = "team-overall-select";
    for (var i = 0; i < TEAMS.length; i++) {
        var op = document.createElement("option");
        op.text = TEAMS[i];
        op.value = TEAMS[i];
        temp.append(op);
    }

    rawTable.appendChild(temp);
    breakdownLines.style.display = "flex";

    console.log(TEAM_COLUMNS);
    var overallData = [];
    for (var i = 0; i < overallCategoryHeaders.length; i++) {
        // Sort the column, return the index that was matched up with the data
        console.log(getSortedIndex(3, 456, TEAM_ROWS, TEAM_COLUMNS));
    }

    for (var i = 0; i < overallCategoryHeaders.length; i++) {
        var tempContainer = document.createElement("div");
        tempContainer.className = "line-container";

        var tempLine = document.createElement("div");
        tempLine.className = "breakdown-line";

        var temph4 = document.createElement("h4");
        temph4.innerText = overallCategoryHeaders[i];

        tempContainer.appendChild(tempLine);
        tempContainer.appendChild(temph4);
        breakdownLines.appendChild(tempContainer);
    }
}

function getSortedIndex(colNum, team, records, columns) {
    var sortedColumn = JSON.parse(JSON.stringify(columns));
    sortedColumn = sortedColumn[colNum].sort(function (a, b) { return a - b });

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

    return sortedRows;
}

function sortColumn(colNum, type, records, columns) {
    var direction = parseInt(localStorage.getItem("direction"));
    var previousColumn = parseInt(localStorage.getItem("column"));
    localStorage.setItem("column", colNum);
    localStorage.setItem("direction", parseInt(direction) + 1);
    if (previousColumn != colNum) {
        direction = 0;
        localStorage.setItem("direction", 1);
    }

    if (type == 1) {
        var sortedColumn = JSON.parse(JSON.stringify(columns));
        //console.log(dir);
        if (direction % 3 == 0) {
            sortedColumn = sortedColumn[colNum].sort(function (a, b) { return a - b });
        } else if (direction % 3 == 1) {
            sortedColumn = sortedColumn[colNum].sort(function (a, b) { return b - a });
        } else {
            originalSort(records, columns);
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
            for (var s = 0; s < records[i].length - 1; s++) {
                //console.log(RECORDS[i][s]);
                var tempCol = cols[s];
                var temp = tempCol.children[i + 1];
                if (s == GRID_INDEX) {
                    temp.innerText = "{ Show Grid }";
                    temp.id = previousRows[i];
                    temp.onclick = function () { showGrid(this.id) }
                } else {
                    temp.innerText = sortedRows[i][s];
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

function originalSort(record, column) {
    var cols = document.getElementsByClassName("column");
    for (var x = 0; x < record.length; x++) {
        for (var y = 0; y < record[x].length - 1; y++) {
            //console.log(RECORDS[i][s]);
            var tempCol = cols[y];
            var temp = tempCol.children[x + 1];
            if (y == GRID_INDEX) {
                temp.innerText = "{ Show Grid }";
                temp.id = x;
                temp.onclick = function () { showGrid(this.id) }
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
        tl.to(openSidebarButton, { scale: "-1, 1", duration: 0.5, ease: "power2" }, "-=0.5");
    } else {
        tl.to(sidebar, { left: "-25vh", duration: 0.5, ease: "power2" });
        //tl.to(rawTable, { marginLeft: "3vw", duration: 0.5, ease: "power2"}, "-=0.5");
        tl.to(openSidebarButton, { scale: "1, 1", duration: 0.5, ease: "power2" }, "-=0.5");
    }
}

function refreshData() {
    rawTable.innerHTML = "";
    getData();
}

function getTeamData() {
    breakdownLines.style.display = "none";
    TABLE_TYPE = "team";
    rawTable.innerHTML = "";
    TEAM_COLUMNS = [];
    TEAM_ROWS = [];

    var dataToKeep = [];
    var dCounter = 0;
    for (var i = 1; i < FIELDS.length; i++) {
        var dataType = new String(RECORDS[1][i]).substring(0, 1);
        if (RECORDS[1][i] == null) {
            dataType = 1;
        }
        if (detectCharacter(dataType) == 1 && FIELDS[i] != "Match Number") {
            dataToKeep[dCounter] = i - 1;
            dCounter++;
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

        var temp = document.createElement("div");
        var text = document.createElement("h3");
        text.innerText = FIELDS[dataToKeep[i] + 1];
        temp.appendChild(text);
        temp.className = "table-header-section-raw";
        temp.id = 9;
        temp.classList.add(`${(i)}`);
        //console.log(temp.classList);
        //temp.classList.add(h - 1);
        temp.onclick = function () { sortColumn(this.classList[1], detectCharacter(this.id), teamRows, TEAM_COLUMNS) };
        tempC.appendChild(temp);

        rawTable.appendChild(tempC);
    }

    for (var g = 0; g < dataToKeep.length; g++) {
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
                average += RECORDS[teamRows[r]][dataToKeep[c] + 1];
            }
            //console.log(average / teamRows.length);
            var tempData = document.createElement("div");
            tempData.className = "data-value";
            tempData.innerText = Math.floor(average / teamRows.length * 10) / 10;
            rawTable.children[c].appendChild(tempData);
            TEAM_COLUMNS[c][i] = Math.floor(average / teamRows.length * 10) / 10;
            TEAM_ROWS[i][c] = Math.floor(average / teamRows.length * 10) / 10;
        }
    }
    //console.log(TEAM_ROWS);
    for (var i = 0; i < dataToKeep.length; i++) {
        document.getElementsByClassName("column")[i].children[0].onclick = function () { sortColumn(this.classList[1], detectCharacter(this.id), TEAM_ROWS, TEAM_COLUMNS) };
    }
}

function getTBA(url, type) {
    breakdownLines.style.display = "none";
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
        temp.onclick = function () { sortColumn(this.classList[1], detectCharacter(this.id), COLUMNS) };

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