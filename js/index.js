document.addEventListener('DOMContentLoaded', async function() {
    // Get the JWT token from the cookie
    const jwt = getCookie("jwt");
    console.log(jwt);
    

    if (!jwt) {
        // If the token is not available, redirect to login
        window.location.href = '/login.html';
        return;
    }

    // // Load user information on page load
    // try {
    //     const response = await fetch('/userinfo', {
    //         method: 'GET',
    //         headers: {
    //             'Authorization': 'Bearer ' + jwt // Send the token in the Authorization header
    //         }
    //     });

    //     if (response.ok) {
    //         const userData = await response.json();
    //         document.getElementById('user-info').textContent = `Hello, ${userData.username} (${userData.email})`;
    //     } else {
    //         // Redirect to login if not authenticated
    //         window.location.href = '/login.html';
    //     }
    // } catch (error) {
    //     console.error('Error:', error);
    // }

    // Add event listeners for the test endpoints
    document.getElementById('public-content-btn').addEventListener('click', async function() {
        await fetchContent('http://localhost:8080/api/test/all', jwt);
    });

    document.getElementById('user-content-btn').addEventListener('click', async function() {
        await fetchContent('http://localhost:8080/api/test/user', jwt);
    });

    document.getElementById('moderator-content-btn').addEventListener('click', async function() {
        await fetchContent('http://localhost:8080/api/test/mod', jwt);
    });

    document.getElementById('admin-content-btn').addEventListener('click', async function() {
        await fetchContent('http://localhost:8080/api/test/admin', jwt);
    });

    // Logout functionality
    document.getElementById('logout-btn').addEventListener('click', async function() {
        try {
            const response = await fetch('http://localhost:8080/api/auth/signout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                // Clear the JWT cookie
                document.cookie = "jwt=; Max-Age=0; path=/;";
                window.location.href = '/login.html';
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});

// Function to fetch content from the server and display it
async function fetchContent(endpoint, jwt) {
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + jwt // Send the token in the Authorization header
            }
        });

        if (response.ok) {
            const content = await response.text();
            document.getElementById('content-display').textContent = content;
        } else {
            document.getElementById('content-display').textContent = 'You do not have access to this content.';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('content-display').textContent = 'An error occurred while fetching content.';
    }
}



function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function checkTokenValidity() {
    const jwtToken = getCookie("jwt");

    if (!jwtToken) {
        // No token found, redirect to login
        window.location.href = '/login.html';
        return;
    }

    fetch('http://localhost:8080/api/test/user', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + jwtToken
        }
    })
    .then(response => {
        if (response.status === 401) {
            // Token is invalid or expired
            alert('Session expired. Please log in again.');
            window.location.href = '/login.html';
        } else {
            console.log('Token is still valid');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Set an interval to check token validity every 30 seconds
setInterval(checkTokenValidity, 30000); // 30,000 ms = 30 seconds
