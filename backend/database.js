    // 🔹 Import Firebase
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
    import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
    import { getFirestore, collection, addDoc, getDocs, query, orderBy, updateDoc, doc, increment } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
    import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-storage.js";

    // 🔹 Firebase Config (vervang met jouw project config!)
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT.firebaseapp.com",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_PROJECT.appspot.com",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);

    async function register() {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created!");
      } catch (err) { alert(err.message); }
    }

    async function login() {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Logged in!");
      } catch (err) { alert(err.message); }
    }

    async function logout() {
      await signOut(auth);
    }

    async function uploadPhoto(event) {
      const file = event.target.files[0];
      if (!file || !auth.currentUser) {
        alert("You need to login first!");
        return;
      }

      const storageRef = ref(storage, "photos/" + Date.now() + "-" + file.name);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await addDoc(collection(db, "photos"), {
        url: url,
        likes: 0,
        createdAt: new Date(),
        user: auth.currentUser.email
      });

      loadGallery();
    }

    async function likePhoto(photoId) {
      const photoRef = doc(db, "photos", photoId);
      await updateDoc(photoRef, { likes: increment(1) });
      loadGallery();
    }

    async function loadGallery() {
      const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const gallery = document.getElementById("gallery");
      gallery.innerHTML = "";
      snapshot.forEach((docSnap) => {
        const photo = docSnap.data();
        gallery.innerHTML += `
          <div class="card">
            <img src="${photo.url}" alt="">
            <div class="likes">
              ❤️ ${photo.likes} 
              <button onclick="likePhoto('${docSnap.id}')">+1</button>
            </div>
          </div>
        `;
      });
    }

    onAuthStateChanged(auth, (user) => {
      if (user) {
        document.getElementById("authSection").style.display = "none";
        document.getElementById("profileSection").style.display = "block";
        document.getElementById("userEmail").innerText = user.email;
        loadGallery();
      } else {
        document.getElementById("authSection").style.display = "block";
        document.getElementById("profileSection").style.display = "none";
      }
    });

    window.register = register;
    window.login = login;
    window.logout = logout;
    window.uploadPhoto = uploadPhoto;
    window.likePhoto = likePhoto;