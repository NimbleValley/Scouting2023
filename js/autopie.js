function runAutoPie(autoTypes, autoSuccess) {
    const autoNames = ["A1pC", "A1pCM", "A2pCM", "A3pCM", "A1p", "A1pM","A2pM", "A3pM", "A", "AM", "AC", "ACM"];
    const autoNameKeys = ["1P with Charge", "1P with Charge & Mobility", "2P with Charge and Mobility", "3P with Charge and Mobility", "1 Piece", "1P with Mobility", "2P with Mobility", "3P with Mobility", "No auto", "Only Mobility", "Only Charge", "Charge with Mobility"];

    let fillColors = ["#D62828", "#F77F00", "#FCBF49", "#9e997b", "#ffffff", "#ffea00"];

    let autoNumbers = [];
    let autoKeys = [];
    let autoWork = [];
    for (var i = 0; i < autoTypes.length; i++) {
        if (!autoKeys.includes(autoTypes[i])) {
            autoKeys.push(autoTypes[i]);
            autoNumbers.push(1);
            autoWork.push(autoSuccess[i]);
        } else {
            autoNumbers[autoKeys.indexOf(autoTypes[i])]++;
            autoWork[autoKeys.indexOf(autoTypes[i])] += autoSuccess[i];
        }
    }

    const canvas = document.getElementById("auto-pie-chart");
    canvas.width = window.innerHeight * (3 / 10);
    canvas.height = window.innerHeight * (3 / 10);
    const ctx = canvas.getContext("2d");

    let percentOn = 0;
    for (var i = 0; i < autoKeys.length; i++) {
        let addFactor = (autoNumbers[i] / parseFloat(autoTypes.length));
        console.log(addFactor);

        let consistencyRate = autoWork[i] / parseFloat(autoNumbers[i]);
        if (consistencyRate < 0.1) {
            consistencyRate = 0.1;
        }

        ctx.beginPath();
        ctx.arc(canvas.width * (1 / 2), canvas.height * (1 / 2), consistencyRate * canvas.height * (1 / 2), percentOn * (Math.PI * 2), (addFactor * (Math.PI * 2)) + (percentOn * (Math.PI * 2)));
        ctx.fillStyle = fillColors[i%6];
        ctx.lineTo(canvas.width * (1 / 2), canvas.height * (1 / 2));
        ctx.fill();

        percentOn += addFactor;
    }
    ctx.beginPath();

    ctx.lineWidth = window.innerHeight / 200;
    ctx.strokeStyle = "#555555";
    ctx.arc(canvas.width * (1 / 2), canvas.height * (1 / 2), canvas.height * (1 / 2.025), 0, (Math.PI * 2));
    ctx.stroke();

    let tempAutoDescriptionContainer = document.createElement("div");
    tempAutoDescriptionContainer.id = "breakdown-auto-values-container";

    for(var i = 0; i < autoKeys.length; i ++) {
        let tempAutoDescription = document.createElement("p");
        tempAutoDescription.className = "auto-breakdown-description";
        tempAutoDescription.innerText = `${autoNameKeys[autoNames.indexOf(autoKeys[i])]}: ${autoWork[i]}/${autoNumbers[i]}`;
        tempAutoDescription.style.color = fillColors[i%6];

        tempAutoDescriptionContainer.appendChild(tempAutoDescription);
    }

    document.getElementById("breakdown-auto-container").appendChild(tempAutoDescriptionContainer);
}