import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
const firebaseConfig = {
  apiKey: "AIzaSyAQa_0QaX1s4fSsBDS_aFZtZkXulIqw04w",
  authDomain: "expense-trac-cd4b0.firebaseapp.com",
  projectId: "expense-trac-cd4b0",
  storageBucket: "expense-trac-cd4b0.appspot.com",
  messagingSenderId: "759018472466",
  appId: "1:759018472466:web:2e85f127a8c3cff2b9c4cb"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const signupForm = document.querySelector(".signup");
const submitButton = signupForm.querySelector('button[type="submit"]');
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
  const errorElements = document.querySelectorAll(".error-message");
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
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  submitButton.disabled = true;
  submitButton.innerHTML = "";
  submitButton.appendChild(loader);

  const usernameInput = signupForm.querySelector('[name="username"]');
  const emailInput = signupForm.querySelector('[name="email"]');
  const passwordInput = signupForm.querySelector('[name="psw"]');

  const username = usernameInput ? usernameInput.value : "";
  const email = emailInput ? emailInput.value : "";
  const password = passwordInput ? passwordInput.value : "";

  if (password.length < 6) {
    displayErrorMessage(
      "*Password should atleast be 6 characters.",
      "password-error"
    );
    passwordInput.value = "";
    setTimeout(() => {
      clearErrorMessages();
    }, 2000);
    submitButton.disabled = false;
    submitButton.innerHTML = "Signup";
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    signupForm.reset();
    // Add user to 'users' collection
    await addDoc(collection(db, "users"), {
      user_id: user.uid,
      email: email,
      username: username,
    });

    // Add initial accounts to 'accounts' collection
    const accountsDocRef = await addDoc(collection(db, "accounts"), {
      user_id: user.uid,
      Cash: 0,
      Saving: 0,
      bank_ref: null, // Placeholder for the bank reference
      // Add more accounts if needed
    });

    // Add initial banks to 'banks' collection
    const banksDocRef = await addDoc(collection(db, "banks"), {
      user_id: user.uid,
    });

    // Link the bank to the account
    await updateDoc(accountsDocRef, {
      bank_ref: banksDocRef,
    });
    addTransaction(
      user.uid,
      ["Home", "Shopping", "Utility Bills"],
      "Cash",
      new Date(),
      0
    );
    function addTransactionHistory(
      userId = user.uid,
      category = "DefaultCategory",
      type = "DefaultType",
      bank = "DefaultBank",
      date = new Date(),
      amount = 0,
      time = "DefaultTime"
    ) {
      const formattedDate = date.toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      addDoc(collection(db, "transactionHistory"), {
        user_id: userId,
        category: category,
        type: type,
        bank: bank,
        date: formattedDate,
        amount: amount,
        time: time,
      });
    }
    addTransactionHistory();
    submitButton.disabled = false;
    submitButton.innerHTML = "Signup";
    displaySuccessMessage("User signed up successfully!", "signup-success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 3000);
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      displayErrorMessage("*Email address already in use.", "email-error");
      emailInput.value = "";
      passwordInput.value = "";
      setTimeout(() => {
        clearErrorMessages();
      }, 2000);
      submitButton.disabled = false;
      submitButton.innerHTML = "Signup";
      return;
    }
    console.error("Error signing up:", error.message);
    submitButton.disabled = false;
    submitButton.innerHTML = "Signup";
  }
});

function addTransaction(userId, category, account, createdAt, amount) {
  const formattedDate = createdAt.toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  addDoc(collection(db, "transactionDetails"), {
    user_id: userId,
    category: category,
    account: account,
    created_at: formattedDate,
    amount: amount,
  });
}
