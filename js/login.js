document.getElementById("login-form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: password })
    });

    if (response.ok) {
        const data = await response.json();

        // Store the JWT in a cookie
        setCookie("jwt", data.jwtToken, 1); // Store for 1 day

        // Redirect to another page or display success message
        window.location.href = '/index.html';
    } else {
        // Handle login error
        console.error('Login failed');
    }
});

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        //date.setTime(date.getTime() + (10 * 60 * 1000)); // 10 min
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}


// Patikra ar prisijunges jei taip nukreipia atgal i pradžia

function getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

window.onload = async function() {
    const jwtToken = getCookie('jwt');
    
    try {
        const response = await fetch('http://localhost:8080/api/auth/check2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken
            }
        });

        if (response.ok) {
            window.location.href = "/index.html";
        }
    } catch (error) {
        console.error('Error validating token:', error);
    }
};

