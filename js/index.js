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
        url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6jLs728hFBfOHguzmWfDBGNNMSBCHlDCFpSccKipRI5TvtprN05ERYwJFYBQEmpbMx6hSJlUF2BVY/pub?gid=1743760764&single=true&output=csv'
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
            var temp = document.createElement("th");

            var text = document.createElement("h3");
            text.innerText = FIELDS[h];
            temp.appendChild(text);

            temp.className = "table-header-section-raw";

            var dataType = new String(RECORDS[0][h]).substring(0, 1);
            temp.id = dataType;
            temp.classList.add(h - 1);
            temp.onclick = function () { sortColumn(this.classList[1], detectCharacter(this.id)) };

            col.className = "column";
            if (h % 2 == 0) {
                col.style.backgroundColor = "#4d4e4e";
            }
            col.appendChild(temp);
            tableHeader.appendChild(col);
        }
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
    if (type == 1) {

        var sortedColumn = JSON.parse(JSON.stringify(COLUMNS));
        sortedColumn = sortedColumn[colNum].sort(function (a, b) { return a - b });
        console.log(sortedColumn);

        var sortedRows = [];
        var takenRows = [];
        var counter = 0;
        for (var r = 0; r < RECORDS.length; r++) {
            for (var i = 0; i < COLUMNS[0].length; i++) {
                console.log(COLUMNS[colNum][i]);
                if (COLUMNS[colNum][i] == sortedColumn[r] && !takenRows.includes(i)) {
                    sortedRows[counter] = RECORDS[i];
                    counter++;
                    break;
                }
            }
        }

        var cols = document.getElementsByClassName("column");
        for (var i = 0; i < RECORDS.length; i++) {
            for (var s = 0; s < RECORDS[i].length-1; s++) {
                //console.log(RECORDS[i][s]);
                var tempCol = cols[s];
                var temp = tempCol.children[i + 1];
                temp.innerText = sortedRows[i][s+1];
            }
        }

    } else {

    }
}

function detectCharacter(val) {
    if (val == "0" || val == "1" || val == "2" || val == "3" || val == "4" || val == "5" || val == "6" || val == "7" || val == "8" || val == "9") {
        return 1;
    }
    return 0;
}