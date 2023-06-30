function runAutoPie(autoTypes, autoSuccess) {
    const canvas = document.getElementById("auto-pie-chart");
    canvas.width = window.innerHeight * (3/10);
    canvas.height = window.innerHeight * (3/10);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "green";
    ctx.arc(canvas.width * (1/2), canvas.height * (1/2), canvas.height*(1/2), 0, Math.PI * 2);
    ctx.fill();
}