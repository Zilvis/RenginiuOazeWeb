document.addEventListener("DOMContentLoaded", function() {
    if (!getCookie("newsletterPopupShown")) {
        document.getElementById("newsletter-popup").style.display = "flex";
        setCookie("newsletterPopupShown", "true", 30); // Show popup once every 30 days
    }
});

function closePopup() {
    document.getElementById("newsletter-popup").style.display = "none";
}

function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

document.getElementById("newsletter-form").addEventListener("submit", function(event) {
    event.preventDefault();

    // Get the email input value
    const email = document.getElementById("newsletter-email").value;

    // Create the payload
    const data = { email: email };

    // Send the POST request to the server
    fetch('http://localhost:8080/api/mail/newsletter/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (response.ok) {
            // If the subscription is successful, close the popup
            closePopup();
            alert("Thank you for subscribing!");
        } else {
            alert("There was an error. Please try again.");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("There was an error. Please try again.");
    });
});