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


async function loadProducts() {

    let res = await fetch("/api/products")
    let data = await res.json()

    let select = document.getElementById("product")

    data.products.forEach(p => {

        let option = document.createElement("option")

        option.value = p.name
        option.text = p.name

        select.appendChild(option)

    })

}

loadProducts()



async function loadComplaints() {

    let month = currentDate.getMonth() + 1
    let year = currentDate.getFullYear()

    let res = await fetch(`/api/complaints?month=${month}&year=${year}`)
    let data = await res.json()

    table.innerHTML = ""

    data.forEach(c => {
        let statusClass = "status-open"

        if (c.solution && !c.closed) {
            statusClass = "status-pending"
        }

        if (c.closed) {
            statusClass = "status-closed"
        }

        let row = `

<tr class="${statusClass}">
<td>${c.product} - ${c.text}</td>

<td class="status">

<input type="checkbox"
${c.closed ? "checked disabled" : ""}
onclick="closeComplaint('${c._id}')">

</td>

<td>

${c.solution ?

                c.solution :

                `<button onclick="addSolution('${c._id}')">Add Solution</button>`

            }

</td>

</tr>
`

        table.innerHTML += row

    })

}



async function addComplaint() {

    let product = document.getElementById("product").value
    let text = document.getElementById("complaintText").value

    let month = currentDate.getMonth() + 1
    let year = currentDate.getFullYear()

    await fetch("/api/complaints", {

        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

            product,
            text,
            month,
            year

        })

    })

    alert("Complaint Added")

    loadComplaints()

}



async function closeComplaint(id) {

    let pass = prompt("Owner Password")

    if (pass !== "MICOINDUS") {
        alert("Unauthorized")
        return
    }

    await fetch("/api/complaints/close", {

        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ id })

    })

    loadComplaints()

}
async function addSolution(id) {

    let pass = prompt("Enter Owner Password")

    if (pass !== "MICOINDUS") {
        alert("Unauthorized")
        return
    }

    let solution = prompt("Enter solution")

    if (!solution) return

    await fetch("/api/complaints/solution", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            id: id,
            solution: solution
        })

    })

    loadComplaints()

}