let charts = {};   // store chart instances

const medicines = [
    { name: "Dolo-650", type: "tablet", limit: 5000 },
    { name: "Sucralsain", type: "tablet", limit: 5000 },
    { name: "Dolo-650", type: "tablet", limit: 5000 },
    { name: "Paracetamol", type: "tablet", limit: 5000 },
    { name: "Multivitamin", type: "tablet", limit: 5000 },
    { name: "Becovit-z syrup", type: "syrup", limit: 1000 },
    { name: "Metformin", type: "tablet", limit: 5000 },
    { name: "Cetirizine", type: "tablet", limit: 5000 },
    { name: "Ciprofloxacin", type: "syrup", limit: 1000 },
    { name: "Aspirin", type: "tablet", limit: 5000 },
    { name: "Pantoprazole", type: "tablet", limit: 5000 },
    { name: "Azithromycin", type: "tablet", limit: 5000 },
    { name: "Mephtol", type: "tablet", limit: 5000 },
    { name: "Netcold", type: "syrup", limit: 1000 },
    { name: "Swich 100", type: "syrup", limit: 1000 },
    { name: "Levocetirizine 5mg", type: "tablet", limit: 5000 }
];

/* CALENDAR */

const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");

let currentDate = new Date();
let selectedDate = null;

function renderCalendar() {

    calendar.innerHTML = "";

    let year = currentDate.getFullYear();
    let month = currentDate.getMonth();

    monthYear.innerText =
        currentDate.toLocaleString("default", { month: "long", year: "numeric" });

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

            selectedDate =
                `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

            highlightDay(day);

            loadProduction();

        };

        calendar.appendChild(day);
    }
}

renderCalendar();


/* MONTH NAVIGATION */

function prevMonth() {

    currentDate.setMonth(currentDate.getMonth() - 1);

    renderCalendar();
}

function nextMonth() {

    currentDate.setMonth(currentDate.getMonth() + 1);

    renderCalendar();
}


/* HIGHLIGHT SELECTED DATE */

function highlightDay(selected) {

    document.querySelectorAll(".day").forEach(d => {

        d.style.background = "#e6efff";
        d.style.color = "black";

    });

    selected.style.background = "#1f6ed4";
    selected.style.color = "white";
}


/* LOAD PRODUCTION */

async function loadProduction() {

    if (!selectedDate) {

        alert("Please select a date");
        return;
    }

    let res = await fetch(`/api/production?date=${selectedDate}`);

    let data = await res.json();

    if (!data || data.length === 0) {

        alert("No production data found");
        return;
    }

    if (data[0]) updateChart(data[0], "med1", "chart1");
    if (data[1]) updateChart(data[1], "med2", "chart2");
    if (data[2]) updateChart(data[2], "med3", "chart3");
    if (data[3]) updateChart(data[3], "med4", "chart4");
}


/* UPDATE PIE CHART */

function updateChart(med, medId, chartId) {

    if (!med) return;

    document.getElementById(medId).innerText = med.medicine;

    let percent = Math.round((med.production / med.limit) * 100);

    let ctx = document.getElementById(chartId);

    if (charts[chartId]) {
        charts[chartId].destroy();
    }

    charts[chartId] = new Chart(ctx, {

        type: "pie",

        data: {
            labels: [
                `Produced (${percent}%)`,
                `Remaining (${100 - percent}%)`
            ],

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


/* OPEN PRODUCTION PAGE */

function openProductionPage() {
    window.location.href = "production.html";
}


/* MANUAL PRODUCTION ENTRY FOR FUTURE DATES */

async function addProduction() {

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

    let today = new Date().toISOString().split("T")[0];

    if (selectedDate <= today) {
        alert("Manual production allowed only for future dates");
        return;
    }
    let med = medicines.find(m => m.name === medicineName);

    if (!med) {
        alert("Medicine not found");
        return;
    }

    let productionData = {
        medicine: medicineName,
        production: Number(qty),
        limit: med.limit,
        date: selectedDate
    };

    await fetch("/api/production", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(productionData)
    });

    alert("Production Added Successfully");

    setTimeout(() => {
        loadProduction();
    }, 300);
}
