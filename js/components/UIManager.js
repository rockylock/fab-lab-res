var UIManager = {
            showMessage: function(messageArea, text, type) {
                var messageClass = type === 'success' ? 'message--success' : 'message--error';
                messageArea.innerHTML = '<div class="message ' + messageClass + '">' + text + '</div>';
                
                setTimeout(function() {
                    var messageElement = messageArea.querySelector('.message');
                    if (messageElement) {
                        messageElement.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center',
                            inline: 'nearest'
                        });
                    }
                }, 150);
            },
            
            showFieldError: function(form, fieldName) {
                var field = form.querySelector('[name="' + fieldName + '"]');
                if (field) {
                    // Try to find .form__group first (regular fields)
                    var formGroup = field.closest('.form__group');
                    
                    // If not found, try .form__time-group (time fields)
                    if (!formGroup) {
                        formGroup = field.closest('.form__time-group');
                    }
                    
                    if (formGroup) {
                        formGroup.classList.add('form__group--error');
                        console.log('Added error class to field:', fieldName);
                    } else {
                        console.log('Could not find .form__group or .form__time-group parent for field:', fieldName);
                    }
                } else {
                    console.log('Could not find field:', fieldName);
                }
            },
            
            clearFormErrors: function(form) {
                var errorGroups = form.querySelectorAll('.form__group--error, .form__time-group--error');
                for (var i = 0; i < errorGroups.length; i++) {
                    errorGroups[i].classList.remove('form__group--error');
                    errorGroups[i].classList.remove('form__time-group--error');
                }
                console.log('Cleared', errorGroups.length, 'error fields');
            },
            
            clearMessages: function(messageArea) {
                messageArea.innerHTML = '';
            }
        };