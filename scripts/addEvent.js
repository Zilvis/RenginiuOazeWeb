document.getElementById('eventForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const jwtToken = getCookie("jwt"); // Ensure this function works correctly
    if (!jwtToken) {
        alert("You must be logged in to add an event.");
        return;
    }

    const eventName = document.getElementById('eventName').value;
    const eventDate = document.getElementById('eventDate').value;
    const eventDescription = quill.root.innerHTML;
    const eventLocation = document.getElementById('eventLocation').value;
    const eventImage = document.getElementById('eventImage').files[0]; // Changed from .value to .files[0]
    const eventPrice = document.getElementById('eventPrice').value;

    const formData = new FormData();
    formData.append('title', eventName);
    formData.append('date', eventDate);
    formData.append('description', eventDescription);
    formData.append('location', eventLocation);
    formData.append('price', eventPrice);
    formData.append('status', "STATUS_ACTIVE");
    if (eventImage) {
        formData.append('image', eventImage); // Append file here
    }

    try {
        const response = await fetch('http://localhost:8080/api/events/', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            body: formData
        });

        if (response.ok) {
            alert('Successfully added event with image');
        } else {
            const errorText = await response.text();
            alert('Failed to add event: ' + errorText);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding the event');
    }
});


function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}