document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("registrationForm");
    const messageBox = document.getElementById("messageBox");
    const dobInput = document.getElementById("dob");

    let today = new Date();

    let maxDate = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());
    let minDate = new Date(today.getFullYear() - 70, today.getMonth(), today.getDate());

    dobInput.max = maxDate.toISOString().split("T")[0];
    dobInput.min = minDate.toISOString().split("T")[0];

    const branchMapping = {
        "MS101": "UPPAL-IDA",
        "MS102": "MEDCHAL-IDA",
        "MS200": "BOLLARUM-IDA",
        "MS201": "ADIBATLA",
        "MS103": "TURKAPALLY"
    };

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
        let password = document.getElementById("password").value.trim();
        let rePassword = document.getElementById("rePassword").value.trim();

        let errors = "";

        // Name validation
        if (!validateName(firstName))
            errors += "Invalid First Name.<br>";

        if (!validateName(lastName))
            errors += "Invalid Last Name.<br>";

        // DOB validation
        // DOB validation
        if (!dob) {

            errors += "Date of Birth required.<br>";

        } else {

            let birthDate = new Date(dob);
            let today = new Date();

            let age = today.getFullYear() - birthDate.getFullYear();
            let monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age < 20 || age > 70) {
                errors += "Age must be between 20 and 70 years.<br>";
            }

        }

        // Branch code validation
        if (!branchMapping.hasOwnProperty(branchCode))
            errors += "Invalid Branch Code.<br>";

        // Branch address match
        if (branchMapping[branchCode] !== branchAddress)
            errors += "Branch Code and Address do not match.<br>";

        // Email validation
        if (!validateEmail(branchCode, email))
            errors += "Email must be BranchCode + mico@gmail.com.<br>";

        // Password validation
        if (password === "")
            errors += "Password is required.<br>";

        if (password !== rePassword)
            errors += "Passwords do not match.<br>";

        if (errors !== "") {

            showMessage(errors, "red");

        } else {

            fetch("/register", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    firstName,
                    lastName,
                    dob,
                    branchCode,
                    branchAddress,
                    email,
                    password
                })

            })
                .then(res => res.json())
                .then(data => {

                    if (data.message === "Registration Successful") {

                        showMessage(data.message, "green");

                        form.reset();

                        setTimeout(function () {
                            window.location.href = "/login.html";
                        }, 1500);

                    }
                    else {

                        showMessage(data.message, "red");

                    }

                })

        }

    });

});