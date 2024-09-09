var apiUrl = 'http://localhost:8080/api';
let eventListHTML = document.querySelector('#events-section');
let eventList = [];

let currentPage = 0;
let totalPages = 0;

var pageSize = 12;
var page = 0;


async function getAllEvents(page) {
    try {
        let response = await fetch(apiUrl + '/events/?page=' +page+ '&size=' +pageSize, {
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
            
            const eventDate = new Date(event.date);
            const options = { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            const formattedDate = eventDate.toLocaleDateString('lt-LT', options);

            newEvent.innerHTML = `
               <img src="${apiUrl}/image/${event.imageUrl}" alt="Event Photo">
                    <div class="event-details">
                         <h3>${event.title}</h3>
                         <p class="price">${event.price} EUR</p>
                         <p class="date">${formattedDate}</p>
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



const updatePaginationControls = () => {
    document.getElementById('page-info').textContent = `Puslapis ${currentPage + 1} iš ${totalPages}`;

    document.getElementById('prev-page').disabled = currentPage === 0;
    document.getElementById('next-page').disabled = currentPage === totalPages - 1;
};

document.getElementById('prev-page').addEventListener('click', async () => {
    if (currentPage > 0) {
        eventList = await getAllEvents(currentPage - 1);
        addDataToHtml(eventList);
    }
});

document.getElementById('next-page').addEventListener('click', async () => {
    if (currentPage < totalPages - 1) {
        eventList = await getAllEvents(currentPage + 1);
        addDataToHtml(eventList);
    }
});


(async () => {
        eventList = await getAllEvents();
        addDataToHtml(eventList);
})();
