window.toggleProducts = function () {

    const productContent = document.getElementById("productContent");
    const container = document.querySelector(".container");
    const flexboxes = document.querySelectorAll(".flexbox");

    if (!productContent) {
        console.error("productContent not found");
        return;
    }

    fetch("/api/products")
        .then(res => res.json())
        .then(data => {

            // hide flexboxes
            flexboxes.forEach(box => {
                box.style.display = "none";
            });

            // change container layout so no empty column remains
            container.style.display = "block";

            // show tables
            productContent.innerHTML = `

<div class="full-table-layout">

<div class="glass-card">
<h3 class="section-title">All Products</h3>

<table>
<tr>
<th>S.No</th>
<th>Product</th>
<th>Cost (₹)</th>
</tr>

${data.products.map((item, index) => `
<tr>
<td>${index + 1}</td>
<td>${item.name}</td>
<td>${item.cost}</td>
</tr>
`).join("")}

</table>

</div>

<div class="table-layout">
<div class="glass-card">
<h3 class="section-title">Bestsellers</h3>

<table>
<tr>
<th>S.No</th>
<th>Product</th>
<th>Cost (₹)</th>
</tr>

${data.bestsellers.map((item, index) => `
<tr>
<td>${index + 1}</td>
<td>${item.name}</td>
<td>${item.cost}</td>
</tr>
`).join("")}

</table>

</div>

</div>

`;

        })
        .catch(err => {
            console.error("Fetch error:", err);
        });

};
function openProductionPage() {
    window.location.href = "production.html";
}