// Your Firebase configuration (from Step 2)
const firebaseConfig = {
    apiKey: "AIzaSyDQ4TXYzg12eryWDnovWPCqUxfSOZWQIck",
    authDomain: "yoyolinks-d64c6.firebaseapp.com",
    projectId: "yoyolinks-d64c6",
    storageBucket: "yoyolinks-d64c6.firebasestorage.app",
    messagingSenderId: "135608837798",
    appId: "1:135608837798:web:a7ab3bff6f03756f413667",
    measurementId: "G-VPXQSWWF9B"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
// Authentication functions
document.getElementById('loginBtn').addEventListener('click', () => {
    const email = prompt('Enter your email:');
    const password = prompt('Enter your password:');
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            alert('Logged in successfully!');
            toggleAuthButtons(true);
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
});

document.getElementById('signupBtn').addEventListener('click', () => {
    const email = prompt('Enter your email:');
    const password = prompt('Enter your password (min 6 characters):');
    
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            alert('Account created successfully!');
            toggleAuthButtons(true);
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            alert('Logged out successfully!');
            toggleAuthButtons(false);
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
});

function toggleAuthButtons(isLoggedIn) {
    document.getElementById('loginBtn').style.display = isLoggedIn ? 'none' : 'inline-block';
    document.getElementById('signupBtn').style.display = isLoggedIn ? 'none' : 'inline-block';
    document.getElementById('logoutBtn').style.display = isLoggedIn ? 'inline-block' : 'none';
}

// Check auth state
auth.onAuthStateChanged(user => {
    if (user) {
        toggleAuthButtons(true);
        loadLinks();
    } else {
        toggleAuthButtons(false);
    }
});
// Link management functions
document.getElementById('linkForm').addEventListener('submit', e => {
    e.preventDefault();
    
    if (!auth.currentUser) {
        alert('Please login to add links');
        return;
    }
    
    const title = document.getElementById('linkTitle').value;
    const url = document.getElementById('linkUrl').value;
    const code = Math.floor(100000 + Math.random() * 900000); // 6-digit code
    
    db.collection('links').add({
        title,
        url,
        code,
        views: 0,
        likes: 0,
        dislikes: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: auth.currentUser.uid
    })
    .then(() => {
        alert(`Link created! Share with code: ${code}`);
        document.getElementById('linkForm').reset();
        loadLinks();
    })
    .catch(error => {
        alert('Error adding link: ' + error.message);
    });
});

function loadLinks(filter = 'trending') {
    let query = db.collection('links');
    
    switch(filter) {
        case 'recent':
            query = query.orderBy('createdAt', 'desc');
            break;
        case 'popular':
            query = query.orderBy('likes', 'desc');
            break;
        default: // trending
            query = query.orderBy('views', 'desc');
    }
    
    query.limit(20).get()
        .then(snapshot => {
            const linksContainer = document.getElementById('linksContainer');
            linksContainer.innerHTML = '';
            
            if (snapshot.empty) {
                linksContainer.innerHTML = '<p>No links found</p>';
                return;
            }
            
            snapshot.forEach(doc => {
                const link = doc.data();
                const linkElement = createLinkElement(link, doc.id);
                linksContainer.appendChild(linkElement);
            });
        })
        .catch(error => {
            console.error('Error loading links: ', error);
        });
}

function createLinkElement(link, id) {
    const linkElement = document.createElement('div');
    linkElement.className = 'link-card';
    linkElement.innerHTML = `
        <h3>${link.title}</h3>
        <p><a href="${link.url}" target="_blank">${link.url}</a></p>
        <p>Code: ${link.code} | Views: ${link.views}</p>
        <div class="actions">
            <button class="like-btn" data-id="${id}">👍 ${link.likes}</button>
            <button class="dislike-btn" data-id="${id}">👎 ${link.dislikes}</button>
            <button class="share-btn" data-code="${link.code}">Share</button>
        </div>
    `;
    return linkElement;
}
// Search and filtering
document.getElementById('searchBtn').addEventListener('click', searchLinks);

document.getElementById('searchInput').addEventListener('keyup', e => {
    if (e.key === 'Enter') {
        searchLinks();
    }
});

function searchLinks() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    
    if (!searchTerm) {
        loadLinks();
        return;
    }
    
    db.collection('links')
        .where('title', '>=', searchTerm)
        .where('title', '<=', searchTerm + '\uf8ff')
        .get()
        .then(snapshot => {
            const linksContainer = document.getElementById('linksContainer');
            linksContainer.innerHTML = '';
            
            if (snapshot.empty) {
                linksContainer.innerHTML = '<p>No matching links found</p>';
                return;
            }
            
            snapshot.forEach(doc => {
                const link = doc.data();
                const linkElement = createLinkElement(link, doc.id);
                linksContainer.appendChild(linkElement);
            });
        })
        .catch(error => {
            console.error('Error searching links: ', error);
        });
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadLinks(btn.dataset.filter);
    });
});
// Theme toggle
document.getElementById('themeToggle').addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
