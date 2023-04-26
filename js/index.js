var tl = new TimelineMax();

const sidebar = document.getElementById("sidebar");
const openSidebarButton = document.getElementById("open-sidebar");
var sidebarOpen = false;

const rawTable = document.getElementById("data-table");
//API Fetch Response
var DATA;
//Headers
var FIELDS;
//Records, value data
var RECORDS;
//Records sorted into columns for filtering & sorting
var COLUMNS = new Array();
var TEAM_COLUMNS = new Array();
var TEAM_ROWS = new Array();

var TABLE_TYPE = "raw";
var TEAMS;

//CHANGE THIS --------------------------
var TEAM_INDEX = 2;

getData();

function getData() {
    CSV.fetch({
        //url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQNEBYTlOcDv1NuaCd5U-55q2czmUc-HgvNKnaRDxkkL9J39MD_ht2-6GKY4jX3bipv7dONBcUVCpU_/pub?gid=1955868836&single=true&output=csv'
        url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6jLs728hFBfOHguzmWfDBGNNMSBCHlDCFpSccKipRI5TvtprN05ERYwJFYBQEmpbMx6hSJlUF2BVY/pub?gid=1743760764&single=true&output=csv'
    }
    ).done(function (dataset) {
        //console.log(dataset.records);
        DATA = dataset;
        FIELDS = dataset.fields;
        RECORDS = dataset.records;

        //var tableHeader = document.createElement("div");
        //tableHeader.id = "raw-table";
        for (var h = 1; h < FIELDS.length; h++) {
            COLUMNS[h - 1] = new Array();
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
            temp.classList.add(`${(h - 1)}`);
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

        localStorage.setItem("direction", 0);
        localStorage.setItem("column", -1);

        for (var i = 0; i < RECORDS.length; i++) {
            for (var s = 1; s < RECORDS[i].length; s++) {
                COLUMNS[s - 1][i] = RECORDS[i][s];
                //console.log(RECORDS[i][s]);
                var temp = document.createElement("div");
                temp.className = "data-value"
                temp.innerText = RECORDS[i][s];
                rawTable.children[s - 1].appendChild(temp);
            }
        }
    });
}

function sortColumn(colNum, type, col) {
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
        var sortedColumn = JSON.parse(JSON.stringify(COLUMNS));
        //console.log(dir);
        if (direction % 3 == 0) {
            sortedColumn = sortedColumn[colNum].sort(function (a, b) { return a - b });
        } else if (direction % 3 == 1) {
            sortedColumn = sortedColumn[colNum].sort(function (a, b) { return b - a });
        } else {
            originalSort(RECORDS, COLUMNS);
            return;
        }

        var sortedRows = [];
        var takenRows = [];
        var counter = 0;

        var tempColumns = JSON.parse(JSON.stringify(COLUMNS));

        for (var r = 0; r < RECORDS.length; r++) {
            for (var i = 0; i < tempColumns[0].length; i++) {
                //console.log(tempColumns[colNum][i]);
                //console.log(takenRows.includes(i));
                if (COLUMNS[colNum][i] == sortedColumn[r] && !takenRows.includes(i)) {
                    sortedRows[counter] = RECORDS[i];
                    takenRows[counter] = i;
                    counter++;
                    break;
                }
            }
        }

        var cols = document.getElementsByClassName("column");
        for (var i = 0; i < RECORDS.length; i++) {
            for (var s = 0; s < RECORDS[i].length - 1; s++) {
                //console.log(RECORDS[i][s]);
                var tempCol = cols[s];
                var temp = tempCol.children[i + 1];
                temp.innerText = sortedRows[i][s + 1];
            }
        }

    } else {
        console.log("Sad");
    }
}

// FOR TEAMS --------------------------------------------------

function sortTeamColumn(colNum, type, col, dk) {
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
}

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
            temp.innerText = column[y][x];
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

function getRawData() {
    TABLE_TYPE = "raw";
    rawTable.innerHTML = "";
    getData();
}

function getTeamData() {
    TABLE_TYPE = "team"
    rawTable.innerHTML = "";
    getTeamData();
}

function getTeamData() {
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
        temp.id = 1;
        temp.classList.add(`${(i)}`);
        //console.log(temp.classList);
        //temp.classList.add(h - 1);
        temp.onclick = function () { sortTeamColumn(this.classList[1], detectCharacter(this.id), TEAM_COLUMNS, dataToKeep) };
        tempC.appendChild(temp);

        rawTable.appendChild(tempC);
    }

    for(var g = 0; g < dataToKeep.length; g ++) {
        TEAM_COLUMNS[g] = new Array();
    }

    for(var t = 0; t < TEAMS.length; t ++) {
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
    console.log(TEAM_ROWS);
}