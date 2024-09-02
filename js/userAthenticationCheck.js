window.onload = async function() {
    const jwtToken = getCookie('jwt');
    const navItems = document.getElementById('nav-items');

    try {
        const response = await fetch('http://localhost:8080/api/auth/check2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken
            }
        });

        if (response.ok) {
            const userMenu = `
            <li><a href="#profile">Profile</a></li>
            <li><a href="#" id="logout-btn">Logout</a></li>
        `;
        navItems.innerHTML += userMenu;

        // Add logout functionality
        document.getElementById('logout-btn').addEventListener('click', function(event) {
            event.preventDefault();
            logout();
        });
        } else if (response.status === 401){
            const loginMenu = `
            <li><a href="/login.html">Login</a></li>
            `;
            navItems.innerHTML += loginMenu;
        }
    } catch (error) {
        console.error('Error validating token:', error);
        
    }
};

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function logout() {
    fetch('http://localhost:8080/api/auth/signout', {
        method: 'POST',
        credentials: 'include'
    }).then(response => {
        if (response.ok) {
            // Clear the authToken cookie by setting it to expire
            document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
            window.location.href = "/index.html";
        }
    }).catch(error => console.error('Error logging out:', error));
}