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

