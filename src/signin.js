import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {
  collection,
  getFirestore,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAQa_0QaX1s4fSsBDS_aFZtZkXulIqw04w",
  authDomain: "expense-trac-cd4b0.firebaseapp.com",
  projectId: "expense-trac-cd4b0",
  storageBucket: "expense-trac-cd4b0.appspot.com",
  messagingSenderId: "759018472466",
  appId: "1:759018472466:web:2e85f127a8c3cff2b9c4cb"
};
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const loginForm = document.querySelector(".login");
const submitButton = loginForm.querySelector('button[type="submit"]');
const loader = document.createElement("span");
loader.className = "loader";

function displaySuccessMessage(message, successElementId) {
  const successElement = document.getElementById(successElementId);
  successElement.textContent = message;
  successElement.style.color = "green";
  successElement.style.fontSize = "13px";
}

function displayErrorMessage(message, errorElementId) {
  const errorElement = document.getElementById(errorElementId);
  errorElement.textContent = message;
  errorElement.style.color = "red";
  errorElement.style.fontSize = "13px";
}

function clearErrorMessages() {
  const errorElements = document.querySelectorAll(".status-message");
  errorElements.forEach((element) => {
    element.textContent = "";
  });
}
clearErrorMessages();

document
  .getElementById("togglePassword")
  .addEventListener("click", function () {
    const passwordInput = document.getElementById("password");
    passwordInput.type =
      passwordInput.type === "password" ? "text" : "password";
  });
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  submitButton.disabled = true;
  submitButton.innerHTML = "";
  submitButton.appendChild(loader);

  const email = loginForm.email.value;
  const password = loginForm.password.value;
  if (password.length < 6) {
    displayErrorMessage(
      "*Password should atleast be 6 characters.",
      "credential-status"
    );
    loginForm.password.value = "";
    setTimeout(() => {
      clearErrorMessages();
    }, 2000);
    submitButton.disabled = false;
    submitButton.innerHTML = "Signup";
    return;
  }
  const isEmailRegistered = await isEmailAlreadyRegistered(email);
  if (isEmailRegistered) {
    signInWithEmailAndPassword(auth, email, password)
      .then((cred) => {
        displaySuccessMessage("Logged in successfully!", "credential-status");
        loginForm.reset();
        submitButton.disabled = false;
        submitButton.innerHTML = "Login";
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 3000);
      })
      .catch((err) => {
        console.log(err.message);
        displayErrorMessage("Invalid credentials!", "credential-status");
        loginForm.reset();
        setTimeout(() => {
          clearErrorMessages()
        }, 2000);
        submitButton.disabled = false;
        submitButton.innerHTML = "Login";
      });
    clearErrorMessages();
  } else {
    displayErrorMessage(
      "Email is not registered, want to signup?",
      "credential-status"
    );
    loginForm.reset();
    setTimeout(() => {
      clearErrorMessages()
    }, 2000);
    submitButton.disabled = false;
    submitButton.innerHTML = "Login";
  }
});

async function isEmailAlreadyRegistered(enteredEmail) {
  try {
    const usersCollection = collection(db, "users");
    const querySnapshot = await getDocs(usersCollection);

    if (querySnapshot.size > 0) {
      // Loop through the documents in the "users" collection
      for (const doc of querySnapshot.docs) {
        const userEmail = doc.data().email;

        // Check if the entered email matches any user's email
        if (userEmail === enteredEmail) {
          return true; // Email is registered
        }
      }
    }

    return false; // Email is not registered
  } catch (error) {
    console.error("Error checking email registration:", error.message);
    return false; // Assume email is not registered in case of an error
  }
}
