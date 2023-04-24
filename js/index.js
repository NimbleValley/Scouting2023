const rawTable = document.getElementById("raw-table");
//API Fetch Response
var DATA;
//Headers
var FIELDS;
//Records, value data
var RECORDS;
//Records sorted into columns for filtering & sorting
var COLUMNS = new Array();

getData();

function getData() {
    CSV.fetch({
        url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQNEBYTlOcDv1NuaCd5U-55q2czmUc-HgvNKnaRDxkkL9J39MD_ht2-6GKY4jX3bipv7dONBcUVCpU_/pub?gid=1955868836&single=true&output=csv'
        //url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6jLs728hFBfOHguzmWfDBGNNMSBCHlDCFpSccKipRI5TvtprN05ERYwJFYBQEmpbMx6hSJlUF2BVY/pub?gid=1743760764&single=true&output=csv'
    }
    ).done(function (dataset) {
        //console.log(dataset.records);
        DATA = dataset;
        FIELDS = dataset.fields;
        RECORDS = dataset.records;

        var tableHeader = document.createElement("div");
        tableHeader.id = "raw-table";
        for (var h = 1; h < FIELDS.length; h++) {
            COLUMNS[h - 1] = new Array();
            var col = document.createElement("div");
            var temp = document.createElement("div");

            var text = document.createElement("h3");
            text.innerText = FIELDS[h];
            temp.appendChild(text);

            temp.className = "table-header-section-raw";

            console.log(RECORDS[1][h]);
            var dataType = new String(RECORDS[1][h]).substring(0, 1);
            if(RECORDS[1][h] == null) {
                dataType = 1;
            }
            temp.id = dataType;
            temp.classList.add(`${(h - 1)}`);
            console.log(temp.classList);
            //temp.classList.add(h - 1);
            temp.onclick = function () { sortColumn(this.classList[1], detectCharacter(this.id)) };

            col.className = "column";
            if (h % 2 == 0) {
                col.style.backgroundColor = "#4d4e4e";
            }
            col.appendChild(temp);
            tableHeader.appendChild(col);
        }

        localStorage.setItem("direction", 0);
        localStorage.setItem("column", -1);

        rawTable.appendChild(tableHeader);


        for (var i = 0; i < RECORDS.length; i++) {
            for (var s = 1; s < RECORDS[i].length; s++) {
                COLUMNS[s - 1][i] = RECORDS[i][s];
                //console.log(RECORDS[i][s]);
                var temp = document.createElement("div");
                temp.className = "data-value"
                temp.innerText = RECORDS[i][s];
                tableHeader.children[s - 1].appendChild(temp);
            }
        }
    });
}

function sortColumn(colNum, type) {
    var direction = parseInt(localStorage.getItem("direction"));
    console.log(direction);
    var previousColumn = parseInt(localStorage.getItem("column"));
    localStorage.setItem("column", colNum);
    localStorage.setItem("direction", parseInt(direction) + 1);
    if(previousColumn != colNum) {        
        direction = 0;
        localStorage.setItem("direction", 1);
    }

    if (type == 1) {
        var sortedColumn = JSON.parse(JSON.stringify(COLUMNS));
        //console.log(dir);
        if (direction % 3 == 0) {
            sortedColumn = sortedColumn[colNum].sort(function (a, b) { return a - b });
        } else if(direction % 3 == 1) {
            sortedColumn = sortedColumn[colNum].sort(function (a, b) { return b - a });
        } else {
            originalSort();
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

function detectCharacter(val) {
    console.log(val);
    if (val == "0" || val == "1" || val == "2" || val == "3" || val == "4" || val == "5" || val == "6" || val == "7" || val == "8" || val == "9") {
        return 1;
    }
    return 0;
}

function originalSort() {
    var cols = document.getElementsByClassName("column");
        for (var x = 0; x < RECORDS.length; x++) {
            for (var y = 0; y < RECORDS[x].length - 1; y++) {
                //console.log(RECORDS[i][s]);
                var tempCol = cols[y];
                var temp = tempCol.children[x + 1];
                temp.innerText = COLUMNS[y][x];
            }
        }
}