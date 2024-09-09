const apiUrl = 'http://localhost:8080/api';
        const stripePublicKey = 'pk_test_51PlEGgRqqmKiLVdoTvDxIJ4rTXSDd3GzXL6fMI2zy6bNBUh39h2QpqTHxMYC7zA3pWFnPAv2gTFTnI3Af2NZnHDM00F37yHjdP';
        let eventListHTML = document.querySelector('#events-section');
        let eventList = [];
        let currentPage = 0;
        let totalPages = 0;
        const pageSize = 12;

        // Utility Functions
        function getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        }

        function setCookie(name, value, days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
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
            return text.replace(/[&<>"'/]/g, m => map[m]);
        }

        // Get All Events
        async function getAllEvents(page = 0) {
            try {
                let response = await fetch(`${apiUrl}/events/?page=${page}&size=${pageSize}`, {
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
                        <img src="${apiUrl}/image/${event.imageUrl}" alt="Event Photo">
                        <div class="event-details">
                            <h3>${event.title}</h3>
                            <p class="price">${event.price} EUR</p>
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

        // Event Form Submission
        document.getElementById('eventForm').addEventListener('submit', async function(event) {
            event.preventDefault();

            const jwtToken = getCookie("jwt");
            if (!jwtToken) {
                alert("You must be logged in to add an event.");
                return;
            }

            const eventName = document.getElementById('eventName').value;
            const eventDate = document.getElementById('eventDate').value;
            const eventLocation = document.getElementById('eventLocation').value;
            const eventImage = document.getElementById('eventImage').files[0];
            const eventPrice = document.getElementById('eventPrice').value;
            const eventDescription = quill.root.innerHTML;

            const formData = new FormData();
            formData.append('title', eventName);
            formData.append('date', eventDate);
            formData.append('description', eventDescription);
            formData.append('location', eventLocation);
            formData.append('price', eventPrice);
            formData.append('status', "STATUS_ACTIVE");
            if (eventImage) {
                formData.append('image', eventImage);
            }

            try {
                const response = await fetch(`${apiUrl}/events/`, {
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

        // Load Event Full Story
        const params = new URLSearchParams(window.location.search);
        const eventId = params.get('id');
        const jwtToken = getCookie('jwt');
        let email;

        const loadEventFullStory = () => {
            fetch(`${apiUrl}/events/${eventId}`)
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
                    document.querySelector('.event-details-full .date').textContent = event.date;
                    document.querySelector('.event-details-full .location').textContent = event.location;
                    document.querySelector('.event-details-full .description').innerHTML = event.description;
                    document.querySelector('.buy-ticket-button').textContent = "Pirkti bilietą už " + event.price + " EUR";
                    document.querySelector('.buy-ticket-button').addEventListener('click', async () => {
                        const response = await fetch(`${apiUrl}/stripe/create-checkout-session`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + jwtToken
                            },
                            body: JSON.stringify({
                                price: event.price,
                                currency: 'EUR',
                                eventId: event.id,
                                email: email
                            })
                        });

                        if (response.ok) {
                            const session = await response.json();
                            const stripe = Stripe(stripePublicKey);
                            stripe.redirectToCheckout({ sessionId: session.id });
                        } else {
                            alert('An error occurred while creating the checkout session');
                        }
                    });
                })
                .catch(error => {
                    console.error(error);
                });
        };

        if (eventId) {
            loadEventFullStory();
        }

        // User Info and Event Management
        const postsContainer = document.getElementById("posts-container");
        const userInfo = document.getElementById("user-info");

        async function getUserDetailsAndPosts() {
            const jwtToken = getCookie("jwt");

            if (!jwtToken) {
                window.location.href = "login.html";
                return;
            }

            try {
                const response = await fetch(`${apiUrl}/users/profile`, {
                    headers: {
                        'Authorization': 'Bearer ' + jwtToken
                    }
                });

                if (response.ok) {
                    const userDetails = await response.json();
                    email = userDetails.email;

                    userInfo.innerHTML = `
                        <h2>${escapeHtml(userDetails.username)}</h2>
                        <p>Email: ${escapeHtml(userDetails.email)}</p>
                    `;

                    const postsResponse = await fetch(`${apiUrl}/events/posted`, {
                        headers: {
                            'Authorization': 'Bearer ' + jwtToken
                        }
                    });

                    if (postsResponse.ok) {
                        const posts = await postsResponse.json();
                        postsContainer.innerHTML = '';

                        posts.forEach(post => {
                            const postDiv = document.createElement('div');
                            postDiv.className = 'post';
                            postDiv.innerHTML = `
                                <h3>${escapeHtml(post.title)}</h3>
                                <p>${escapeHtml(post.description)}</p>
                                <button class="edit-btn" data-id="${post.id}">Redaguoti</button>
                                <button class="delete-btn" data-id="${post.id}">Ištrinti</button>
                            `;

                            postsContainer.appendChild(postDiv);
                        });

                        const editButtons = document.querySelectorAll('.edit-btn');
                        editButtons.forEach(button => {
                            button.addEventListener('click', (event) => {
                                const postId = event.target.getAttribute('data-id');
                                window.location.href = `editPost.html?id=${postId}`;
                            });
                        });

                        const deleteButtons = document.querySelectorAll('.delete-btn');
                        deleteButtons.forEach(button => {
                            button.addEventListener('click', async (event) => {
                                const postId = event.target.getAttribute('data-id');
                                const confirmation = confirm('Are you sure you want to delete this post?');

                                if (confirmation) {
                                    const deleteResponse = await fetch(`${apiUrl}/events/${postId}`, {
                                        method: 'DELETE',
                                        headers: {
                                            'Authorization': 'Bearer ' + jwtToken
                                        }
                                    });

                                    if (deleteResponse.ok) {
                                        alert('Post deleted successfully.');
                                        getUserDetailsAndPosts();
                                    } else {
                                        alert('Failed to delete post.');
                                    }
                                }
                            });
                        });
                    } else {
                        console.error('Failed to fetch posts.');
                    }
                } else {
                    console.error('Failed to fetch user details.');
                    window.location.href = "login.html";
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }

        if (window.location.pathname.endsWith('user.html')) {
            getUserDetailsAndPosts();
        }

        // Login Form
        document.getElementById("login-form").addEventListener("submit", async function(event) {
            event.preventDefault();

            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            const loginData = {
                username: username,
                password: password
            };

            try {
                const response = await fetch(`${apiUrl}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(loginData)
                });

                if (response.ok) {
                    const result = await response.json();
                    setCookie("jwt", result.jwtToken, 1);
                    window.location.href = "index.html";
                } else {
                    alert("Login failed. Please check your credentials.");
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });

        // Registration Form
        document.getElementById("registration-form").addEventListener("submit", async function(event) {
            event.preventDefault();

            const email = document.getElementById("email").value;
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("password-confirm").value;

            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            const registrationData = {
                email: email,
                username: username,
                password: password
            };

            try {
                const response = await fetch(`${apiUrl}/users/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(registrationData)
                });

                if (response.ok) {
                    window.location.href = "login.html";
                } else {
                    alert("Registration failed.");
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });

        // Adjust Navigation Menu Based on Auth Status
        const updateNavItems = () => {
            const navItems = document.getElementById('nav-items');
            const jwtToken = getCookie('jwt');
            navItems.innerHTML = ''; // Clear existing nav items

            if (jwtToken) {
                navItems.innerHTML = `
                    <li><a href="index.html">Home</a></li>
                    <li><a href="user.html">User Info</a></li>
                    <li><a href="eventForm.html">Create Event</a></li>
                    <li><a href="#" id="logout">Logout</a></li>
                `;
            } else {
                navItems.innerHTML = `
                    <li><a href="index.html">Home</a></li>
                    <li><a href="login.html">Login</a></li>
                    <li><a href="register.html">Register</a></li>
                `;
            }
        };

        document.addEventListener('DOMContentLoaded', () => {
            updateNavItems();

            const logoutBtn = document.getElementById('logout');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    document.cookie = 'jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                    window.location.href = 'index.html';
                });
            }
        });