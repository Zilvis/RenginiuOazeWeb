document.getElementById('confirm-resend-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Prevent the default form submission

    const email = document.getElementById('email').value;

    try {
        const response = await fetch('http://localhost:8080/auth/resend?email=' + encodeURIComponent(email), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            try {
                const data = await response.json();
                alert('Success: ' + data.message);
                window.location.href = '/confirm.html';
            } catch (error) {
                const textData = await response.text();
                alert(textData || 'Patvirtinimo kodas išsiųstas į jūsų el. paštą.');
            }
        } else {
            const errorData = await response.json().catch(async () => {
                const textError = await response.text();
                return { message: textError };
            });
            alert('Klaida: ' + errorData.message);
        }
    } catch (error) {
        alert('Įvyko klaida. Bandykite dar kartą.');
        console.error('Error:', error);
    }
});
