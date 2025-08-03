console.log('=== FAB LAB RESERVATION SYSTEM START ===');
        
        var selectedMachine = null;
        var editingMachineId = null;
        
        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Initializing Fab Lab Reservation System...');
            
            // Set minimum date to today for all date inputs
            var today = new Date().toISOString().split('T')[0];
            
            // Generate machine cards
            loadMachineCards();
            
            // Add event listeners to clear errors on input
            addErrorClearingListeners();
            
            console.log('Application initialized successfully');
        });
        
        function loadMachineCards() {
            console.log('Loading machine cards...');
            
            var machineGrid = document.getElementById('machineGrid');
            var machines = MachineService.getAll();
            var html = '';
            
            for (var i = 0; i < machines.length; i++) {
                var machine = machines[i];
                html += generateMachineCard(machine);
            }
            
            machineGrid.innerHTML = html;
            
            // Set minimum date to today for all newly created date inputs
            var today = new Date().toISOString().split('T')[0];
            var dateInputs = document.querySelectorAll('input[name="reservationDate"]');
            for (var i = 0; i < dateInputs.length; i++) {
                dateInputs[i].min = today;
            }
            
            // Re-add event listeners for newly created inputs
            addErrorClearingListeners();
            
            console.log('Generated', machines.length, 'machine cards');
        }
        
        function generateMachineCard(machine) {
            var statusClass = '';
            var warningHtml = '';
            
            // Determine status styling and generate smart warnings
            if (machine.status === 'Available') {
                statusClass = '';
            } else if (machine.status === 'Maintenance') {
                statusClass = 'machine-card__status--maintenance';
                warningHtml = generateMaintenanceWarning(machine);
            } else if (machine.status === 'Out of Order') {
                statusClass = 'machine-card__status--out-of-order';
                warningHtml = generateOutOfOrderWarning(machine);
            }
            
            var html = '<article class="machine-card" onclick="selectMachine(\'' + machine.id + '\')">';
            html += '<div class="machine-card__content">';
            html += '<div class="machine-card__info">';
            html += '<h3 class="machine-card__name">' + machine.name + '</h3>';
            html += '<p class="machine-card__description">' + machine.description + '</p>';
            html += '<span class="machine-card__status ' + statusClass + '">' + machine.status + '</span>';
            html += warningHtml;
            html += '</div>';
            html += '<div class="machine-card__form" onclick="event.stopPropagation()">';
            html += '<form class="form" data-machine="' + machine.id + '">';
            html += '<h4 class="form__title">📅 Reserve ' + machine.name + '</h4>';
            html += '<div class="form__row">';
            html += '<div class="form__group">';
            html += '<label class="form__label">Student Name *</label>';
            html += '<input type="text" name="studentName" class="form__input" required>';
            html += '</div>';
            html += '<div class="form__group">';
            html += '<label class="form__label">Email Address *</label>';
            html += '<input type="email" name="studentEmail" class="form__input" required>';
            html += '</div>';
            html += '</div>';
            html += '<div class="form__group">';
            html += '<label class="form__label">Date *</label>';
            html += '<input type="date" name="reservationDate" class="form__input" required onchange="handleDateChange(this)">';
            html += '</div>';
            html += '<div class="form__time-row">';
            html += '<div class="form__time-group">';
            html += '<label class="form__label">Start Time (PST) *</label>';
            html += '<select name="startTime" class="form__select" required onchange="updateEndTimeOptions(this)" onmousedown="updateStartTimeAvailability(this)">';
            html += '<option value="">Select Start Time</option>';
            html += '<option value="08:00">8:00 AM</option>';
            html += '<option value="08:30">8:30 AM</option>';
            html += '<option value="09:00">9:00 AM</option>';
            html += '<option value="09:30">9:30 AM</option>';
            html += '<option value="10:00">10:00 AM</option>';
            html += '<option value="10:30">10:30 AM</option>';
            html += '<option value="11:00">11:00 AM</option>';
            html += '<option value="11:30">11:30 AM</option>';
            html += '<option value="12:00">12:00 PM</option>';
            html += '<option value="12:30">12:30 PM</option>';
            html += '<option value="13:00">1:00 PM</option>';
            html += '<option value="13:30">1:30 PM</option>';
            html += '<option value="14:00">2:00 PM</option>';
            html += '<option value="14:30">2:30 PM</option>';
            html += '<option value="15:00">3:00 PM</option>';
            html += '<option value="15:30">3:30 PM</option>';
            html += '<option value="16:00">4:00 PM</option>';
            html += '<option value="16:30">4:30 PM</option>';
            html += '<option value="17:00">5:00 PM</option>';
            html += '<option value="17:30">5:30 PM</option>';
            html += '</select>';
            html += '</div>';
            html += '<div class="form__time-separator">|</div>';
            html += '<div class="form__time-group">';
            html += '<label class="form__label">End Time (PST) *</label>';
            html += '<select name="endTime" class="form__select" required onchange="updateDuration(this)">';
            html += '<option value="">Select End Time</option>';
            html += '</select>';
            html += '</div>';
            html += '</div>';
            html += '<div class="form__group" style="margin-top: var(--spacing-md);">';
            html += '<label class="form__label">Duration</label>';
            html += '<input type="text" name="durationDisplay" class="form__input form__input--readonly" readonly placeholder="Will calculate automatically">';
            html += '</div>';
            html += '<button type="button" class="btn btn--primary btn--full" onclick="submitReservation(event, \'' + machine.id + '\')">Submit Reservation</button>';
            html += '<div class="form__message-area"></div>';
            html += '</form>';
            html += '</div>';
            html += '</div>';
            html += '</article>';
            
            return html;
        }
        
        function generateMaintenanceWarning(machine) {
            var warningText = '🔧 ';
            
            // Check if we have maintenance dates
            if (machine.maintenanceStart && machine.maintenanceEnd) {
                var startDate = formatDateForDisplay(machine.maintenanceStart);
                var endDate = formatDateForDisplay(machine.maintenanceEnd);
                
                if (machine.maintenanceStart === machine.maintenanceEnd) {
                    warningText += 'Maintenance scheduled: ' + startDate;
                } else {
                    warningText += 'Maintenance scheduled: ' + startDate + ' - ' + endDate;
                }
            } else if (machine.maintenanceStart) {
                warningText += 'Maintenance scheduled starting: ' + formatDateForDisplay(machine.maintenanceStart);
            } else {
                warningText += 'This machine is scheduled for maintenance';
            }
            
            // Add notes if available
            if (machine.maintenanceNotes) {
                warningText += ' (' + machine.maintenanceNotes + ')';
            }
            
            warningText += '. Your reservation may be affected if it falls during this window. Contact the lab to confirm availability.';
            
            return '<div class="machine-card__warning"><p class="machine-card__warning-text">' + warningText + '</p></div>';
        }
        
        function generateOutOfOrderWarning(machine) {
            var warningText = '⚠️ ';
            
            // Check if we have out of order details
            if (machine.outOfOrderSince) {
                warningText += 'Out of order since ' + formatDateForDisplay(machine.outOfOrderSince);
            } else {
                warningText += 'This machine is currently out of order';
            }
            
            // Add expected back online date if available
            if (machine.expectedOnline) {
                warningText += '. Expected back online: ' + formatDateForDisplay(machine.expectedOnline);
            }
            
            // Add reason if available
            if (machine.outOfOrderReason) {
                warningText += '. Reason: ' + machine.outOfOrderReason;
            }
            
            warningText += '. Your reservation may be cancelled or rescheduled. Please contact the lab for current status before your session.';
            
            return '<div class="machine-card__warning machine-card__warning--danger"><p class="machine-card__warning-text">' + warningText + '</p></div>';
        }
        
        function formatDateForDisplay(dateString) {
            if (!dateString) return '';
            
            // Parse the date string as local date to avoid timezone issues
            var dateParts = dateString.split('-');
            var year = parseInt(dateParts[0]);
            var month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
            var day = parseInt(dateParts[2]);
            
            var date = new Date(year, month, day);
            var options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            
            return date.toLocaleDateString('en-US', options);
        }
        
        function addErrorClearingListeners() {
            // Get all form inputs that can have errors
            var inputs = document.querySelectorAll('input[name="studentName"], input[name="studentEmail"], input[name="reservationDate"], select[name="startTime"], select[name="endTime"]');
            
            for (var i = 0; i < inputs.length; i++) {
                var input = inputs[i];
                
                // Add event listeners for different input types
                if (input.type === 'date') {
                    // For date inputs, listen to both 'input' and 'change' events
                    input.addEventListener('input', clearFieldError);
                    input.addEventListener('change', clearFieldError);
                } else if (input.tagName === 'SELECT') {
                    // For select elements, listen to 'change' event
                    input.addEventListener('change', clearFieldError);
                } else {
                    // For text and email inputs, listen to 'input' event (real-time)
                    input.addEventListener('input', clearFieldError);
                }
            }
        }
        
        function clearFieldError(event) {
            var field = event.target;
            var formGroup = field.closest('.form__group, .form__time-group');
            
            if (formGroup && (formGroup.classList.contains('form__group--error') || formGroup.classList.contains('form__time-group--error'))) {
                formGroup.classList.remove('form__group--error');
                formGroup.classList.remove('form__time-group--error');
                console.log('Cleared error state for field:', field.name);
                
                // Also clear any related messages if all visible errors are gone
                var form = field.closest('form');
                var remainingErrors = form.querySelectorAll('.form__group--error, .form__time-group--error');
                
                if (remainingErrors.length === 0) {
                    var messageArea = form.querySelector('.form__message-area');
                    if (messageArea && messageArea.innerHTML.includes('Please fix the following errors')) {
                        UIManager.clearMessages(messageArea);
                        console.log('Cleared error message - no remaining field errors');
                    }
                }
            }
        }
        
        // Machine Selection Functions
        function selectMachine(machineId) {
            console.log('selectMachine called with:', machineId);
            
            var allCards = document.getElementsByClassName('machine-card');
            for (var i = 0; i < allCards.length; i++) {
                allCards[i].classList.remove('machine-card--selected');
                
                var messageArea = allCards[i].querySelector('.form__message-area');
                if (messageArea) {
                    UIManager.clearMessages(messageArea);
                }
            }
            
            var clickedCard = event.target;
            while (clickedCard && !clickedCard.classList.contains('machine-card')) {
                clickedCard = clickedCard.parentElement;
            }
            
            if (clickedCard) {
                clickedCard.classList.add('machine-card--selected');
                selectedMachine = machineId;
                
                setTimeout(function() {
                    clickedCard.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start',
                        inline: 'nearest'
                    });
                }, 100);
                
                console.log('Selected:', selectedMachine);
            }
        }
        
        // Form Handling Functions
        function submitReservation(event, machineId) {
            console.log('Submit button clicked for machine:', machineId);
            
            var button = event.target;
            var form = button.closest('form');
            
            if (!form) {
                console.log('ERROR: Could not find form');
                return;
            }
            
            var messageArea = form.querySelector('.form__message-area');
            
            UIManager.clearMessages(messageArea);
            UIManager.clearFormErrors(form);
            
            var formData = {
                machine: machineId,
                studentName: form.querySelector('[name="studentName"]').value,
                studentEmail: form.querySelector('[name="studentEmail"]').value,
                date: form.querySelector('[name="reservationDate"]').value,
                startTime: form.querySelector('[name="startTime"]').value,
                endTime: form.querySelector('[name="endTime"]').value
            };
            
            console.log('Form data:', JSON.stringify(formData, null, 2));
            
            var validation = validateReservationForm(formData);
            
            if (!validation.isValid) {
                console.log('Validation errors:', validation.errors);
                
                validation.errors.forEach(function(error) {
                    console.log('Processing error:', error);
                    if (error.includes('name')) UIManager.showFieldError(form, 'studentName');
                    if (error.includes('email') || error.includes('Email')) UIManager.showFieldError(form, 'studentEmail');
                    if (error.includes('Date') || error.includes('past')) UIManager.showFieldError(form, 'reservationDate');
                    if (error.includes('Start time')) UIManager.showFieldError(form, 'startTime');
                    if (error.includes('End time')) UIManager.showFieldError(form, 'endTime');
                });
                
                UIManager.showMessage(messageArea, 'Please fix the following errors: ' + validation.errors.join(', '), 'error');
                return;
            }
            
            // Final conflict check
            var conflictingReservations = ReservationService.getConflicting(machineId, formData.date);
            if (wouldConflict(formData.startTime, formData.endTime, conflictingReservations)) {
                UIManager.showMessage(messageArea, 'This time slot conflicts with an existing reservation', 'error');
                return;
            }
            
            try {
                var reservation = ReservationService.create(formData);
                console.log('Reservation saved:', reservation);
                
                UIManager.showMessage(messageArea, '✅ Reservation confirmed! You\'ll receive a confirmation email at ' + formData.studentEmail, 'success');
                
                form.reset();
                
                setTimeout(function() {
                    var allCards = document.getElementsByClassName('machine-card');
                    for (var i = 0; i < allCards.length; i++) {
                        allCards[i].classList.remove('machine-card--selected');
                    }
                    selectedMachine = null;
                }, 3000);
                
            } catch (error) {
                UIManager.showMessage(messageArea, 'Error creating reservation: ' + error.message, 'error');
            }
        }
        
        // Time Selection Functions
        function updateEndTimeOptions(startTimeSelect) {
            console.log('Updating end time options...');
            
            var form = startTimeSelect.closest('form');
            var endTimeSelect = form.querySelector('[name="endTime"]');
            var durationDisplay = form.querySelector('[name="durationDisplay"]');
            var dateInput = form.querySelector('[name="reservationDate"]');
            var messageArea = form.querySelector('.form__message-area');
            
            if (messageArea && messageArea.innerHTML.includes('Selected time unavailable')) {
                UIManager.clearMessages(messageArea);
            }
            
            endTimeSelect.innerHTML = '<option value="">Select End Time</option>';
            durationDisplay.value = '';
            
            var startTime = startTimeSelect.value;
            var selectedDate = dateInput.value;
            
            if (!startTime || !selectedDate) return;
            
            var machineId = form.getAttribute('data-machine');
            var startParts = startTime.split(':');
            var startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
            var maxEndMinutes = Math.min(startMinutes + (4 * 60), 18 * 60);
            
            var conflictingReservations = ReservationService.getConflicting(machineId, selectedDate);
            console.log('Found', conflictingReservations.length, 'existing reservations for', machineId, 'on', selectedDate);
            
            for (var minutes = startMinutes + 30; minutes <= maxEndMinutes; minutes += 30) {
                var hours = Math.floor(minutes / 60);
                var mins = minutes % 60;
                
                if (hours >= 24) break;
                
                var timeValue = hours.toString().padStart(2, '0') + ':' + mins.toString().padStart(2, '0');
                
                if (!wouldConflict(startTime, timeValue, conflictingReservations)) {
                    var hour12 = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
                    var ampm = hours >= 12 ? 'PM' : 'AM';
                    var timeStr = hour12 + ':' + mins.toString().padStart(2, '0') + ' ' + ampm;
                    
                    var option = document.createElement('option');
                    option.value = timeValue;
                    option.textContent = timeStr;
                    endTimeSelect.appendChild(option);
                }
            }
            
            var thirtyMinEnd = startMinutes + 30;
            if (thirtyMinEnd <= maxEndMinutes) {
                var thirtyMinEndStr = Math.floor(thirtyMinEnd / 60).toString().padStart(2, '0') + ':' + 
                                     (thirtyMinEnd % 60).toString().padStart(2, '0');
                
                if (!wouldConflict(startTime, thirtyMinEndStr, conflictingReservations)) {
                    endTimeSelect.value = thirtyMinEndStr;
                    updateDuration(endTimeSelect);
                }
            }
            
            console.log('Generated', endTimeSelect.options.length - 1, 'available end time options');
        }
        
        function updateStartTimeAvailability(startTimeSelect) {
            console.log('Updating start time availability...');
            
            var form = startTimeSelect.closest('form');
            var dateInput = form.querySelector('[name="reservationDate"]');
            var selectedDate = dateInput.value;
            
            if (!selectedDate) return;
            
            var machineId = form.getAttribute('data-machine');
            var conflictingReservations = ReservationService.getConflicting(machineId, selectedDate);
            
            var currentStartTime = startTimeSelect.value;
            var wasCleared = false;
            
            if (currentStartTime && isStartTimeUnavailable(currentStartTime, conflictingReservations)) {
                startTimeSelect.value = '';
                
                var endTimeSelect = form.querySelector('[name="endTime"]');
                var durationDisplay = form.querySelector('[name="durationDisplay"]');
                endTimeSelect.innerHTML = '<option value="">Select End Time</option>';
                durationDisplay.value = '';
                
                var messageArea = form.querySelector('.form__message-area');
                UIManager.showMessage(messageArea, '⚠️ Selected time unavailable on this date - please choose another time', 'error');
                
                wasCleared = true;
                console.log('Cleared invalid start time:', currentStartTime);
            }
            
            var options = startTimeSelect.options;
            for (var i = 1; i < options.length; i++) {
                var option = options[i];
                var startTime = option.value;
                
                if (startTime && isStartTimeUnavailable(startTime, conflictingReservations)) {
                    option.className = 'form__option--unavailable';
                    option.disabled = true;
                    if (!option.textContent.includes('(Unavailable)')) {
                        option.textContent = option.textContent + ' (Unavailable)';
                    }
                } else {
                    option.className = '';
                    option.disabled = false;
                    option.textContent = option.textContent.replace(' (Unavailable)', '');
                }
            }
            
            console.log('Updated start time availability for', conflictingReservations.length, 'conflicts', wasCleared ? '(cleared invalid selection)' : '');
        }
        
        function handleDateChange(dateInput) {
            console.log('Date changed to:', dateInput.value);
            
            var form = dateInput.closest('form');
            var startTimeSelect = form.querySelector('[name="startTime"]');
            
            var messageArea = form.querySelector('.form__message-area');
            UIManager.clearMessages(messageArea);
            
            if (startTimeSelect && dateInput.value) {
                updateStartTimeAvailability(startTimeSelect);
            }
        }
        
        function updateDuration(endTimeSelect) {
            console.log('Updating duration...');
            
            var form = endTimeSelect.closest('form');
            var startTimeSelect = form.querySelector('[name="startTime"]');
            var durationDisplay = form.querySelector('[name="durationDisplay"]');
            
            var startTime = startTimeSelect.value;
            var endTime = endTimeSelect.value;
            
            if (!startTime || !endTime) {
                durationDisplay.value = '';
                return;
            }
            
            var startParts = startTime.split(':');
            var endParts = endTime.split(':');
            var startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
            var endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
            
            var durationMinutes = endMinutes - startMinutes;
            var hours = Math.floor(durationMinutes / 60);
            var minutes = durationMinutes % 60;
            
            var durationText = '';
            if (hours > 0) {
                durationText += hours + ' hour' + (hours > 1 ? 's' : '');
            }
            if (minutes > 0) {
                if (hours > 0) durationText += ' ';
                durationText += minutes + ' minute' + (minutes > 1 ? 's' : '');
            }
            
            durationDisplay.value = durationText;
            console.log('Duration calculated:', durationText);
        }
        
        // Navigation Functions
        function showTab(tabName) {
            console.log('showTab called:', tabName);
            
            var contents = document.getElementsByClassName('tab-content');
            for (var i = 0; i < contents.length; i++) {
                contents[i].classList.remove('tab-content--active');
            }
            
            var buttons = document.getElementsByClassName('nav-tab');
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].classList.remove('nav-tab--active');
            }
            
            var targetTab = document.getElementById(tabName);
            if (targetTab) {
                targetTab.classList.add('tab-content--active');
            }
            
            if (event && event.target) {
                event.target.classList.add('nav-tab--active');
            }
            
            if (tabName === 'admin') {
                loadAdminDashboard();
            }
            
            if (tabName === 'machines') {
                loadMachinesList();
            }
            
            if (tabName === 'reserve') {
                loadMachineCards(); // Refresh machine cards when switching to reserve tab
            }
        }
        
        // Admin Dashboard Functions
        function loadAdminDashboard() {
            loadReservationsList();
            loadStats();
            updateMachineFilter();
        }
        
        function loadReservationsList() {
            console.log('Loading reservations list...');
            
            var reservationsListDiv = document.getElementById('reservationsList');
            var reservations = ReservationService.getAll();
            
            if (reservations.length === 0) {
                reservationsListDiv.innerHTML = '<p>No reservations found.</p>';
                return;
            }
            
            var studentSearch = document.getElementById('studentSearch').value.toLowerCase();
            var machineFilter = document.getElementById('machineFilter').value;
            var dateFrom = document.getElementById('dateFrom').value;
            var dateTo = document.getElementById('dateTo').value;
            
            var filteredReservations = reservations.filter(function(res) {
                if (studentSearch && 
                    !res.studentName.toLowerCase().includes(studentSearch) && 
                    !res.studentEmail.toLowerCase().includes(studentSearch)) {
                    return false;
                }
                
                if (machineFilter && res.machine !== machineFilter) {
                    return false;
                }
                
                if (dateFrom && res.date < dateFrom) {
                    return false;
                }
                if (dateTo && res.date > dateTo) {
                    return false;
                }
                
                return true;
            });
            
            console.log('Filtered', reservations.length, 'reservations down to', filteredReservations.length);
            
            if (filteredReservations.length === 0) {
                reservationsListDiv.innerHTML = '<p>No reservations match the current filters.</p>';
                return;
            }
            
            var html = '<table class="table">';
            html += '<thead class="table__header">';
            html += '<tr>';
            html += '<th class="table__header-cell">Student Name</th>';
            html += '<th class="table__header-cell">Email</th>';
            html += '<th class="table__header-cell">Machine</th>';
            html += '<th class="table__header-cell">Date</th>';
            html += '<th class="table__header-cell">Start Time</th>';
            html += '<th class="table__header-cell">End Time</th>';
            html += '<th class="table__header-cell">Created</th>';
            html += '</tr>';
            html += '</thead>';
            html += '<tbody>';
            
            for (var i = 0; i < filteredReservations.length; i++) {
                var res = filteredReservations[i];
                var machine = MachineService.findById(res.machine);
                var isOrphaned = !machine;
                
                var rowClass = isOrphaned ? 'table__row--orphaned' : '';
                var cellClass = isOrphaned ? 'table__cell--orphaned' : '';
                
                html += '<tr class="' + rowClass + '">';
                html += '<td class="table__cell">' + res.studentName + '</td>';
                html += '<td class="table__cell">' + res.studentEmail + '</td>';
                html += '<td class="table__cell ' + cellClass + '">' + MachineService.getDisplayName(res.machine) + '</td>';
                html += '<td class="table__cell">' + res.date + '</td>';
                html += '<td class="table__cell">' + formatTime(res.startTime) + '</td>';
                html += '<td class="table__cell">' + formatTime(res.endTime) + '</td>';
                html += '<td class="table__cell">' + formatDateTime(res.createdAt) + '</td>';
                html += '</tr>';
            }
            
            html += '</tbody>';
            html += '</table>';
            html += '<p style="margin-top: var(--spacing-sm);">Showing ' + filteredReservations.length + ' of ' + reservations.length + ' total reservations</p>';
            
            reservationsListDiv.innerHTML = html;
            console.log('Loaded', filteredReservations.length, 'filtered reservations');
        }
        
        function loadStats() {
            console.log('Loading stats...');
            
            var statsDiv = document.getElementById('statsSection');
            var reservations = ReservationService.getAll();
            
            if (reservations.length === 0) {
                statsDiv.innerHTML = '<p>No reservations to analyze yet.</p>';
                return;
            }
            
            var totalReservations = reservations.length;
            var uniqueStudents = getUniqueStudents(reservations);
            var upcomingReservations = getUpcomingReservations(reservations);
            var totalHours = getTotalHours(reservations);
            
            var html = '';
            html += '<div class="admin-stat">';
            html += '<div class="admin-stat__value admin-stat__value--blue">' + totalReservations + '</div>';
            html += '<div class="admin-stat__label">Total Reservations</div>';
            html += '</div>';
            
            html += '<div class="admin-stat">';
            html += '<div class="admin-stat__value admin-stat__value--green">' + uniqueStudents + '</div>';
            html += '<div class="admin-stat__label">Unique Students</div>';
            html += '</div>';
            
            html += '<div class="admin-stat">';
            html += '<div class="admin-stat__value admin-stat__value--red">' + totalHours.toFixed(1) + '</div>';
            html += '<div class="admin-stat__label">Total Hours Booked</div>';
            html += '</div>';
            
            html += '<div class="admin-stat">';
            html += '<div class="admin-stat__value admin-stat__value--yellow">' + upcomingReservations + '</div>';
            html += '<div class="admin-stat__label">Upcoming Reservations</div>';
            html += '</div>';
            
            statsDiv.innerHTML = html;
            console.log('Stats loaded successfully');
        }
        
        function getUniqueStudents(reservations) {
            var students = [];
            for (var i = 0; i < reservations.length; i++) {
                var email = reservations[i].studentEmail.toLowerCase();
                if (students.indexOf(email) === -1) {
                    students.push(email);
                }
            }
            return students.length;
        }
        
        function getUpcomingReservations(reservations) {
            var today = new Date();
            var todayStr = today.toISOString().split('T')[0];
            var count = 0;
            
            for (var i = 0; i < reservations.length; i++) {
                if (reservations[i].date >= todayStr) {
                    count++;
                }
            }
            
            return count;
        }
        
        function getTotalHours(reservations) {
            var totalHours = 0;
            
            for (var i = 0; i < reservations.length; i++) {
                var res = reservations[i];
                var startMinutes = timeToMinutes(res.startTime);
                var endMinutes = timeToMinutes(res.endTime);
                var durationHours = (endMinutes - startMinutes) / 60;
                totalHours += durationHours;
            }
            
            return totalHours;
        }
        
        function updateMachineFilter() {
            console.log('Updating machine filter dropdown');
            
            var machineFilter = document.getElementById('machineFilter');
            var currentValue = machineFilter.value;
            
            machineFilter.innerHTML = '<option value="">All Machines</option>';
            
            var machines = MachineService.getAll();
            for (var i = 0; i < machines.length; i++) {
                var machine = machines[i];
                var option = document.createElement('option');
                option.value = machine.id;
                option.textContent = machine.name;
                machineFilter.appendChild(option);
            }
            
            if (currentValue) {
                var optionExists = false;
                for (var i = 0; i < machineFilter.options.length; i++) {
                    if (machineFilter.options[i].value === currentValue) {
                        optionExists = true;
                        break;
                    }
                }
                
                if (optionExists) {
                    machineFilter.value = currentValue;
                }
            }
            
            console.log('Machine filter updated with', machines.length, 'machines');
        }
        
        function applyFilters() {
            console.log('Applying filters...');
            loadReservationsList();
        }
        
        function clearFilters() {
            console.log('Clearing all filters...');
            
            document.getElementById('studentSearch').value = '';
            document.getElementById('machineFilter').value = '';
            document.getElementById('dateFrom').value = '';
            document.getElementById('dateTo').value = '';
            
            loadReservationsList();
        }
        
        function exportToCSV() {
            console.log('Export CSV button clicked');
            
            var reservations = ReservationService.getAll();
            
            if (reservations.length === 0) {
                alert('No reservations to export.');
                return;
            }
            
            var studentSearch = document.getElementById('studentSearch').value.toLowerCase();
            var machineFilter = document.getElementById('machineFilter').value;
            var dateFrom = document.getElementById('dateFrom').value;
            var dateTo = document.getElementById('dateTo').value;
            
            var filteredReservations = reservations.filter(function(res) {
                if (studentSearch && 
                    !res.studentName.toLowerCase().includes(studentSearch) && 
                    !res.studentEmail.toLowerCase().includes(studentSearch)) {
                    return false;
                }
                
                if (machineFilter && res.machine !== machineFilter) {
                    return false;
                }
                
                if (dateFrom && res.date < dateFrom) {
                    return false;
                }
                if (dateTo && res.date > dateTo) {
                    return false;
                }
                
                return true;
            });
            
            if (filteredReservations.length === 0) {
                alert('No reservations match the current filters to export.');
                return;
            }
            
            var csvContent = 'Student Name,Email,Machine,Date,Start Time,End Time,Duration,Created Date\n';
            
            for (var i = 0; i < filteredReservations.length; i++) {
                var res = filteredReservations[i];
                
                var startMinutes = timeToMinutes(res.startTime);
                var endMinutes = timeToMinutes(res.endTime);
                var durationMinutes = endMinutes - startMinutes;
                var hours = Math.floor(durationMinutes / 60);
                var minutes = durationMinutes % 60;
                var durationText = '';
                if (hours > 0) {
                    durationText += hours + ' hour' + (hours > 1 ? 's' : '');
                }
                if (minutes > 0) {
                    if (hours > 0) durationText += ' ';
                    durationText += minutes + ' minute' + (minutes > 1 ? 's' : '');
                }
                
                var createdDate = new Date(res.createdAt);
                var createdDateStr = createdDate.toLocaleDateString() + ' ' + createdDate.toLocaleTimeString();
                
                csvContent += res.studentName + ',' + 
                             res.studentEmail + ',' + 
                             res.machine.replace(/-/g, ' ') + ',' + 
                             res.date + ',' + 
                             formatTime(res.startTime) + ',' + 
                             formatTime(res.endTime) + ',' + 
                             durationText + ',' + 
                             createdDateStr + '\n';
            }
            
            var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            var filename = generateSmartFilename(filteredReservations.length, reservations.length, studentSearch, machineFilter, dateFrom, dateTo);
            
            var link = document.createElement('a');
            if (link.download !== undefined) {
                var url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                var button = document.querySelector('button[onclick="exportToCSV()"]');
                if (button) {
                    var originalText = button.textContent;
                    button.textContent = '✅ Downloaded!';
                    button.style.background = 'var(--success-green-dark)';
                    
                    setTimeout(function() {
                        button.textContent = originalText;
                        button.style.background = 'var(--success-green)';
                    }, 2000);
                }
                
                setTimeout(function() {
                    URL.revokeObjectURL(url);
                }, 100);
                
            } else {
                alert('Download not supported in this browser.');
            }
        }
        
        function generateSmartFilename(filteredCount, totalCount, studentSearch, machineFilter, dateFrom, dateTo) {
            var parts = ['CoA-Fab-Lab', 'Reservations'];
            
            if (machineFilter) {
                var machineName = machineFilter.replace(/-/g, '').replace(/\s+/g, '');
                machineName = machineName.charAt(0).toUpperCase() + machineName.slice(1);
                parts.push(machineName);
            } else {
                parts.push('AllMachines');
            }
            
            if (dateFrom && dateTo) {
                parts.push(dateFrom + '_to_' + dateTo);
            } else if (dateFrom) {
                parts.push('from_' + dateFrom);
            } else if (dateTo) {
                parts.push('until_' + dateTo);
            } else {
                parts.push('AllDates');
            }
            
            if (studentSearch) {
                var searchTerm = studentSearch.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
                if (searchTerm) {
                    parts.push('Student_' + searchTerm);
                }
            }
            
            if (filteredCount !== totalCount) {
                parts.push(filteredCount + 'of' + totalCount + 'records');
            }
            
            var now = new Date();
            var timestamp = now.getFullYear() + '-' + 
                           String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(now.getDate()).padStart(2, '0') + '_' +
                           String(now.getHours()).padStart(2, '0') + '-' +
                           String(now.getMinutes()).padStart(2, '0');
            
            parts.push('exported-' + timestamp);
            
            return parts.join('_') + '.csv';
        }
        
        // Machine Management Functions
        function loadMachinesList() {
            console.log('Loading machines list');
            
            var machinesListDiv = document.getElementById('machinesList');
            var machines = MachineService.getAll();
            
            // Update the header with machine count
            var headerElement = document.getElementById('machineListHeader');
            if (headerElement) {
                headerElement.textContent = 'Current Machines (' + machines.length + ')';
            }
            
            if (machines.length === 0) {
                machinesListDiv.innerHTML = '<p>No machines configured yet.</p>';
                return;
            }
            
            var html = '<table class="table">';
            html += '<thead class="table__header">';
            html += '<tr>';
            html += '<th class="table__header-cell">Machine Name</th>';
            html += '<th class="table__header-cell">Description</th>';
            html += '<th class="table__header-cell">Status</th>';
            html += '<th class="table__header-cell">Actions</th>';
            html += '</tr>';
            html += '</thead>';
            html += '<tbody>';
            
            for (var i = 0; i < machines.length; i++) {
                var machine = machines[i];
                
                var statusClass = '';
                if (machine.status === 'Available') {
                    statusClass = 'background: var(--success-green-light); color: var(--success-green-dark);';
                } else if (machine.status === 'Maintenance') {
                    statusClass = 'background: var(--warning-yellow-light); color: var(--warning-yellow-dark);';
                } else if (machine.status === 'Out of Order') {
                    statusClass = 'background: var(--danger-red-light); color: var(--danger-red-dark);';
                }
                
                html += '<tr>';
                html += '<td class="table__cell font-semibold">' + machine.name + '</td>';
                html += '<td class="table__cell">' + machine.description + '</td>';
                html += '<td class="table__cell"><span style="' + statusClass + ' padding: 4px 8px; border-radius: var(--radius-pill); font-size: var(--font-size-sm);">' + machine.status + '</span></td>';
                html += '<td class="table__cell">';
                html += '<button onclick="editMachine(\'' + machine.id + '\')" class="btn btn--primary" style="margin-right: var(--spacing-xs); padding: 6px 12px; font-size: var(--font-size-xs);">Edit</button>';
                html += '<button onclick="deleteMachine(\'' + machine.id + '\')" class="btn" style="background: var(--danger-red); color: var(--text-white); padding: 6px 12px; font-size: var(--font-size-xs);">Delete</button>';
                html += '</td>';
                html += '</tr>';
            }
            
            html += '</tbody>';
            html += '</table>';
            
            machinesListDiv.innerHTML = html;
            console.log('Loaded', machines.length, 'machines');
        }
        
        function validateMaintenanceDates(formType) {
            var startInput = document.getElementById(formType + 'MaintenanceStart');
            var endInput = document.getElementById(formType + 'MaintenanceEnd');
            var startDate = startInput.value;
            var endDate = endInput.value;
            var today = new Date().toISOString().split('T')[0];
            
            // Clear any existing error/warning states
            clearDateError(startInput);
            clearDateError(endInput);
            clearDateWarning(startInput);
            clearDateWarning(endInput);
            
            var hasErrors = false;
            
            // Check if end date is before start date (ERROR - prevents saving)
            if (startDate && endDate) {
                if (new Date(endDate) < new Date(startDate)) {
                    showDateError(endInput, 'End date cannot be before start date');
                    console.log('Maintenance date validation failed: End date before start date');
                    hasErrors = true;
                }
            }
            
            // Check for past dates (WARNING - allows saving)
            if (startDate && startDate < today && !hasErrors) {
                showDateWarning(startInput, 'This date is in the past. Are you sure this is correct?');
                console.log('Maintenance start date warning: Date is in the past');
            }
            
            if (endDate && endDate < today && !hasErrors) {
                showDateWarning(endInput, 'This date is in the past. Are you sure this is correct?');
                console.log('Maintenance end date warning: Date is in the past');
            }
            
            if (!hasErrors) {
                console.log('Maintenance dates validated successfully');
            }
            
            return !hasErrors; // Return false for actual errors, true for warnings or success
        }
        
        function validateOutOfOrderDates(formType) {
            var sinceInput = document.getElementById(formType + 'OutOfOrderSince');
            var expectedInput = document.getElementById(formType + 'ExpectedOnline');
            var sinceDate = sinceInput.value;
            var expectedDate = expectedInput.value;
            var today = new Date().toISOString().split('T')[0];
            
            // Clear any existing error/warning states
            clearDateError(sinceInput);
            clearDateError(expectedInput);
            clearDateWarning(sinceInput);
            clearDateWarning(expectedInput);
            
            var hasErrors = false;
            
            // Check if expected date is before since date (ERROR - prevents saving)
            if (sinceDate && expectedDate) {
                if (new Date(expectedDate) < new Date(sinceDate)) {
                    showDateError(expectedInput, 'Expected online date cannot be before out of order date');
                    console.log('Out of order date validation failed: Expected date before since date');
                    hasErrors = true;
                }
            }
            
            // Check for past dates (WARNING - allows saving)
            if (sinceDate && sinceDate < today && !hasErrors) {
                showDateWarning(sinceInput, 'This date is in the past. Are you sure this is correct?');
                console.log('Out of order since date warning: Date is in the past');
            }
            
            if (expectedDate && expectedDate < today && !hasErrors) {
                showDateWarning(expectedInput, 'Expected online date is in the past. Are you sure this is correct?');
                console.log('Expected online date warning: Date is in the past');
            }
            
            if (!hasErrors) {
                console.log('Out of order dates validated successfully');
            }
            
            return !hasErrors; // Return false for actual errors, true for warnings or success
        }
        
        function showDateWarning(input, message) {
            // Add warning styling to input
            input.classList.add('form__input--date-warning');
            
            // Remove any existing warning message
            var existingWarning = input.parentElement.querySelector('.form__date-warning-message');
            if (existingWarning) {
                existingWarning.remove();
            }
            
            // Add warning message
            var warningElement = document.createElement('div');
            warningElement.className = 'form__date-warning-message';
            warningElement.textContent = message;
            input.parentElement.appendChild(warningElement);
        }
        
        function clearDateWarning(input) {
            // Remove warning styling
            input.classList.remove('form__input--date-warning');
            
            // Remove warning message
            var warningMessage = input.parentElement.querySelector('.form__date-warning-message');
            if (warningMessage) {
                warningMessage.remove();
            }
        }
        
        function showDateError(input, message) {
            // Add error styling to input
            input.classList.add('form__input--date-error');
            
            // Remove any existing error message
            var existingError = input.parentElement.querySelector('.form__date-error-message');
            if (existingError) {
                existingError.remove();
            }
            
            // Add error message
            var errorElement = document.createElement('div');
            errorElement.className = 'form__date-error-message';
            errorElement.textContent = message;
            input.parentElement.appendChild(errorElement);
        }
        
        function clearDateError(input) {
            // Remove error styling
            input.classList.remove('form__input--date-error');
            
            // Remove error message
            var errorMessage = input.parentElement.querySelector('.form__date-error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        }
        
        function toggleMaintenanceFields(formType) {
            var statusSelect = document.getElementById(formType + 'MachineStatus');
            var maintenanceFields = document.getElementById(formType + 'MaintenanceFields');
            var outOfOrderFields = document.getElementById(formType + 'OutOfOrderFields');
            
            var selectedStatus = statusSelect.value;
            
            // Hide all conditional fields first
            maintenanceFields.style.display = 'none';
            outOfOrderFields.style.display = 'none';
            
            // Show appropriate fields based on status
            if (selectedStatus === 'Maintenance') {
                maintenanceFields.style.display = 'block';
            } else if (selectedStatus === 'Out of Order') {
                outOfOrderFields.style.display = 'block';
            }
            
            console.log('Toggled', formType, 'fields for status:', selectedStatus);
        }
        
        function showAddMachineForm() {
            var form = document.getElementById('addMachineForm');
            var isCurrentlyHidden = form.style.display === 'none';
            
            if (isCurrentlyHidden) {
                console.log('Showing add machine form');
                
                document.getElementById('editMachineForm').style.display = 'none';
                cancelEditMachine();
                
                form.style.display = 'block';
            } else {
                console.log('Hiding add machine form');
                form.style.display = 'none';
            }
        }
        
        function cancelAddMachine() {
            console.log('Canceling add machine');
            document.getElementById('addMachineForm').style.display = 'none';
            
            // Clear basic form fields
            document.getElementById('newMachineName').value = '';
            document.getElementById('newMachineDescription').value = '';
            document.getElementById('newMachineStatus').value = 'Available';
            
            // Clear maintenance fields
            document.getElementById('newMaintenanceStart').value = '';
            document.getElementById('newMaintenanceEnd').value = '';
            document.getElementById('newMaintenanceNotes').value = '';
            document.getElementById('newMaintenanceAdminNotes').value = '';
            
            // Clear out of order fields
            document.getElementById('newOutOfOrderSince').value = '';
            document.getElementById('newExpectedOnline').value = '';
            document.getElementById('newOutOfOrderReason').value = '';
            document.getElementById('newOutOfOrderAdminNotes').value = '';
            
            // Hide conditional fields
            document.getElementById('newMaintenanceFields').style.display = 'none';
            document.getElementById('newOutOfOrderFields').style.display = 'none';
        }
        
        function addNewMachine() {
            console.log('Adding new machine');
            
            var name = document.getElementById('newMachineName').value.trim();
            var description = document.getElementById('newMachineDescription').value.trim();
            var status = document.getElementById('newMachineStatus').value;
            
            if (!name || !description) {
                alert('Please fill in both machine name and description.');
                return;
            }
            
            // Validate dates before saving
            var datesValid = true;
            if (status === 'Maintenance') {
                datesValid = validateMaintenanceDates('new');
            } else if (status === 'Out of Order') {
                datesValid = validateOutOfOrderDates('new');
            }
            
            if (!datesValid) {
                alert('Please fix the date validation errors before saving.');
                return;
            }
            
            // Collect conditional field data
            var machineData = {
                name: name,
                description: description,
                status: status
            };
            
            // Add maintenance fields if status is Maintenance
            if (status === 'Maintenance') {
                machineData.maintenanceStart = document.getElementById('newMaintenanceStart').value || null;
                machineData.maintenanceEnd = document.getElementById('newMaintenanceEnd').value || null;
                machineData.maintenanceNotes = document.getElementById('newMaintenanceNotes').value.trim() || null;
                machineData.maintenanceAdminNotes = document.getElementById('newMaintenanceAdminNotes').value.trim() || null;
            }
            
            // Add out of order fields if status is Out of Order
            if (status === 'Out of Order') {
                machineData.outOfOrderSince = document.getElementById('newOutOfOrderSince').value || null;
                machineData.expectedOnline = document.getElementById('newExpectedOnline').value || null;
                machineData.outOfOrderReason = document.getElementById('newOutOfOrderReason').value.trim() || null;
                machineData.outOfOrderAdminNotes = document.getElementById('newOutOfOrderAdminNotes').value.trim() || null;
            }
            
            console.log('Machine data being saved:', machineData);
            
            try {
                var newMachine = MachineService.add(machineData);
                
                console.log('New machine added:', newMachine);
                
                loadMachinesList();
                updateMachineFilter();
                loadMachineCards(); // Refresh reservation cards
                cancelAddMachine();
                
            } catch (error) {
                alert(error.message);
            }
        }
        
        function editMachine(machineId) {
            console.log('Edit machine requested for ID:', machineId);
            
            var machine = MachineService.findById(machineId);
            
            if (machine) {
                console.log('Found machine to edit:', machine.name);
                
                document.getElementById('addMachineForm').style.display = 'none';
                
                // Populate basic fields
                document.getElementById('editMachineName').value = machine.name;
                document.getElementById('editMachineDescription').value = machine.description;
                document.getElementById('editMachineStatus').value = machine.status;
                
                // Populate maintenance fields
                document.getElementById('editMaintenanceStart').value = machine.maintenanceStart || '';
                document.getElementById('editMaintenanceEnd').value = machine.maintenanceEnd || '';
                document.getElementById('editMaintenanceNotes').value = machine.maintenanceNotes || '';
                document.getElementById('editMaintenanceAdminNotes').value = machine.maintenanceAdminNotes || '';
                
                // Populate out of order fields
                document.getElementById('editOutOfOrderSince').value = machine.outOfOrderSince || '';
                document.getElementById('editExpectedOnline').value = machine.expectedOnline || '';
                document.getElementById('editOutOfOrderReason').value = machine.outOfOrderReason || '';
                document.getElementById('editOutOfOrderAdminNotes').value = machine.outOfOrderAdminNotes || '';
                
                editingMachineId = machineId;
                
                // Show/hide conditional fields based on current status
                toggleMaintenanceFields('edit');
                
                document.getElementById('editMachineForm').style.display = 'block';
                
                console.log('Edit form populated and shown for:', machine.name);
            } else {
                console.log('Machine not found for ID:', machineId);
            }
        }
        
        function cancelEditMachine() {
            console.log('Canceling edit machine');
            
            document.getElementById('editMachineForm').style.display = 'none';
            
            document.getElementById('editMachineName').value = '';
            document.getElementById('editMachineDescription').value = '';
            document.getElementById('editMachineStatus').value = 'Available';
            
            editingMachineId = null;
            
            console.log('Edit form hidden and cleared');
        }
        
        function saveEditedMachine() {
            console.log('Saving edited machine');
            
            if (!editingMachineId) {
                console.log('Error: No machine being edited');
                return;
            }
            
            var name = document.getElementById('editMachineName').value.trim();
            var description = document.getElementById('editMachineDescription').value.trim();
            var status = document.getElementById('editMachineStatus').value;
            
            if (!name || !description) {
                alert('Please fill in both machine name and description.');
                return;
            }
            
            // Validate dates before saving
            var datesValid = true;
            if (status === 'Maintenance') {
                datesValid = validateMaintenanceDates('edit');
            } else if (status === 'Out of Order') {
                datesValid = validateOutOfOrderDates('edit');
            }
            
            if (!datesValid) {
                alert('Please fix the date validation errors before saving.');
                return;
            }
            
            // Collect conditional field data
            var updates = {
                name: name,
                description: description,
                status: status
            };
            
            // Add maintenance fields if status is Maintenance
            if (status === 'Maintenance') {
                updates.maintenanceStart = document.getElementById('editMaintenanceStart').value || null;
                updates.maintenanceEnd = document.getElementById('editMaintenanceEnd').value || null;
                updates.maintenanceNotes = document.getElementById('editMaintenanceNotes').value.trim() || null;
                updates.maintenanceAdminNotes = document.getElementById('editMaintenanceAdminNotes').value.trim() || null;
                // Clear out of order fields when switching to maintenance
                updates.outOfOrderSince = null;
                updates.expectedOnline = null;
                updates.outOfOrderReason = null;
                updates.outOfOrderAdminNotes = null;
            }
            // Add out of order fields if status is Out of Order
            else if (status === 'Out of Order') {
                updates.outOfOrderSince = document.getElementById('editOutOfOrderSince').value || null;
                updates.expectedOnline = document.getElementById('editExpectedOnline').value || null;
                updates.outOfOrderReason = document.getElementById('editOutOfOrderReason').value.trim() || null;
                updates.outOfOrderAdminNotes = document.getElementById('editOutOfOrderAdminNotes').value.trim() || null;
                // Clear maintenance fields when switching to out of order
                updates.maintenanceStart = null;
                updates.maintenanceEnd = null;
                updates.maintenanceNotes = null;
                updates.maintenanceAdminNotes = null;
            }
            // Clear both sets of fields if status is Available
            else {
                updates.maintenanceStart = null;
                updates.maintenanceEnd = null;
                updates.maintenanceNotes = null;
                updates.maintenanceAdminNotes = null;
                updates.outOfOrderSince = null;
                updates.expectedOnline = null;
                updates.outOfOrderReason = null;
                updates.outOfOrderAdminNotes = null;
            }
            
            console.log('Machine updates being saved:', updates);
            
            try {
                var updatedMachine = MachineService.update(editingMachineId, updates);
                
                console.log('Machine updated:', updatedMachine);
                
                loadMachinesList();
                updateMachineFilter();
                loadMachineCards(); // Refresh reservation cards
                cancelEditMachine();
                
            } catch (error) {
                alert(error.message);
            }
        }
        
        function deleteMachine(machineId) {
            console.log('Delete machine requested for ID:', machineId);
            
            var machine = MachineService.findById(machineId);
            
            if (machine) {
                console.log('Found machine to delete:', machine.name);
                
                var confirmMessage = 'Are you sure you want to delete "' + machine.name + '"?\n\nThis action cannot be undone.';
                console.log('Showing confirm dialog with message:', confirmMessage);
                
                var userConfirmed = confirm(confirmMessage);
                console.log('User confirmation result:', userConfirmed);
                
                if (userConfirmed) {
                    console.log('User confirmed deletion of:', machine.name);
                    
                    try {
                        MachineService.delete(machineId);
                        
                        loadMachinesList();
                        updateMachineFilter();
                        loadMachineCards(); // Refresh reservation cards
                        
                        console.log('Machine deleted successfully');
                    } catch (error) {
                        console.log('Error deleting machine:', error);
                        alert('Error deleting machine: ' + error.message);
                    }
                } else {
                    console.log('User canceled deletion');
                }
            } else {
                console.log('Machine not found for ID:', machineId);
            }
        }
        
        console.log('=== FAB LAB RESERVATION SYSTEM LOADED ===');