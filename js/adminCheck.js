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
        const response = await fetch('http://localhost:8080/api/auth/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken
            }
        });

        if (!response.ok) {
            window.location.href = "/login.html";
        }
    } catch (error) {
        console.error('Error validating token:', error);
        window.location.href = "/login.html";
    }
};