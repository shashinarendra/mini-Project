document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("registrationForm");
    const messageBox = document.getElementById("messageBox");

    const validBranchCodes = ["MS101", "MS102", "MS103", "MS201", "MS202"];
    const validBranchAddresses = [
        "Uppal-IDA",
        "Medchal-IDA",
        "Bollarum-IDA",
        "Adibatla",
        "Turkapally"
    ];

    function showMessage(text, color) {
        messageBox.innerHTML = text;
        messageBox.style.color = color;
    }

    function validateName(name) {
        return /^[A-Za-z]{3,}$/.test(name);
    }

    function validateEmail(branchCode, email) {
        return email === branchCode + "mico@gmail.com";
    }

    form.addEventListener("submit", function (e) {

        e.preventDefault();

        let firstName = document.getElementById("firstName").value.trim();
        let lastName = document.getElementById("lastName").value.trim();
        let dob = document.getElementById("dob").value;
        let branchCode = document.getElementById("branchCode").value.trim().toUpperCase();
        let branchAddress = document.getElementById("branchAddress").value.trim().toUpperCase();
        let email = document.getElementById("email").value.trim();

        let errors = "";

        if (!validateName(firstName))
            errors += "Invalid First Name.<br>";

        if (!validateName(lastName))
            errors += "Invalid Last Name.<br>";

        if (!dob)
            errors += "Date of Birth required.<br>";

        if (!validBranchCodes.includes(branchCode))
            errors += "Invalid Branch Code.<br>";

        if (!validBranchAddresses.map(addr => addr.toUpperCase()).includes(branchAddress))
            errors += "Invalid Branch Address.<br>";

        if (email !== branchAddress + "mico@gmail.com")
            errors += "Email must start with Branch Address + mico@gmail.com.<br>";

        if (!validateEmail(branchCode, email))
            errors += "Email must match Branch Code format.<br>";

        if (errors !== "") {
            showMessage(errors, "red");
        } else {
            showMessage("Registration Successful!<br>Registration Completed", "green");

            form.reset();

            // 🔥 NEW ADDITION → Redirect to Login Page
            setTimeout(function(){
                window.location.href = "login.html";
            }, 1500);
        }

    });

});

