document.addEventListener("DOMContentLoaded", function () {

  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");

  // 🔥 Correct Mapping Between Branch Code and Password
  const branchPasswordMapping = {
    "MS101": "UPPAL-IDA000",
    "MS102": "MEDCHAL-IDA111",
    "MS200": "BOLLARUM-IDA222",
    "MS201": "ADIBATLA333",
    "MS103": "TURKAPALLY444"
  };

  loginForm.addEventListener("submit", function(e){
    e.preventDefault();

    const branch = document
      .getElementById("loginBranch")
      .value.trim()
      .toUpperCase();

    const pass = document
      .getElementById("loginPassword")
      .value.trim()
      .toUpperCase();

    let errors = "";

    // ✅ Check Branch Code
    if (!branchPasswordMapping.hasOwnProperty(branch)) {
      errors = "Invalid Branch Code";
    }
    // ✅ Check Password Matching with Branch
    else if (branchPasswordMapping[branch] !== pass) {
      errors = "Password does not match selected Branch Code";
    }

    // 🔴 If Error
    if (errors !== "") {
      loginMessage.innerText = errors;
      loginMessage.style.color = "red";
      return;
    }

    // 🟢 If Success
    localStorage.setItem("branch", branch);

    loginMessage.innerText = "Login Successful! Redirecting...";
    loginMessage.style.color = "green";

    setTimeout(function(){
      window.location.href = "home.html"; // 🔥 removed / to avoid path error
    }, 1000);

  });

});