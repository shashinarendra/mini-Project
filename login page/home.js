document.addEventListener("DOMContentLoaded", function () {

    // Optional: simple login protection
    if (!localStorage.getItem("branch")) {
        window.location.href = "login.html";
    }

    // Optional logout clear
    const logoutLink = document.querySelector(".nav-links a:last-child");

    logoutLink.addEventListener("click", function () {
        localStorage.clear();
    });

    // Smooth scroll animation
    document.querySelectorAll(".small-box").forEach(box => {
        box.addEventListener("mouseover", function () {
            box.style.background = "#e6f2ff";
        });
        box.addEventListener("mouseout", function () {
            box.style.background = "white";
        });
    });

});