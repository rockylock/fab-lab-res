function isValidEmail(email) {
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            var result = emailRegex.test(email);
            console.log('Email validation for', email, ':', result);
            return result;
        }
        
        function validateReservationForm(formData) {
            var errors = [];
            var isValid = true;
            
            if (!formData.studentName || formData.studentName.trim() === '') {
                errors.push('Student name is required');
                isValid = false;
            }
            
            if (!formData.studentEmail || formData.studentEmail.trim() === '') {
                errors.push('Email address is required');
                isValid = false;
            } else if (!isValidEmail(formData.studentEmail)) {
                errors.push('Please enter a valid email address');
                isValid = false;
            }
            
            if (!formData.date) {
                errors.push('Date is required');
                isValid = false;
            } else {
                // Check if date is in the past
                var today = new Date();
                var selectedDate = new Date(formData.date);
                today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
                selectedDate.setHours(0, 0, 0, 0);
                
                if (selectedDate < today) {
                    errors.push('Date cannot be in the past');
                    isValid = false;
                }
            }
            
            if (!formData.startTime) {
                errors.push('Start time is required');
                isValid = false;
            }
            
            if (!formData.endTime) {
                errors.push('End time is required');
                isValid = false;
            }
            
            if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
                errors.push('End time must be after start time');
                isValid = false;
            }
            
            return { isValid: isValid, errors: errors };
        }