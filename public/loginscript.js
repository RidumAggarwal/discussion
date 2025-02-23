document.addEventListener("DOMContentLoaded", function () {
    const signInBtn = document.getElementById("sign-in-btn");
    const signUpBtn = document.getElementById("sign-up-btn");
    const signInForm = document.getElementById("signin-form");
    const signUpForm = document.getElementById("signup-form");
    const signUpdetails = document.getElementById("signup-btn");
    const logIndetails = document.getElementById("login-btn");
    const suname = document.getElementById("name");
    const suemail = document.getElementById("suemail");
    const supassword = document.getElementById("supassword");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const toggleLoginPassword = document.getElementById("toggle-login-password");
    const toggleSignupPassword = document.getElementById("toggle-signup-password");
    
    signInBtn.addEventListener("click", () => {
        signInForm.style.display = "block";
        signUpForm.style.display = "none";
    });
    
    signUpBtn.addEventListener("click", () => {
        signUpForm.style.display = "block";
        signInForm.style.display = "none"
    });
    
    function togglePasswordVisibility(input, icon) {
        if (input.type === "password") {
            input.type = "text";
            icon.classList.replace("fa-eye", "fa-eye-slash");
        } else {
            input.type = "password";
            icon.classList.replace("fa-eye-slash", "fa-eye");
        }
    }
    
    toggleLoginPassword.addEventListener("click", () => {
        togglePasswordVisibility(password, toggleLoginPassword);
    });
    
    toggleSignupPassword.addEventListener("click", () => {
        togglePasswordVisibility(supassword, toggleSignupPassword);
    });
    
    signUpdetails.addEventListener("click", () => {
        let emailValue = suemail.value.trim();
        let nameValue = suname.value.trim();
        let passwordValue = supassword.value.trim();
        
        if (nameValue && emailValue && passwordValue) {
            if (validateEmail(emailValue)) {
                let signupDetails = {
                    name: nameValue,
                    email: emailValue,
                    password: passwordValue
                };
                
                let xhrsu = new XMLHttpRequest();
                xhrsu.open('POST', '/submit', true);
                xhrsu.setRequestHeader('Content-Type', 'application/json');
                xhrsu.send(JSON.stringify(signupDetails));
                
                xhrsu.onload = () => {
                    if (xhrsu.status === 200) {
                        let response = JSON.parse(xhrsu.responseText);
                        alert(response.status);
                        signIn();
                    } else if (xhrsu.status === 409) {
                        alert("Email already exists.");
                    } else {
                        alert("Server error, please try again later.");
                    }
                };
            } else {
                alert("Invalid Email");
            }
        } else {
            alert("Please fill all the fields");
        }
    });
    
    logIndetails.addEventListener("click", login);
    password.addEventListener("keypress", login);
    function login(){
        let loginDetails = {
            email: email.value.trim(),
            password: password.value.trim()
        };
        
        let xhr = new XMLHttpRequest();
        xhr.open('POST', '/login', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(loginDetails));
        
        xhr.onload = () => {
            if (xhr.status === 200) {
                window.location.href = "/";
            } else if (xhr.status === 409) {
                alert("Password is incorrect");
            } else {
                alert("Error occurred at server side");
            }
        };
    }
    
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
});
