
// ========================================
// JOBTRACK - JOB APPLICATION TRACKER
// Built by Irmak Arslan
// ========================================

// 1. SELECT HTML ELEMENTS

const applicationForm = document.getElementById("application-form");
const applicationsList = document.getElementById("applications-list");
const emptyMessage = document.getElementById("empty-message");
const searchInput = document.getElementById("search-input");
const filterStatus = document.getElementById("filter-status");


// 2. LOAD SAVED APPLICATIONS

let applications = [];
let editingApplicationId = null;

try {
    const savedApplications = localStorage.getItem(
        "jobtrack-applications"
    );

    const parsedApplications = savedApplications
        ? JSON.parse(savedApplications)
        : [];

    applications = Array.isArray(parsedApplications)
        ? parsedApplications
        : [];

} catch (error) {
    console.error("Could not load applications:", error);
}

// 3. SAVE APPLICATIONS

function saveApplications() {
    try {
        localStorage.setItem(
            "jobtrack-applications",
            JSON.stringify(applications)
        );
        return true;
    } catch (error) {
        console.error("Could not save applications:", error);
        return false;
    }
}

// 4. ADD NEW APPLICATION

applicationForm.addEventListener("submit", function(event) {

    event.preventDefault();

    // Get form values
    const company = document.getElementById("company").value.trim();
    const position = document.getElementById("position").value.trim();
    const jobType = document.getElementById("job-type").value;
    const location = document.getElementById("location").value.trim();
    const applicationDate = document.getElementById("application-date").value;
    const status = document.getElementById("status").value;
    const notes = document.getElementById("notes").value.trim();

    // Validate required fields
    if (!company || !position || !jobType || !applicationDate) {
        alert("Please fill in all required fields.");
        return;
    }

    // Create new application object
    const newApplication = {
        id: crypto.randomUUID(),
        company: company,
        position: position,
        jobType: jobType,
        location: location,
        applicationDate: applicationDate,
        status: status,
        notes: notes
    };

    
     // Add a new application or update an existing one
     const previousApplications = applications.map(app => ({ ...app }));
     if (editingApplicationId !== null) {

     const index = applications.findIndex(function(app) {
        return app.id === editingApplicationId;
     });

     if (index === -1) {
        alert("Application not found.");
        return;
     }

     newApplication.id = editingApplicationId;
     applications[index] = newApplication;

     } else {
        applications.push(newApplication);
     }


    // Save to localStorage
     const saved = saveApplications();

     if (!saved) {
        applications = previousApplications;
        alert("Your changes could not be saved.");
        return;
     }
     

    // Exit editing mode if the edited application was deleted
     if (editingApplicationId === id) {
         resetEditingMode();
     }

     // Refresh dashboard
     displayApplications();
     updateStatistics();

     
     // Reset form and editing mode
     resetEditingMode();

});

// 5. DISPLAY APPLICATIONS


function displayApplications() {

    // Clear existing rows
    applicationsList.innerHTML = "";

    // Get search and filter values
    const searchText = searchInput.value.toLowerCase().trim();
    const selectedStatus = filterStatus.value;

    // Filter applications
    const filteredApplications = applications.filter(function(app) {

        const matchesSearch =
            app.company.toLowerCase().includes(searchText) ||
            app.position.toLowerCase().includes(searchText);

        const matchesStatus =
            selectedStatus === "All" ||
            app.status === selectedStatus;

        return matchesSearch && matchesStatus;
    });

    // Show message if no matching applications
    
     emptyMessage.style.display =
       filteredApplications.length === 0 ? "block" : "none";

     emptyMessage.textContent =
         applications.length === 0
            ? "No applications yet. Add your first one!"
            : "No matching applications found.";

    // Loop through filtered applications
    filteredApplications.forEach(function(application) {

        const row = document.createElement("tr");

        // Application information
        const values = [
            application.company,
            application.position,
            application.jobType,
            application.applicationDate
        ];

        values.forEach(function(value) {

            const cell = document.createElement("td");

            cell.textContent = value || "—";

            row.appendChild(cell);
        });

        // Status column
        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");

        statusBadge.className =
            "status-badge status-" +
            application.status.toLowerCase();

        statusBadge.textContent = application.status;

        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);

        
         // Actions column
        const actionsCell = document.createElement("td");

         // Create delete button
        const deleteButton = document.createElement("button");

         deleteButton.textContent = "Delete";
         deleteButton.className = "action-btn delete-btn";
         deleteButton.type = "button";

         // Listen for delete button click
         deleteButton.addEventListener("click", function() {
         deleteApplication(application.id);
        });

        // Create edit button
         const editButton = document.createElement("button");

         editButton.textContent = "Edit";
         editButton.className = "action-btn";
         editButton.type = "button";

         editButton.addEventListener("click", function() {
         editApplication(application.id);
         });

actionsCell.appendChild(editButton);

          // Add button to table
         actionsCell.appendChild(deleteButton);
         row.appendChild(actionsCell);


        // Add row to table
        applicationsList.appendChild(row);
    });
}

// 6. UPDATE DASHBOARD STATISTICS

function updateStatistics() {

    // Total applications
    document.getElementById("total-applications").textContent =
        applications.length;

    // Interviews
    const interviews = applications.filter(function(app) {
        return app.status === "Interview";
    });

    document.getElementById("total-interviews").textContent =
        interviews.length;

    // Offers
    const offers = applications.filter(function(app) {
        return app.status === "Offer";
    });

    document.getElementById("total-offers").textContent =
        offers.length;

    // Rejected
    const rejected = applications.filter(function(app) {
        return app.status === "Rejected";
    });

    document.getElementById("total-rejected").textContent =
        rejected.length;
}

// 7. INITIALIZE APPLICATION

displayApplications();
updateStatistics();

console.log("JobTrack initialized successfully!");


// 8. DELETE APPLICATION

function deleteApplication(id) {

    // Ask user for confirmation
    const confirmed = confirm(
        "Are you sure you want to delete this application?"
    );

    if (!confirmed) {
        return;
    }

    // Keep all applications except the selected one
    const updatedApplications = applications.filter(function(app) {
        return app.id !== id;
    });

    const previousApplications = applications;
    applications = updatedApplications;

    // Save updated list
    if (!saveApplications()) {
        applications = previousApplications;
        alert("Could not delete the application.");
        return;
    }

    // Refresh dashboard
    displayApplications();
    updateStatistics();
}


// 9. EDIT APPLICATION

function editApplication(id) {

    // Find the selected application
    const application = applications.find(function(app) {
        return app.id === id;
    });

    if (!application) {
        return;
    }

    // Fill the form with existing information
    document.getElementById("company").value =
        application.company;

    document.getElementById("position").value =
        application.position;

    document.getElementById("job-type").value =
        application.jobType;

    document.getElementById("location").value =
        application.location;

    document.getElementById("application-date").value =
        application.applicationDate;

    document.getElementById("status").value =
        application.status;

    document.getElementById("notes").value =
        application.notes;

    // Remember which application is being edited
    editingApplicationId = id;
    cancelEditButton.hidden = false;

    // Change submit button text
    document.querySelector(".add-btn").textContent =
        "Save Changes";

    // Scroll to the form
    document.querySelector(".application-form-section")
        .scrollIntoView({ behavior: "smooth" });
}

// 10. SEARCH AND FILTER APPLICATIONS

searchInput.addEventListener("input", function() {
    displayApplications();
});

filterStatus.addEventListener("change", function() {
    displayApplications();
});



// 11. CANCEL EDIT

const cancelEditButton = document.getElementById("cancel-edit-btn");

function resetEditingMode() {
    // Stop editing
    editingApplicationId = null;

    // Clear the form
    applicationForm.reset();

    // Restore original button text
    document.querySelector(".add-btn").textContent =
        "+ Add Application";

    // Hide Cancel Edit button
    cancelEditButton.hidden = true;
}

cancelEditButton.addEventListener("click", function(event) {
    event.preventDefault();
    resetEditingMode();
});
