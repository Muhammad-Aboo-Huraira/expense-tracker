// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  updateDoc,
  onSnapshot,
  doc,
  collection,
  addDoc,
  orderBy,
  deleteDoc,
  query,
  where,
  getDocs,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCpgox0LDNhd1B8qcd-hFZ5PV7vrkNSWQ8",
  authDomain: "expense-tracker-2-8edca.firebaseapp.com",
  projectId: "expense-tracker-2-8edca",
  storageBucket: "expense-tracker-2-8edca.appspot.com",
  messagingSenderId: "413423433388",
  appId: "1:413423433388:web:ba8f5cb5994938b4b39109",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

function showLoader() {
  document.getElementById("loader-wrapper").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loader-wrapper").style.display = "none";
}
showLoader();
setTimeout(() => {
  hideLoader();
}, 5000);

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

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const user = auth.currentUser;
    const banksCollection = collection(db, "banks");
    const banksQuery = query(banksCollection, where("user_id", "==", user.uid));
    const accountsCollection = collection(db, "accounts");
    const accountsQuery = query(
      accountsCollection,
      where("user_id", "==", user.uid)
    );
    const accountsSnapshot = await getDocs(accountsQuery);

    let bankSelect = document.querySelector(".bank-select");
    let addAccBtn = document.querySelector(".add-acc");
    let addAccName = document.querySelector(".addAccName");
    let addAccAmount = document.querySelector(".addAccAmount");
    let allAccContainer = document.querySelector(".all-acc");
    let delAccBtn = document.getElementById("delAccBtn");
    let addCatBtn = document.getElementById("addCatBtn");
    let addCatInp = document.querySelector(".addCatInp");
    let deleteCatBtn = document.getElementById("deleteCatBtn");
    let addCatSel = document.querySelector(".catSel");
    let accCashContainer = document.querySelector(".accCash-container");
    let accBankContainer = document.querySelector(".accBank-container");
    let accSavContainer = document.querySelector(".accSav-container");
    let incomeBtn = document.getElementById("incomeBtn");
    let expenseBtn = document.getElementById("expenseBtn");
    let transHisttable = document.querySelector("#TransHisttable");

    const addAccForm = document.querySelector(".addAccForm");
    const submitButton = addAccForm.querySelector('button[type="submit"]');
    const loader = document.createElement("span");
    loader.className = "loader";

    const usersCollection = collection(db, "users");
    const userQuery = query(usersCollection, where("user_id", "==", user.uid));

    try {
      const userSnapshot = await getDocs(userQuery);

      // Check if there is a document matching the query
      if (!userSnapshot.empty) {
        // Get the first document (assuming there should be only one)
        const userData = userSnapshot.docs[0].data();

        // Access user data, for example, the username
        const username = userData.username;

        // Update the "Hello Shawn!" text with the retrieved username
        document.querySelector("#greeting").innerText = `Welcome ${username}!`;
      } else {
        console.error("User document does not exist.");
      }
    } catch (error) {
      console.error("Error querying user:", error.message);
    }

    addAccBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      submitButton.disabled = true;
      submitButton.innerHTML = "";
      submitButton.appendChild(loader);
      clearErrorMessages();
      try {
        // Ensure that the user is authenticated
        const user = auth.currentUser;
        if (!user) {
          console.error("User not authenticated.");
          return;
        }
        const accountName = addAccName.value.trim();
        const accountAmount = addAccAmount.value.trim();

        if (!accountName || !accountAmount) {
          displayErrorMessage(
            "Please fill in both account name and amount fields.",
            "addAcc-error"
          );
          addAccName.value = "";
          addAccAmount.value = "";
          setTimeout(() => {
            clearErrorMessages();
          }, 2000);
          submitButton.disabled = false;
          submitButton.innerHTML = "Add Account";
          return;
        }

        // Check if a bank with the same name already exists
        const existingBankQuery = query(
          collection(db, "banks"),
          where("user_id", "==", user.uid),
          where("bank_name", "==", addAccName.value)
        );

        const existingBankSnapshot = await getDocs(existingBankQuery);

        if (
          existingBankSnapshot.size > 0 ||
          accountName == "Cash" ||
          accountName == "Saving"
        ) {
          displayErrorMessage(
            "Account with the same name already exists!",
            "addAcc-error"
          );
          addAccName.value = "";
          addAccAmount.value = "";
          setTimeout(() => {
            clearErrorMessages();
          }, 2000);
          submitButton.disabled = false;
          submitButton.innerHTML = "Add Account";
          return;
        }
        if (accountAmount < 0 || accountAmount > 9999999999) {
          displayErrorMessage("Please enter valid amount", "addAcc-error");
          addAccName.value = "";
          addAccAmount.value = "";
          setTimeout(() => {
            clearErrorMessages();
          }, 2000);
          submitButton.disabled = false;
          submitButton.innerHTML = "Add Account";
          return;
        }
        const a = parseInt(addAccAmount.value);
        // Add a new bank document
        const banksDocRef = await addDoc(collection(db, "banks"), {
          user_id: user.uid,
          bank_name: addAccName.value,
          amount: a,
        });

        if (accountsSnapshot.size > 0) {
          // Assuming there is only one account document for a unique user
          const accountId = accountsSnapshot.docs[0].id;
          // Update the account document with the bank reference
          const accountsDocRef = doc(db, "accounts", accountId);
          await updateDoc(accountsDocRef, {
            bank_ref: banksDocRef,
          });
          displaySuccessMessage(
            "Bank added and linked to the account successfully!",
            "addAcc-error"
          );
          addAccName.value = "";
          addAccAmount.value = "";
          setTimeout(() => {
            clearErrorMessages();
          }, 2000);
          submitButton.disabled = false;
          submitButton.innerHTML = "Add Account";
        } else {
          console.error("No account found for the user.");
        }
      } catch (error) {
        console.error("Error adding bank and linking to account: ", error);
      }
    });

    bankSelect.innerHTML = "";
    const optionElementCash = document.createElement("option");
    optionElementCash.value = "Cash"; // Use document ID as the value
    optionElementCash.textContent = "Cash";
    optionElementCash.id = "Cash";
    bankSelect.appendChild(optionElementCash);

    // Option for "Saving"
    const optionElementSaving = document.createElement("option");
    optionElementSaving.value = "Saving"; // Use document ID as the value
    optionElementSaving.textContent = "Saving";
    optionElementSaving.id = "Saving";
    bankSelect.appendChild(optionElementSaving);

    onSnapshot(banksQuery, (snapshot) => {
      bankSelect.innerHTML = "";
      bankSelect.appendChild(optionElementCash);
      bankSelect.appendChild(optionElementSaving);

      snapshot.forEach((data) => {
        const bankData = data.data();
        const documentId = data.id;

        // Check if bank_name is defined
        if (bankData.bank_name) {
          const optionElement = document.createElement("option");
          optionElement.value = documentId;
          optionElement.textContent = `${bankData.bank_name}`;
          optionElement.id = bankData.bank_name;
          bankSelect.appendChild(optionElement);
        } else {
          return;
        }
      });
    });
    let totalBankAmount = 0;
    function updateTotalAmount() {
      const cashValue = parseInt(
        document.querySelector(".accCash-container strong").textContent
      );
      const bankValue = totalBankAmount;
      const savingValue = parseInt(
        document.querySelector(".accSav-container strong").textContent
      );

      const totalAmount = cashValue + bankValue + savingValue;

      // Update the total amount in the header
      const totalAmountElement = document.querySelector(
        ".amount-container strong"
      );
      totalAmountElement.textContent = `PKR ${totalAmount}`;
    }

    function initializeTotalBankAmount() {
      // Query the banks collection to get the initial total bank amount
      getDocs(banksQuery)
        .then((snapshot) => {
          totalBankAmount = 0;
          snapshot.forEach((doc) => {
            const bankData = doc.data();
            const bankAmount = bankData.amount || 0;
            totalBankAmount += bankAmount;
          });

          // Update the total amount on page load
          updateTotalAmount();
        })
        .catch((error) => {
          console.error("Error initializing total bank amount: ", error);
        });
    }
    allAccContainer.innerHTML = "";
    let querySnapshot = await getDocs(accountsQuery);
    const documentId = querySnapshot.docs[0];
    const fi = documentId._document.data.value.mapValue.fields;

    allAccContainer.innerHTML = "";

    const cashOption = document.createElement("option");
    const savingsOption = document.createElement("option");
    cashOption.value = documentId.id;
    cashOption.id = "Cash";
    cashOption.textContent = `Cash: ${fi.Cash.integerValue}`;
    savingsOption.value = documentId.id;
    savingsOption.id = "Saving";
    savingsOption.textContent = `Saving: ${fi.Saving.integerValue}`;
    allAccContainer.appendChild(cashOption);
    allAccContainer.appendChild(savingsOption);

    onSnapshot(banksQuery, (snapshot) => {
      initializeTotalBankAmount();
      snapshot.docChanges().forEach((change) => {
        const bankData = change.doc.data();
        const bankAmount = bankData.amount;

        if (change.type === "added") {
          if (bankAmount) {
            // Update totalBankAmount when a new bank is added
            totalBankAmount += bankAmount;
          } else {
            return;
          }
        } else if (change.type === "removed") {
          // Update totalBankAmount when a bank is removed
          totalBankAmount -= bankAmount;
        }

        // Display total amount from Banks

        accBankContainer.innerHTML = `<p>Banks</p>
        <strong>${totalBankAmount}</strong>`;
        // Update the total amount
        updateTotalAmount();

        // Rest of your code for handling "added" changes
        if (change.type === "added" && bankAmount) {
          const optionElement = document.createElement("option");
          optionElement.id = bankData.bank_name;
          optionElement.value = change.doc.id;
          optionElement.textContent = `${bankData.bank_name}: ${bankAmount}`;
          allAccContainer.appendChild(optionElement);
        }
      });
    });

    // Display Cash
    accCashContainer.innerHTML = `<p>Cash</p>
    <strong>${fi.Cash.integerValue}</strong>`;
    // Display Savings
    accSavContainer.innerHTML = `<p>Savings</p>
          <strong>${fi.Saving.integerValue}</strong>`;

    const deleteCatSel = document.querySelector(".catSel");
    const modalOverlay = document.getElementById("modal-overlay");
    const confirmationModal = document.getElementById("confirmation-modal");
    const confirmationMessage = document.getElementById("confirmation-message");
    const confirmDeleteBtn = document.getElementById("confirm-delete");
    const cancelDeleteBtn = document.getElementById("cancel-delete");

    let deleteType; // Variable to track the type of deletion

    // Function to open the confirmation modal
    function openConfirmationModal(type, message) {
      deleteType = type; // Set the delete type
      confirmationMessage.textContent = message;
      modalOverlay.style.display = "block";
      confirmationModal.style.display = "block";
    }

    // Event listener for "Yes" button
    confirmDeleteBtn.addEventListener("click", async (e) => {
      try {
        e.preventDefault();
        if (deleteType === "account") {
          confirmDeleteBtn.disabled = true;
          confirmDeleteBtn.innerHTML = "";
          confirmDeleteBtn.appendChild(loader);
          const selectedAccountId = getSelectedAccountId();
          const allAccSelect = document.querySelector(".all-acc");
          const selectedOption =
            allAccSelect.options[allAccSelect.selectedIndex];

          if (!selectedAccountId) {
            displayErrorMessage(
              "Please select an account to delete.",
              "delAcc-error"
            );
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.innerHTML = "Yes";
            addAccForm.reset();
            setTimeout(() => {
              clearErrorMessages();
            }, 2000);
            return;
          }
          if (
            selectedOption == allAccSelect.options[0] ||
            selectedOption == allAccSelect.options[1]
          ) {
            displayErrorMessage(
              "Default accounts cannot be deleted!!",
              "delAcc-error"
            );
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.innerHTML = "Yes";
            addAccForm.reset();
            setTimeout(() => {
              clearErrorMessages();
            }, 2000);
            return;
          }

          await deleteAccount(selectedAccountId);
          displaySuccessMessage(
            "Bank deleted from the account successfully!",
            "delAcc-error"
          );
          confirmDeleteBtn.disabled = false;
          confirmDeleteBtn.innerHTML = "Yes";
          addAccForm.reset();
          setTimeout(() => {
            clearErrorMessages();
          }, 2000);
          updateTotalAmount();
        } else if (deleteType === "category") {
          confirmDeleteBtn.disabled = true;
          confirmDeleteBtn.innerHTML = "";
          confirmDeleteBtn.appendChild(loader);
          const selectedCategoryOptions =
          deleteCatSel.options[deleteCatSel.selectedIndex];
          // Check if the selected category is one of the first three categories
          
          if (!selectedCategoryOptions) {
            displayErrorMessage(
              "Please select a category to delete!",
              "addCat-error"
              );
              confirmDeleteBtn.disabled = false;
              confirmDeleteBtn.innerHTML = "Yes";
              addCatForm.reset();
              setTimeout(() => {
                clearErrorMessages();
              }, 2000);
              return;
            }
            const selectedCategory =
            deleteCatSel.options[deleteCatSel.selectedIndex].id;
            const isDefaultCategory = isDefaultCategoryToDelete(selectedCategory);
          if (isDefaultCategory) {
            displayErrorMessage(
              "Default categories cannot be deleted!",
              "addCat-error"
            );
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.innerHTML = "Yes";
            addCatForm.reset();
            setTimeout(() => {
              clearErrorMessages();
            }, 2000);
            return;
          }

          await deleteCategoryFromTransactionDetails(selectedCategory);
          displaySuccessMessage(
            "Category deleted successfully!",
            "addCat-error"
          );
          confirmDeleteBtn.disabled = false;
          confirmDeleteBtn.innerHTML = "Yes";
          addCatForm.reset();
          setTimeout(() => {
            clearErrorMessages();
          }, 2000);
        }
      } catch (error) {
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.innerHTML = "Yes";
        console.error("Error during deletion: ", error);
      } finally {
        modalOverlay.style.display = "none";
        confirmationModal.style.display = "none";
      }
    });

    // Event listener for "Cancel" button
    cancelDeleteBtn.addEventListener("click", () => {
      modalOverlay.style.display = "none";
      confirmationModal.style.display = "none";
    });

    delAccBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openConfirmationModal(
        "account",
        "Are you sure you want to delete the account?"
      );
    });

    deleteCatBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openConfirmationModal(
        "category",
        "Are you sure you want to delete the category?"
      );
    });
    // Function to get the selected account ID from the dropdown
    function getSelectedAccountId() {
      const allAccSelect = document.querySelector(".all-acc");
      return allAccSelect.value; // Assuming the value is set to the account ID
    }

    // Function to delete the account using the account ID
    async function deleteAccount(accountId) {
      try {
        const accountRef = doc(db, "banks", accountId);
        const accountSnapshot = await getDoc(accountRef);

        const accountData = accountSnapshot.data();
        const bankRef = accountData.bank_ref;

        if (bankRef) {
          console.log("Deleting bank document with reference:", bankRef.path);
          await deleteDoc(bankRef);
        }
        await deleteDoc(accountRef);

        // Remove the selected option from the dropdown
        const allAccSelect = document.querySelector(".all-acc");
        const selectedOption = allAccSelect.options[allAccSelect.selectedIndex];
        allAccSelect.remove(selectedOption.index);
      } catch (error) {
        console.error("Error deleting account: ", error);
      }
    }
    
    function isDefaultCategoryToDelete(category) {
      const defaultCategories = ["Home", "Shopping", "Utility Bills"];
      return defaultCategories.includes(category);
    }

    // Function to delete a category from the array within the "transactionDetails" collection
    async function deleteCategoryFromTransactionDetails(categoryToDelete) {
      try {
        const querySnapshot = await getDocs(
          collection(db, "transactionDetails")
        );

        if (querySnapshot.size > 0) {
          // Use Promise.all to wait for all asynchronous operations to complete
          await Promise.all(
            querySnapshot.docs.map(async (document) => {
              const docData = document.data();
              let categoriesArray = docData.category || [];

              // Check if the category exists in the array
              if (categoriesArray.includes(categoryToDelete)) {
                // Remove the category from the array
                categoriesArray = categoriesArray.filter(
                  (category) => category !== categoryToDelete
                );

                // Update the document with the modified array of categories
                await updateDoc(doc(db, "transactionDetails", document.id), {
                  category: categoriesArray,
                });
              }
            })
          );

          // Listen for changes to the document
          const documentRef = doc(
            db,
            "transactionDetails",
            querySnapshot.docs[0].id
          );
          onSnapshot(documentRef, (doc) => {
            const updatedData = doc.data();

            // Assuming "deleteCatSel" is the select element for deleting categories
            const deleteCatSel = document.querySelector(".catSel");

            // Clear existing options
            deleteCatSel.innerHTML = "";

            // Populate options with the updated categories
            updatedData.category.forEach((category) => {
              const optionElement = document.createElement("option");
              optionElement.value = querySnapshot.docs[0].id;
              optionElement.id = category;
              optionElement.textContent = category;
              deleteCatSel.appendChild(optionElement);
            });
          });
        }
      } catch (error) {
        console.error("Error deleting category: ", error);
      }
    }

    const querySnapshot1 = await getDocs(collection(db, "transactionDetails"));
    const documentId1 = querySnapshot1.docs[0];
    const fi1 = documentId1._document.data.value.mapValue.fields;

    fi1.category.arrayValue.values.map((e) => {
      let cat = e.stringValue;

      // Create a new table row
      const catSelOp = document.createElement("option");
      catSelOp.value = documentId.id;
      catSelOp.id = cat;
      catSelOp.textContent = cat;
      addCatSel.appendChild(catSelOp);
    });

    const addCatForm = document.querySelector(".addCatForm");
    const catButton = addCatForm.querySelector('button[type="submit"]');
    loader.className = "loader";

    addCatBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      catButton.disabled = true;
      catButton.innerHTML = "";
      catButton.appendChild(loader);

      try {
        const newCategory = getNewCategory();
        if (!newCategory) {
          displayErrorMessage("Please enter a new category.", "addCat-error");
          setTimeout(() => {
            clearErrorMessages();
          }, 2000);
          catButton.disabled = false;
          catButton.innerHTML = "Add Category";
          return;
        }

        await addCategoryToTransactionDetails(newCategory);
        displaySuccessMessage("Category added successfully!", "addCat-error");
        addCatInp.value = "";
        setTimeout(() => {
          clearErrorMessages();
        }, 2000);
        catButton.disabled = false;
        catButton.innerHTML = "Add Category";
      } catch (error) {
        console.error("Error adding category: ", error);
      }
    });

    // Function to get the new category from the input
    function getNewCategory() {
      return addCatInp.value.trim();
    }
    async function addCategoryToTransactionDetails(newCategory) {
      try {
        const querySnapshot = await getDocs(
          collection(db, "transactionDetails")
        );

        if (querySnapshot.size > 0) {
          querySnapshot.forEach(async (document) => {
            const docData = document.data();
            const categoriesArray = docData.category || [];

            // Check if the category already exists in the array
            if (!categoriesArray.includes(newCategory)) {
              // Add the new category to the array
              categoriesArray.push(newCategory);

              // Update the document with the modified array of categories
              await updateDoc(doc(db, "transactionDetails", document.id), {
                category: categoriesArray,
              });
            }
          });

          // Listen for changes to the document
          const documentRef = doc(
            db,
            "transactionDetails",
            querySnapshot.docs[0].id
          );
          onSnapshot(documentRef, (doc) => {
            const updatedData = doc.data();

            addCatSel.innerHTML = "";

            // Populate options with the updated categories
            updatedData.category.forEach((category) => {
              const optionElement = document.createElement("option");
              optionElement.value = querySnapshot.docs[0].id;
              optionElement.id = category;
              optionElement.textContent = category;
              addCatSel.appendChild(optionElement);
            });
          });
        }
      } catch (error) {
        console.error("Error adding category: ", error);
        console.log(error);
      }
    }

    const incExpForm = document.querySelector(".incExp");
    const incomeBtnForm = incExpForm.querySelector('button[type="incomeBtn"]');
    const expenseBtnForm = incExpForm.querySelector(
      'button[type="expenseBtn"]'
    );
    loader.className = "loader";

    incomeBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      incomeBtnForm.disabled = true;
      incomeBtnForm.innerHTML = "";
      incomeBtnForm.appendChild(loader);
      try {
        const user = auth.currentUser;

        // Get the selected bank, category, and amount
        const bankOp = document.querySelector(".bank-select");
        const optId = bankOp.options[bankOp.selectedIndex];
        const selectedBankId = bankOp.value;
        const amount = document.getElementById("amount").value;

        // Validate if all required fields are selected/entered
        if (!selectedBankId || !amount) {
          displayErrorMessage(
            "Please select a bank and enter the amount.",
            "incExp-error"
          );
          incExpForm.reset();
          addCatForm.reset();
          setTimeout(() => {
            clearErrorMessages();
          }, 2000);
          return;
        }
        if (amount < 0 || amount > 100000000) {
          displayErrorMessage("Please enter valid amount.", "incExp-error");
          incExpForm.reset();
          addCatForm.reset();
          setTimeout(() => {
            clearErrorMessages();
          }, 2000);
          return;
        }

        // Convert amount to integer
        const incomeAmount = parseInt(amount);

        // Determine the type of selected option based on its document ID
        const isCash = selectedBankId === "Cash";
        const isSaving = selectedBankId === "Saving";

        if (isCash || isSaving) {
          // Update cash or saving in the accounts table
          const accountsCollection = collection(db, "accounts");
          const accountsQuery = query(
            accountsCollection,
            where("user_id", "==", user.uid)
          );

          // Use onSnapshot to listen for changes
          const unsubscribeAccounts = onSnapshot(accountsQuery, (snapshot) => {
            if (snapshot.size > 0) {
              const accountsDocRef = snapshot.docs[0].ref;
              const currentField = isCash ? "Cash" : "Saving";
              const currentAmount = snapshot.docs[0].data()[currentField] || 0;

              updateDoc(accountsDocRef, {
                [currentField]: currentAmount + incomeAmount,
              });

              const currentDate = new Date();
              const formattedDate = currentDate.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              const formattedTime = currentDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
              });

              addDoc(collection(db, "transactionHistory"), {
                user_id: user.uid,
                category: "Money Received",
                bank: optId.innerHTML,
                date: formattedDate,
                type: "income",
                amount: incomeAmount,
                time: formattedTime,
              });

              if (isCash) {
                accCashContainer.innerHTML = `<p>Cash</p><strong>${
                  currentAmount + incomeAmount
                }</strong>`;
                const cash = parseInt(fi.Cash.integerValue);
                cashOption.textContent = `Cash: ${cash + incomeAmount}`;
                updateTotalAmount();
              } else {
                // Display Savings
                accSavContainer.innerHTML = `<p>Savings</p><strong>${
                  currentAmount + incomeAmount
                }</strong>`;
                const Saving = parseInt(fi.Saving.integerValue);
                savingsOption.textContent = `Saving: ${Saving + incomeAmount}`;
                updateTotalAmount();
              }
              displaySuccessMessage(
                "Income recorded successfully!",
                "incExp-error"
              );
              incomeBtnForm.disabled = false;
              incomeBtnForm.innerHTML = "Record Income";
              incExpForm.reset();
              addCatForm.reset();
              updateTransactionHistoryTable();
              updateDonutChartFromFirestore();
              setTimeout(() => {
                clearErrorMessages();
              }, 2000);
              unsubscribeAccounts();
            }
          });
        } else {
          // Update the selected bank's amount
          const bankDocRef = doc(db, "banks", selectedBankId);
          const bankSnapshot = await getDoc(bankDocRef);

          if (bankSnapshot.exists()) {
            const currentAmount = bankSnapshot.data().amount || 0;

            await updateDoc(bankDocRef, {
              amount: currentAmount + incomeAmount,
            });

            const currentDate = new Date();
            const formattedDate = currentDate.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            });
            const formattedTime = currentDate.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
            });

            await addDoc(collection(db, "transactionHistory"), {
              user_id: user.uid,
              category: "Money Received",
              bank: optId.innerHTML,
              date: formattedDate,
              type: "income",
              amount: incomeAmount,
              time: formattedTime,
            });
            // Display total amount from Banks
            accBankContainer.innerHTML = `<p>Banks</p>
                <strong>${totalBankAmount}</strong>`;
            const bankOption = allAccContainer.querySelector(`#${optId.id}`);
            if (bankOption) {
              bankOption.textContent = `${optId.id}: ${
                currentAmount + incomeAmount
              }`;
            }
            displaySuccessMessage(
              "Income recorded successfully!",
              "incExp-error"
            );
            incomeBtnForm.disabled = false;
            incomeBtnForm.innerHTML = "Record Income";
            incExpForm.reset();
            addCatForm.reset();
            updateTransactionHistoryTable();
            updateDonutChartFromFirestore();
            setTimeout(() => {
              clearErrorMessages();
            }, 2000);
          } else {
            console.error("Selected bank does not exist.");
          }
        }
      } catch (error) {
        console.error("Error recording income: ", error);
        alert("Error recording income. Please check the console for details.");
      }
    });

    expenseBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      expenseBtnForm.disabled = true;
      expenseBtnForm.innerHTML = "";
      expenseBtnForm.appendChild(loader);
      try {
        const user = auth.currentUser;

        // Get the selected bank, category, and amount
        const bankOp = document.querySelector(".bank-select");
        const category = document.querySelector(".catSel").value;
        const cat = document.querySelector(".catSel");
        const catId = cat.options[cat.selectedIndex];
        const selectedBankId = bankOp.value;
        const amount = document.getElementById("amount").value;
        const optId = bankOp.options[bankOp.selectedIndex];

        if (!selectedBankId || !amount || !category) {
          displayErrorMessage(
            "Please select a bank, a category and enter the amount.",
            "incExp-error"
          );
          expenseBtnForm.disabled = false;
          expenseBtnForm.innerHTML = "Record Expense";
          incExpForm.reset();
          addCatForm.reset();
          setTimeout(() => {
            clearErrorMessages();
          }, 2000);
          return;
        }
        if (amount < 0 || amount > 100000000) {
          displayErrorMessage("Please enter a valid amount.", "incExp-error");
          expenseBtnForm.disabled = false;
          expenseBtnForm.innerHTML = "Record Expense";
          incExpForm.reset();
          addCatForm.reset();
          setTimeout(() => {
            clearErrorMessages();
          }, 2000);
          return;
        }

        const expenseAmount = parseInt(amount);

        // Determine the type of selected option based on its document ID
        const isCash = selectedBankId === "Cash";
        const isSaving = selectedBankId === "Saving";

        if (isCash || isSaving) {
          // Update cash or saving in the accounts table
          const accountsCollection = collection(db, "accounts");
          const accountsQuery = query(
            accountsCollection,
            where("user_id", "==", user.uid)
          );

          // Use onSnapshot to listen for changes
          const unsubscribeAccounts = onSnapshot(accountsQuery, (snapshot) => {
            if (snapshot.size > 0) {
              const accountsDocRef = snapshot.docs[0].ref;
              const currentField = isCash ? "Cash" : "Saving";
              const currentAmount = snapshot.docs[0].data()[currentField] || 0;

              if (currentAmount < expenseAmount) {
                displayErrorMessage(
                  "You do not have enough money in your selected account!",
                  "incExp-error"
                );
                expenseBtnForm.disabled = false;
                expenseBtnForm.innerHTML = "Record Expense";
                incExpForm.reset();
                addCatForm.reset();
                setTimeout(() => {
                  clearErrorMessages();
                }, 2000);
                return;
              }

              updateDoc(accountsDocRef, {
                [currentField]: currentAmount - expenseAmount,
              });

              const currentDate = new Date();
              const formattedDate = currentDate.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              const formattedTime = currentDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
              });

              addDoc(collection(db, "transactionHistory"), {
                user_id: user.uid,
                category: catId.innerHTML,
                bank: optId.innerHTML,
                date: formattedDate,
                type: "expense",
                amount: expenseAmount,
                time: formattedTime,
              });
              if (isCash) {
                accCashContainer.innerHTML = `<p>Cash</p><strong>${
                  currentAmount - expenseAmount
                }</strong>`;
                const cash = parseInt(fi.Cash.integerValue);
                cashOption.textContent = `Cash: ${cash - expenseAmount}`;
                updateTotalAmount();
              } else {
                // Display Savings
                accSavContainer.innerHTML = `<p>Savings</p><strong>${
                  currentAmount - expenseAmount
                }</strong>`;
                const Saving = parseInt(fi.Saving.integerValue);
                savingsOption.textContent = `Saving: ${Saving - expenseAmount}`;
                updateTotalAmount();
              }
              displaySuccessMessage(
                "Expense recorded successfully!",
                "incExp-error"
              );
              expenseBtnForm.disabled = false;
              expenseBtnForm.innerHTML = "Record Expense";
              incExpForm.reset();
              addCatForm.reset();
              updateTransactionHistoryTable();
              updateDonutChartFromFirestore();
              setTimeout(() => {
                clearErrorMessages();
              }, 2000);
              unsubscribeAccounts();
            }
          });
        } else {
          // Update the selected bank's amount
          const bankDocRef = doc(db, "banks", selectedBankId);

          // Use onSnapshot to listen for changes
          const unsubscribeBank = onSnapshot(bankDocRef, (snapshot) => {
            if (snapshot.exists()) {
              const currentAmount = snapshot.data().amount || 0;

              if (currentAmount < expenseAmount) {
                displayErrorMessage(
                  "You do not have enough money in your selected account!",
                  "incExp-error"
                );
                expenseBtnForm.disabled = false;
                expenseBtnForm.innerHTML = "Record Expense";
                incExpForm.reset();
                addCatForm.reset();
                setTimeout(() => {
                  clearErrorMessages();
                }, 2000);
                return;
              }

              updateDoc(bankDocRef, {
                amount: currentAmount - expenseAmount,
              });

              const currentDate = new Date();
              const formattedDate = currentDate.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              const formattedTime = currentDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
              });

              addDoc(collection(db, "transactionHistory"), {
                user_id: user.uid,
                category: catId.innerHTML,
                bank: optId.innerHTML,
                date: formattedDate,
                type: "expense",
                amount: expenseAmount,
                time: formattedTime,
              });

              totalBankAmount -= expenseAmount;
              accBankContainer.innerHTML = `<p>Banks</p>
                <strong>${totalBankAmount}</strong>`;

              const bankOption = allAccContainer.querySelector(`#${optId.id}`);
              if (bankOption) {
                bankOption.textContent = `${optId.id}: ${
                  currentAmount - expenseAmount
                }`;
              }
              displaySuccessMessage(
                "Expense recorded successfully!",
                "incExp-error"
              );
              expenseBtnForm.disabled = false;
              expenseBtnForm.innerHTML = "Record Expense";
              incExpForm.reset();
              addCatForm.reset();
              updateTransactionHistoryTable();
              updateDonutChartFromFirestore();
              setTimeout(() => {
                clearErrorMessages();
              }, 2000);
              unsubscribeBank();
            } else {
              console.error("Selected bank does not exist.");
            }
          });
        }
      } catch (error) {
        console.error("Error recording expense: ", error);
        alert("Error recording expense. Please check the console for details.");
      }
    });

    async function updateTransactionHistoryTable() {
      try {
        const user = auth.currentUser;
        const querySnapshot = await getDocs(
          query(
            collection(db, "transactionHistory"),
            where("user_id", "==", user.uid),
            orderBy("time", "desc")
          )
        );

        // Clear the existing rows in the table
        transHisttable.innerHTML = "";

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const row = transHisttable.insertRow();
          if (data.type == "expense") {
            row.innerHTML = `
              <td>${data.category}</td>
              <td>${data.bank}</td>
              <td>${data.date}</td>
              <td style="color: red;">-${data.amount}</td>
              <td style="color: red;"><div><button class="delHist">X</button></div></td>
              
            `;
            const deleteButton = row.querySelector(".delHist");
            deleteButton.addEventListener("click", async () => {
              try {
                // Remove the row from the table
                row.remove();

                // Delete the document from the Firebase collection using the time value
                const querySnapshot = await getDocs(
                  query(
                    collection(db, "transactionHistory"),
                    where("time", "==", data.time)
                  )
                );

                querySnapshot.forEach(async (doc) => {
                  await deleteDoc(doc.ref);
                });
                updateDonutChartFromFirestore();
              } catch (error) {
                console.error("Error deleting document:", error.message);
              }
            });
          } else {
            row.innerHTML = `
              <td>${data.category}</td>
              <td>${data.bank}</td>
              <td>${data.date}</td>
              <td style="color: green;">${data.amount}</td>
              <td style="color: red;"><div><button class="delHist">X</button></div></td>
            `;

            const deleteButton = row.querySelector(".delHist");
            deleteButton.addEventListener("click", async () => {
              try {
                // Remove the row from the table
                row.remove();

                // Delete the document from the Firebase collection using the time value
                const querySnapshot = await getDocs(
                  query(
                    collection(db, "transactionHistory"),
                    where("time", "==", data.time)
                  )
                );

                querySnapshot.forEach(async (doc) => {
                  await deleteDoc(doc.ref);
                });
                updateDonutChartFromFirestore();
              } catch (error) {
                console.error("Error deleting document:", error.message);
              }
            });
          }
        });
      } catch (error) {
        console.error(
          "Error updating transaction history table:",
          error.message
        );
      }
    }

    // Call this function to initially update the table
    updateTransactionHistoryTable();

    const options = {
      cutout: "70%", // Set the cutout percentage for the donut hole
    };

    // Get the canvas element and create the donut chart
    const ctx = document.getElementById("myDonutChart").getContext("2d");
    const myDonutChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Expense", "Income"],
        datasets: [
          {
            data: [0, 0],
            backgroundColor: ["red", "green"],
          },
        ],
      },
      options: options,
    });
    async function updateDonutChartFromFirestore() {
      try {
        const querySnapshot = await getDocs(
          query(
            collection(db, "transactionHistory"),
            where("user_id", "==", user.uid)
          )
        );

        let expenseTotal = 0;
        let incomeTotal = 0;

        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          const amount = docData.amount || 0;

          if (docData.type === "expense") {
            expenseTotal += amount;
          } else if (docData.type === "income") {
            incomeTotal += amount;
          }
        });

        // Update chart data
        myDonutChart.data.datasets[0].data = [expenseTotal, incomeTotal];

        // Update the chart
        myDonutChart.update();
      } catch (error) {
        console.error("Error fetching Firestore data:", error.message);
      }
    }

    updateDonutChartFromFirestore();
  } else {
    window.location.href = "signIn.html";
  }
});

const logoutButton = document.querySelector(".logout");
logoutButton.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      window.location.href = "signIn.html";
      window.history.replaceState(null, "", "/");
    })
    .catch((err) => {
      console.log(err.message);
    });
});
