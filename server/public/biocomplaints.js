let currentDate = new Date()

const monthYear = document.getElementById("monthYear")
const table = document.getElementById("complaintTable")

function renderMonth() {

    monthYear.innerText =
        currentDate.toLocaleString("default", { month: "long", year: "numeric" })

    loadComplaints()
}

renderMonth()

function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1)
    renderMonth()
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1)
    renderMonth()
}

/* LOAD COMPLAINTS */
async function loadComplaints() {

    try {

        let month = currentDate.getMonth() + 1
        let year = currentDate.getFullYear()

        console.log("Loading:", month, year)

        let res = await fetch(`/api/biotech-complaints?month=${month}&year=${year}`)
        let data = await res.json()

        console.log("DATA:", data)

        table.innerHTML = ""

        data.forEach(c => {

            let checkboxDisabled = (!c.solution || c.closed) ? "disabled" : "";
            let checked = c.closed ? "checked" : "";
            let row = `
<tr>
<td>${c.product} - ${c.text}</td>
<td>
<input type="checkbox" ${checked} ${checkboxDisabled}
onclick="closeComplaint('${c._id}')">
</td>
<td>
${c.solution ? c.solution :
                    `<button onclick="addSolution('${c._id}')">Add Solution</button>`}
</td>
</tr>
`

            table.innerHTML += row
        })

    } catch (err) {
        console.error("LOAD ERROR:", err)
    }
}

/* ADD COMPLAINT */
async function addComplaint() {

    try {

        let today = new Date()

        if (
            currentDate.getFullYear() !== today.getFullYear() ||
            currentDate.getMonth() !== today.getMonth()
        ) {
            alert("You can only add complaints in current month")
            return
        }

        let product = document.getElementById("product").value
        let text = document.getElementById("complaintText").value

        if (!product || !text) {
            alert("Please fill all fields")
            return
        }

        let month = today.getMonth() + 1
        let year = today.getFullYear()

        let res = await fetch("/api/biotech-complaints", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product, text, month, year })
        })

        let data = await res.json()

        console.log("POST RESPONSE:", data)

        alert("Complaint Added Successfully ✅")

        currentDate = new Date()
        renderMonth()

        document.getElementById("complaintText").value = ""
        document.getElementById("product").value = ""

    } catch (err) {
        console.error("ERROR:", err)
        alert("Something went wrong")
    }
}

/* CLOSE COMPLAINT */
async function closeComplaint(id) {

    let pass = prompt("Enter Password")

    if (pass !== "MICOINDUS") {
        alert("Wrong Password")
        return
    }

    await fetch("/api/biotech-complaints/close", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
    })

    loadComplaints()
}

/* ADD SOLUTION */
async function addSolution(id) {

    console.log("Add solution clicked:", id);

    let solution = prompt("Enter solution");

    if (!solution) return;

    try {

        let res = await fetch("/api/biotech-complaints/solution", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: id,
                solution: solution
            })
        });

        let data = await res.json();

        console.log("Solution API response:", data);

        alert("Solution Added ✅");

        loadComplaints();

    } catch (err) {
        console.error("ERROR:", err);
    }
}