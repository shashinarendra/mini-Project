let currentDate = new Date();
let selectedWeek = null;
let productPrices = {};

/* LOAD PRODUCTS */
async function loadProducts() {

    let productSelect = document.getElementById("product");

    productSelect.innerHTML = "<option>Select Product</option>";

    try {

        let res = await fetch("/api/biotech-products");
        let data = await res.json();

        data.products.forEach(p => {

            let option = document.createElement("option");
            option.value = p.name;
            option.text = p.name;

            productSelect.appendChild(option);

            productPrices[p.name] = p.cost; // ✅ HERE

        });

    } catch (err) {
        console.log("Error loading products:", err);
    }
}
loadProducts();
renderWeeks();

/* RENDER WEEKS */

function renderWeeks() {

    let weeksDiv = document.getElementById("weeks");
    weeksDiv.innerHTML = "";

    let month = currentDate.getMonth();
    let year = currentDate.getFullYear();

    document.getElementById("monthYear").innerText =
        currentDate.toLocaleString("default", { month: "long", year: "numeric" });

    for (let i = 1; i <= 4; i++) {

        let div = document.createElement("div");
        div.innerText = "Week " + i;

        div.onclick = () => {
            selectedWeek = i;

            console.log("Selected:", {
                week: selectedWeek,
                month: currentDate.getMonth() + 1,
                year: currentDate.getFullYear()
            });

            loadOrders();   // ✅ MUST BE HERE
        };

        weeksDiv.appendChild(div);
    }
}

renderWeeks();

/* NAVIGATION */

function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderWeeks();

    selectedWeek = null;   // reset selection
    document.getElementById("tableBody").innerHTML = ""; // clear table
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderWeeks();
}

/* LOAD ORDERS */

async function loadOrders() {

    if (!selectedWeek) return;

    let res = await fetch(`/api/biotech-orders?week=${selectedWeek}&month=${currentDate.getMonth() + 1}&year=${currentDate.getFullYear()}`)
    let data = await res.json();

    let table = document.getElementById("tableBody");
    table.innerHTML = "";

    data.forEach(o => {

        let row = `<tr>
            <td>${o.agency}</td>
            <td>${o.product} (${o.quantity})</td>
            <td>${o.totalBill}</td>
        </tr>`;

        table.innerHTML += row;
    });
    console.log("API CALL:",
        selectedWeek,
        currentDate.getMonth() + 1,
        currentDate.getFullYear()
    );
}

/* ADD ORDER */
async function addManualOrder() {

    let agency = document.getElementById("agency").value;
    let product = document.getElementById("product").value;
    let quantity = document.getElementById("quantity").value;

    if (!agency || !product || !quantity) {
        alert("Fill all fields");
        return;
    }

    if (!selectedWeek) {
        alert("Please select a week");
        return;
    }

    let selectedProduct = productPrices[product] || 0;

    let order = {
        agency,
        product,
        quantity: Number(quantity),
        totalBill: Number(quantity) * selectedProduct,
        week: selectedWeek,
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear()
    };

    await fetch("/api/biotech-orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(order)
    });

    alert("Order Added Successfully ✅");

    loadOrders();
}