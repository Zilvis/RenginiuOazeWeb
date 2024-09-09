var apiUrl = 'http://localhost:8080/api';
const stripePublicKey = 'pk_test_51PlEGgRqqmKiLVdoTvDxIJ4rTXSDd3GzXL6fMI2zy6bNBUh39h2QpqTHxMYC7zA3pWFnPAv2gTFTnI3Af2NZnHDM00F37yHjdP';
const params = new URLSearchParams(window.location.search);
const eventId = params.get('id');
const jwtToken = getCookie('jwt');
let email;

console.log(eventId);


const loadEventFullStory = () => {

    fetch(apiUrl + `/events/${eventId}`)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else if (response.status === 404) {
                document.querySelector('.event-detail-container').innerHTML = '<p>Renginys nerastas.</p>';
                throw new Error('Renginys nerastas.');
            } else {
                throw new Error('Nepavyko užkrauti renginio informacijos.');
            }
        })
        .then(event => {
            const eventDate = new Date(event.date);
            const options = { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            const formattedDate = eventDate.toLocaleDateString('lt-LT', options);


            document.querySelector('.event-details-full h3').textContent = event.title;
            document.querySelector('.event-details-full .date').textContent = formattedDate;
            document.querySelector('.event-details-full .location').textContent = 'Vieta: ' +event.location;
            document.querySelector('.description').innerHTML = event.description;
            document.querySelector('.buy-ticket-button').textContent = `Pirkti bilietą už ${event.price} EUR`;

            document.querySelector('.buy-ticket-button').addEventListener('click', () => {
                redirectToCheckout(event.price, eventId);
            });
        })
        .catch(error => {
            console.error('Klaida:', error);
            document.querySelector('.event-detail-container').innerHTML = '<p>Įvyko klaida kraunant renginio duomenis.</p>';
        });
};

const redirectToCheckout = async (price, eventId) => {
    try {
        const response = await fetch(apiUrl + '/stripe/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                successUrl: apiUrl +`/stripe/payment-success`,
                cancelUrl: apiUrl +`/cancel.html`,
                amount: price * 100, // Amount in cents
                currency: 'eur',
                customerEmail: email,
                eventId: eventId
            })
        });

        const session = await response.json();

        if (response.ok) {
            const stripe = Stripe(stripePublicKey);
            await stripe.redirectToCheckout({ sessionId: session.id });
        } else {
            console.error('Error creating checkout session:', session.error);
        }
    } catch (error) {
        console.error('Error redirecting to checkout:', error);
    }
};

(async () => {
    loadEventFullStory();   
})();

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function getUserEmail() {
    try {
        const response = await fetch(apiUrl + '/user/info', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            }
        });
        if (response.ok) {
            const data = await response.json();
            const userEmail = data.email;
            return userEmail;
        } else {
            console.error('Error fetching user info:', response.statusText);
            throw new Error('Failed to fetch user info');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}


getUserEmail().then(userEmail => {
    email = userEmail;
}).catch(error => {
    console.error('Error:', error);
});

