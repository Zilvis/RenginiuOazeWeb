const jwt = getCookie("jwt");
const apiUrl = "http://localhost:8080";
let eventListHTML = document.querySelector('#posts-container');
let eventList = [];

// User Details
document.addEventListener('DOMContentLoaded', async function() { 
    try {
        const response = await fetch(apiUrl + '/api/user/info', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + jwt
            }
        });

        if (response.ok) {
            const userInfo = await response.json();
            document.getElementById('userId').textContent = userInfo.id;
            document.getElementById('username').textContent = userInfo.username;
            document.getElementById('email').textContent = userInfo.email;
        } else if (response.status === 401) {
            document.body.innerHTML = '<p>You are not authorized to view this page. Please log in.</p>';
        } else {
            document.body.innerHTML = '<p>Failed to retrieve user information. Please try again later.</p>';
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
        document.body.innerHTML = '<p>An error occurred while fetching user information. Please try again later.</p>';
    }
});

async function getAllEvents() {
    try {
        let response = await fetch(apiUrl + `/api/user/posts`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            },
        });
        
        if (response.ok) {
            let data = await response.json();
            return data; // Return the array of posts
        } else if (response.status === 204) {
            console.log("No Data");
            return [];
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
            newEvent.className = 'post-item';
            newEvent.dataset.id = event.id;
            const safeTitle = escapeHtml(event.title);

            newEvent.innerHTML = `
               <h3>${safeTitle}</h3> 
               <p>${event.status}</p>
               <button onclick="editPost(${event.id}, '${safeTitle}')">Edit</button>
               <button onclick="deletePost(${event.id})">Delete</button>
            `;
            eventListHTML.appendChild(newEvent);
        });
    } else {
        eventListHTML.innerHTML = '<p>No events found.</p>';
    }
};

(async () => {
    eventList = await getAllEvents();
    addDataToHtml(eventList);
})();

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// edit
function editPost(postId, title, status) {
    document.getElementById('editTitle').value = title;
    document.getElementById('editStatus').value = status;


    document.getElementById('editPostForm').onsubmit = async function(event) {
        event.preventDefault();
        const updatedTitle = document.getElementById('editTitle').value;
        const updatedStatus = document.getElementById('editStatus').value;

        try {
            const response = await fetch(apiUrl + `/api/user/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + jwt
                },
                body: JSON.stringify({
                    title: updatedTitle,
                    status: updatedStatus
                })
            });

            if (response.ok) {
                alert('Post updated successfully');
                
                window.location.reload();
            } else {
                console.error('Failed to update post:', response.status);
            }
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };
}

// delete
async function deletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        try {
            const response = await fetch(apiUrl + `/api/user/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + jwt
                }
            });

            if (response.ok) {
                alert('Post deleted successfully');
                document.querySelector(`.post-item[data-id="${postId}"]`).remove();
            } else {
                console.error('Failed to delete post:', response.status);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    }
}


function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
        '/': '&#x2F;'
    };
    return text.replace(/[&<>"'/]/g, function(m) { return map[m]; });
}
