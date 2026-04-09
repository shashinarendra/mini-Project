window.toggleProducts = function () {

    const productContent = document.getElementById("productContent");
    const container = document.querySelector(".container");
    const flexboxes = document.querySelectorAll(".flexbox");

    fetch("/api/biotech-products")
        .then(res => res.json())
        .then(data => {

            flexboxes.forEach(box => {
                box.style.display = "none";
            });

            container.style.display = "block";

            productContent.innerHTML = `

<div class="full-table-layout">

<div class="glass-card">
<h3 class="section-title">Biotech Products</h3>

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
<h3 class="section-title">Top Biotech Products</h3>

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
        });
};

function openProductionPage() {
    window.location.href = "production.html";
}