const agencies = [

    "Apollo Pharmacy Distribution Network",
    "Keimed Private Limited",
    "Vardhman Health Specialities",
    "Lakshmi Pharma Distributors",
    "Taj Pharma Distributors",
    "Sri Venkateswara Medical Agencies",
    "Medihauxe Pharma Solutions",
    "Sain Medicaments Private Limited",
    "Ganga Pharma Distributors",
    "Gupta Pharma Distributors",
    "Vishu Medical Agency",
    "Yash Agencies",
    "New Dowlat Agencies",
    "Sandor Medical Pvt Ltd",
    "Jyothi agencies",
    "Om shree medisurge Inc"

]

/* MONTH CONTROL */

let selectedWeek = null
let currentDate = new Date()

const monthYear = document.getElementById("monthYear")
const weeksDiv = document.getElementById("weeks")


function renderWeeks() {

    monthYear.innerText =
        currentDate.toLocaleString("default", { month: "long", year: "numeric" })

    weeksDiv.innerHTML = ""

    for (let i = 1; i <= 5; i++) {

        let btn = document.createElement("button")

        btn.innerText = "Week " + i

        btn.onclick = () => loadOrders(i)

        weeksDiv.appendChild(btn)

    }

}

renderWeeks()



function prevMonth() {

    currentDate.setMonth(currentDate.getMonth() - 1)

    renderWeeks()

}



function nextMonth() {

    currentDate.setMonth(currentDate.getMonth() + 1)

    renderWeeks()

}



/* LOAD ORDERS */

async function loadOrders(week) {

    selectedWeek = week

    let tbody = document.getElementById("tableBody")

    let selectedMonth = currentDate.getMonth() + 1
    let selectedYear = currentDate.getFullYear()

    let today = new Date()
    let currentMonth = today.getMonth() + 1
    let currentYear = today.getFullYear()

    tbody.innerHTML = ""

    /* FUTURE MONTHS → SHOW STORED ORDERS ONLY */

    let isFutureMonth =
        selectedYear > currentYear ||
        (selectedYear === currentYear && selectedMonth > currentMonth)

    if (isFutureMonth) {

        let resFuture = await fetch(`/api/orders?week=${week}&month=${selectedMonth}&year=${selectedYear}`)

        let orders = await resFuture.json()

        if (orders.length === 0) {

            tbody.innerHTML = `
<tr>
<td colspan="3" style="text-align:center;padding:20px;">
No Orders Yet — Add Orders For This Week
</td>
</tr>
`
            return
        }

        orders.forEach(o => {

            let row = `
<tr>
<td>${o.agency}</td>
<td>${o.product} (${o.quantity})</td>
<td>₹${o.totalBill}</td>
</tr>
`

            tbody.innerHTML += row

        })

        return
    }

    /* CURRENT / PAST MONTH → RANDOM DATA */

    let resProducts = await fetch("/api/products")

    let data = await resProducts.json()

    let products = data.products

    let shuffledAgencies = [...agencies].sort(() => Math.random() - 0.5)

    shuffledAgencies.forEach(agency => {

        let product = products[Math.floor(Math.random() * products.length)]

        let quantity = Math.floor(Math.random() * 200) + 50

        let totalBill = quantity * product.cost

        let row = `
<tr>
<td>${agency}</td>
<td>${product.name} (${quantity})</td>
<td>₹${totalBill}</td>
</tr>
`

        tbody.innerHTML += row

    })

}



/* LOAD PRODUCTS */

async function loadProducts() {

    let res = await fetch("/api/products")

    let data = await res.json()

    let select = document.getElementById("product")

    data.products.forEach(p => {

        let option = document.createElement("option")

        option.value = p.name

        option.text = p.name + " - ₹" + p.cost

        select.appendChild(option)

    })

}

loadProducts()



/* ADD MANUAL ORDER */

async function addManualOrder() {

    if (!selectedWeek) {
        alert("Please select a week first")
        return
    }

    let agency = document.getElementById("agency").value
    let product = document.getElementById("product").value
    let quantity = document.getElementById("quantity").value

    if (!agency || !product || !quantity) {
        alert("Please fill all fields")
        return
    }

    let selectedMonth = currentDate.getMonth() + 1
    let selectedYear = currentDate.getFullYear()

    let res = await fetch("/api/products")
    let data = await res.json()

    let prod = data.products.find(p => p.name === product)

    let totalBill = quantity * prod.cost

    await fetch("/api/orders", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

            agency: agency,
            product: product,
            quantity: quantity,
            totalBill: totalBill,
            week: selectedWeek,
            month: selectedMonth,
            year: selectedYear

        })

    })

    alert("Order Added Successfully")

    loadOrders(selectedWeek)

}