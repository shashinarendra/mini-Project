document.addEventListener("DOMContentLoaded", function () {

  const loginForm = document.getElementById("loginForm");
  const loginMessage = document.getElementById("loginMessage");

  const validBranchCodes = ["MS101","MS102","MS103","MS201","MS202"];

  const validPasswords = {
    "MS101": "UPPAL-IDA1",
    "MS102": "MEDCHAL-IDA2",
    "MS103": "BOLLARUM-IDA3",
    "MS201": "ADIBATLA4",
    "MS202": "TURKAPALLY5"
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

    if(!validBranchCodes.includes(branch)){
      loginMessage.innerText = "Invalid Branch Code";
      loginMessage.style.color = "red";
      return;
    }

    if(validPasswords[branch] !== pass){
      loginMessage.innerText = "Invalid Password";
      loginMessage.style.color = "red";
      return;
    }

    // Store login
    localStorage.setItem("branch", branch);

    loginMessage.innerText = "Login Successful! Redirecting...";
    loginMessage.style.color = "green";

    setTimeout(function(){
      window.location.href = "home.html";
    },800);

  });

});