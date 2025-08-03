function timeToMinutes(timeStr) {
            var parts = timeStr.split(':');
            return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
        
        function addMinutesToTime(timeStr, minutes) {
            var parts = timeStr.split(':');
            var totalMinutes = parseInt(parts[0]) * 60 + parseInt(parts[1]) + minutes;
            var hours = Math.floor(totalMinutes / 60);
            var mins = totalMinutes % 60;
            return hours.toString().padStart(2, '0') + ':' + mins.toString().padStart(2, '0');
        }
        
        function formatTime(timeStr) {
            var parts = timeStr.split(':');
            var hours = parseInt(parts[0]);
            var minutes = parts[1];
            var ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            return hours + ':' + minutes + ' ' + ampm;
        }
        
        function formatDateTime(isoString) {
            var date = new Date(isoString);
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        }
        
        function wouldConflict(newStartTime, newEndTime, existingReservations) {
            var newStart = timeToMinutes(newStartTime);
            var newEnd = timeToMinutes(newEndTime);
            
            for (var i = 0; i < existingReservations.length; i++) {
                var existing = existingReservations[i];
                var existingStart = timeToMinutes(existing.startTime);
                var existingEnd = timeToMinutes(existing.endTime);
                
                if (newStart < existingEnd && newEnd > existingStart) {
                    console.log('Conflict detected with reservation:', existing.startTime, '-', existing.endTime);
                    return true;
                }
            }
            
            return false;
        }
        
        function isStartTimeUnavailable(startTime, existingReservations) {
            var testEndTime = addMinutesToTime(startTime, 30);
            
            for (var i = 0; i < existingReservations.length; i++) {
                var existing = existingReservations[i];
                
                if (wouldConflict(startTime, testEndTime, [existing])) {
                    return true;
                }
            }
            
            return false;
        }