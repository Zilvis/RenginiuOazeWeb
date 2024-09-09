document.getElementById('registration-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    if (password !== passwordConfirm) {
        alert('Slaptažodžiai nesutampa!');
        return;
    }

    const requestBody = {
        email: email,
        password: password,
        username: username
    };

    try {
        const response = await fetch('http://localhost:8080/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            const data = await response.json();
            alert('Registracija sėkminga! Prašome patvirtinti aktyvavimo kodą.');
            window.location.href = '/confirm.html';
        } else {
            const errorData = await response.json();
            alert('Klaida: ' + errorData.message);
        }
    } catch (error) {
        alert('Įvyko klaida. Bandykite dar kartą.');
        console.error('Error:', error);
    }
});
