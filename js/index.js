const rawTable = document.getElementById("raw-table");
var DATA;
var FIELDS;

getData();

function getData() {
    CSV.fetch({
        url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQNEBYTlOcDv1NuaCd5U-55q2czmUc-HgvNKnaRDxkkL9J39MD_ht2-6GKY4jX3bipv7dONBcUVCpU_/pub?gid=1955868836&single=true&output=csv'
    }
    ).done(function (dataset) {
        // dataset object doc'd below
        console.log(dataset.fields);
        DATA = dataset;
        FIELDS = dataset.fields;

        var tableHeader = document.createElement("div");
        tableHeader.id = "table-header-raw";
        FIELDS.forEach(element => {
            var temp = document.createElement("th");
            var text = document.cre
            temp.className = "table-header-section-raw"
            tableHeader.appendChild(temp);
        });
        rawTable.appendChild(tableHeader);
    });
}