// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {
  getFirestore,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCpgox0LDNhd1B8qcd-hFZ5PV7vrkNSWQ8",
  authDomain: "expense-tracker-2-8edca.firebaseapp.com",
  projectId: "expense-tracker-2-8edca",
  storageBucket: "expense-tracker-2-8edca.appspot.com",
  messagingSenderId: "413423433388",
  appId: "1:413423433388:web:ba8f5cb5994938b4b39109",
};

// Initialize Firebase// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

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
const loginForm = document.querySelector(".login");
const submitButton = loginForm.querySelector('button[type="submit"]');
const loader = document.createElement("span");
loader.className = "loader";

const cancelBtn = document.querySelector(".cancelbtn");
cancelBtn.addEventListener("click", () => {
  window.location.href = "signIn.html";
});

document.addEventListener("DOMContentLoaded", (e) => {
  e.preventDefault();
  const resetButton = document.querySelector("button");
  const emailInput = document.getElementById("email");
  clearErrorMessages();
  resetButton.addEventListener("click", async (e) => {
    e.preventDefault();

    submitButton.disabled = true;
    submitButton.innerHTML = "";
    submitButton.appendChild(loader);

    const enteredEmail = emailInput.value.trim();
    clearErrorMessages();
    // Check if the email exists in the "users" collection
    const isEmailRegistered = await isEmailAlreadyRegistered(enteredEmail);

    if (isEmailRegistered) {
      // Email is registered, send the password reset email
      sendPasswordResetEmail(auth, enteredEmail)
        .then(() => {
          displaySuccessMessage(
            "Password reset email sent, Check your inbox",
            "credential-status"
          );
          submitButton.disabled = false;
          submitButton.innerHTML = "Reset Password";
          emailInput.value = "";
        })
        .catch((error) => {
          displayErrorMessage(
            "Error sending password reset email!",
            "credential-status"
          );
        });
      clearErrorMessages();
    } else {
      // Email is not registered
      displayErrorMessage(
        "This email is not registered. Please enter a valid email!",
        "credential-status"
      );
      submitButton.disabled = false;
      submitButton.innerHTML = "Reset Password";
      emailInput.value = "";
    }
  });
  clearErrorMessages();
});

// Function to check if the email is already registered in the "users" collection
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