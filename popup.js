document.addEventListener("DOMContentLoaded", () => {
    const policyNameInput = document.getElementById("policyName");
    const richTextBox = document.getElementById("richTextBox");
    const saveButton = document.getElementById("saveRichText");
    const policyList = document.getElementById("policyList");

    let editingIndex = null; // Track the index of the policy being edited

    // Load existing policies
    function loadPolicies() {
        policyList.innerHTML = ''; // Clear the list
        chrome.storage.local.get({ policies: [] }, (result) => {
            const policies = result.policies || [];
            policies.forEach((policyData, index) => {
                const { name, text } = policyData;

                const policyItem = document.createElement("div");
                policyItem.className = "policy-item";

                // Policy Name
                const policyName = document.createElement("h3");
                policyName.textContent = name || "Unnamed Policy";
                policyName.className = "policy-name";

                // Policy Text
                const policyText = document.createElement("p");
                policyText.innerHTML = text;

                // Action Buttons Container
                const actionsContainer = document.createElement("div");
                actionsContainer.className = "policy-item-actions";

                // Insert Button
                const insertButton = document.createElement("button");
                insertButton.textContent = "Insert";
                insertButton.addEventListener("click", () => {
                    copyToClipboard(text);
                    alert("Policy copied to clipboard!");
                });

                // Edit Button
                const editButton = document.createElement("button");
                editButton.textContent = "Edit";
                editButton.addEventListener("click", () => {
                    editPolicy(index);
                });

                // Delete Button
                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.addEventListener("click", () => {
                    deletePolicy(index);
                });

                // Add buttons to actions container
                actionsContainer.appendChild(insertButton);
                actionsContainer.appendChild(editButton);
                actionsContainer.appendChild(deleteButton);

                // Add elements to the policy item
                policyItem.appendChild(policyName);
                policyItem.appendChild(policyText);
                policyItem.appendChild(actionsContainer);

                policyList.appendChild(policyItem);
            });
        });
    }

    // Copy to Clipboard
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch((err) => {
            console.error("Could not copy text: ", err);
        });
    }

    // Save or Update a Policy
    saveButton.addEventListener("click", () => {
        const policyName = policyNameInput.value.trim();
        const richTextContent = richTextBox.innerHTML.trim();

        if (!policyName || policyName === "") {
            alert("Policy name cannot be empty!");
            return;
        }

        if (!richTextContent || richTextContent === "Type your policy here...") {
            alert("Policy text cannot be empty!");
            return;
        }

        chrome.storage.local.get({ policies: [] }, (result) => {
            const policies = result.policies || [];

            if (editingIndex !== null) {
                // Update an existing policy
                policies[editingIndex] = { name: policyName, text: richTextContent };
                editingIndex = null; // Reset editing index
                saveButton.textContent = "Save Policy"; // Reset button text
            } else {
                // Add a new policy
                policies.push({ name: policyName, text: richTextContent });
            }

            chrome.storage.local.set({ policies }, () => {
                alert("Policy saved!");
                loadPolicies(); // Reload the policy list
                policyNameInput.value = ""; // Clear the name input
                richTextBox.innerHTML = ""; // Clear the editor
            });
        });
    });

    // Edit a policy
    function editPolicy(index) {
        chrome.storage.local.get({ policies: [] }, (result) => {
            const policies = result.policies || [];
            const policy = policies[index];
            if (policy) {
                policyNameInput.value = policy.name;
                richTextBox.innerHTML = policy.text;
                editingIndex = index; // Track the index of the policy being edited
                saveButton.textContent = "Update Policy"; // Change button text
            }
        });
    }

    // Delete a policy
    function deletePolicy(index) {
        chrome.storage.local.get({ policies: [] }, (result) => {
            const policies = result.policies || [];
            policies.splice(index, 1); // Remove the policy at the index
            chrome.storage.local.set({ policies }, () => {
                loadPolicies(); // Reload the policy list
            });
        });
    }

    // Load policies on page load
    loadPolicies();
});
