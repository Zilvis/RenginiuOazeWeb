var url = 'http://localhost:8080/api';
let eventListHTML = document.querySelector('#events-section');
let eventList = [];

let currentPage = 0;
let totalPages = 0;

async function getAllEvents(page = 0) {
    try {
        let response = await fetch(`${url}/events/public/?page=${page}&size=10`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 204) {
            console.log("No Data");
            return [];
        } else if (response.status === 200) {
            let data = await response.json();
            totalPages = data.totalPages;
            currentPage = data.currentPage;
            return data.content;
        } else {
            console.error('Unexpected response status:', response.status);
            return [];
        }

    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

const addDataToHtml = (eventList) => {
    eventListHTML.innerHTML = ''; // Clear previous HTML
    if (eventList.length > 0) {
        eventList.forEach(event => {
            let newEvent = document.createElement('div');
            newEvent.className = 'event-item';
            newEvent.dataset.id = event.id;
            
            newEvent.innerHTML = `
               <img src="http://localhost:8080/api/events/public/getImg/${event.imageUrl}" alt="Event Photo">
                    <div class="event-details">
                         <h3>${event.title}</h3>
                         <p class="price">$${event.price}</p>
                        <p class="date">${event.date}</p>
                        <p class="location">${event.location}</p>
                     </div>
                     <a href="fullStory.html?id=${event.id}" class="buy-ticket-button">Skaityti daugiau</a>  
            `;
            eventListHTML.appendChild(newEvent);
            
        });

        
        
    } else {
        eventListHTML.innerHTML = '<p>No events found.</p>';
    }

    updatePaginationControls();
};



const loadEventFullStory = () => {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id');

    fetch(url + `/events/public/${eventId}`)
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
            document.querySelector('.event-details-full h3').textContent = event.title;
            document.querySelector('.event-details-full .price').textContent = `${event.price} EUR`;
            document.querySelector('.event-details-full .date').textContent = event.date;
            document.querySelector('.event-details-full .location').textContent = event.location;
            document.querySelector('.description').innerHTML = event.description;
        })
        .catch(error => {
            console.error('Klaida:', error);
            document.querySelector('.event-detail-container').innerHTML = '<p>Įvyko klaida kraunant renginio duomenis.</p>';
        });
};

(async () => {
    if (window.location.pathname.includes('fullStory.html')) {
        loadEventFullStory();
    } else {
        eventList = await getAllEvents();
        addDataToHtml(eventList);
    }
})();
