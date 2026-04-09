let charts = {};

const biomedicine = [

    { name: "COVAXIN", type: "vaccine", limit: 1000 },
    { name: "iNCOVACC", type: "vaccine", limit: 1000 },
    { name: "Typbar TCV", type: "vaccine", limit: 1000 },
    { name: "ROTAVAC", type: "vaccine", limit: 1000 },
    { name: "JENVAC", type: "vaccine", limit: 1000 },
    { name: "Chirorab", type: "vaccine", limit: 1000 },
    { name: "Hillchol", type: "vaccine", limit: 1000 },
    { name: "Biopolio", type: "vaccine", limit: 1000 },
    { name: "Revac-B+", type: "vaccine", limit: 1000 },
    { name: "Comvac", type: "vaccine", limit: 1000 },
    { name: "HNVAC", type: "vaccine", limit: 1000 },
    { name: "Malcovax", type: "vaccine", limit: 1000 }

];

const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
let currentData = [];
let selectedDate = null;
let currentDate = new Date();

function renderCalendar() {

    calendar.innerHTML = "";

    let year = currentDate.getFullYear();
    let month = currentDate.getMonth();

    monthYear.innerText = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

    let firstDay = new Date(year, month, 1).getDay();
    let lastDate = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        calendar.innerHTML += "<div></div>";
    }

    for (let d = 1; d <= lastDate; d++) {

        let day = document.createElement("div");

        day.classList.add("day");

        day.innerText = d;

        day.onclick = () => {

            selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

            highlightDay(day);

            loadProduction();

        };

        calendar.appendChild(day);

    }

}

renderCalendar();

function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    selectedDate = null;
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    selectedDate = null;
    renderCalendar();
}

function highlightDay(selected) {

    document.querySelectorAll(".day").forEach(d => {

        d.style.background = "#e6efff";
        d.style.color = "black";

    });

    selected.style.background = "#1f6ed4";
    selected.style.color = "white";

}

async function loadProduction() {

    if (!selectedDate) {
        alert("Please select a date");
        return;
    }

    let res = await fetch(`/api/biotech-production?date=${selectedDate}`);

    let data = await res.json();
    currentData = data;
    if (!data || data.length === 0) {

        console.log("No production data");

        // CLEAR CHARTS
        document.getElementById("med1").innerText = "No Data";
        document.getElementById("med2").innerText = "";
        document.getElementById("med3").innerText = "";
        document.getElementById("med4").innerText = "";

        return;
    }
    ["chart1", "chart2", "chart3", "chart4"].forEach(id => {
        if (charts[id]) {
            charts[id].destroy();
        }
    });

    if (data[0]) updateChart(data[0], "med1", "chart1");
    if (data[1]) updateChart(data[1], "med2", "chart2");
    if (data[2]) updateChart(data[2], "med3", "chart3");
    if (data[3]) updateChart(data[3], "med4", "chart4");

}

function updateChart(med, medId, chartId) {

    document.getElementById(medId).innerText = med.medicine;
    let percent = Math.round((med.production / med.limit) * 100);

    let ctx = document.getElementById(chartId);

    if (charts[chartId]) {
        charts[chartId].destroy();
    }

    charts[chartId] = new Chart(ctx, {

        type: "pie",

        data: {
            labels: [`Produced (${percent}%)`, `Remaining (${100 - percent}%)`],
            datasets: [{
                data: [percent, 100 - percent],
                backgroundColor: ["#2ecc71", "#dfe6e9"]
            }]
        },

        options: {
            plugins: {
                legend: {
                    position: "bottom"
                }
            }
        }

    });

}

async function addProduction() {
    console.log("Add production button clicked");

    if (!selectedDate) {
        alert("Please select a date first");
        return;
    }
    let medicineName = document.getElementById("medicine").value;
    let qty = document.getElementById("productionQty").value;

    if (!qty) {
        alert("Enter production quantity");
        return;
    }

    let med = biomedicine.find(m => m.name === medicineName);

    let productionData = {
        medicine: medicineName,
        type: med.type,
        production: Number(qty),
        limit: med.limit,
        date: selectedDate
    };

    let url = "/api/biotech-production";
    let method = "POST";

    let res = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(productionData)
    });


    let result = await res.json();

    alert("Production saved successfully");   // shows "Biotech Production saved successfully"

    // reload charts
    setTimeout(() => {
        loadProduction();
    }, 500);

}
