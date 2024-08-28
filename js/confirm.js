document.getElementById('confirm-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    const email = document.getElementById('email').value;
    const verificationCode = document.getElementById('confirm-code').value;

    const requestBody = {
        email: email,
        verificationCode: verificationCode
    };

    try {
        const response = await fetch('http://localhost:8080/auth/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            const data = await response.json();
            alert('Aktyvacija sėkminga! Dabar galite prisijungti.');
            window.location.href = '/login.html';
        } else {
            const errorData = await response.json();
            alert('Klaida: ' + errorData.message);
        }
    } catch (error) {
        alert('Įvyko klaida. Bandykite dar kartą.');
        console.error('Error:', error);
    }
});
