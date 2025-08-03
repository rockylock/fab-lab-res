var ReservationService = {
            getAll: function() {
                var data = localStorage.getItem('fabLabReservations');
                return data ? JSON.parse(data) : [];
            },
            
            save: function(reservations) {
                localStorage.setItem('fabLabReservations', JSON.stringify(reservations));
            },
            
            create: function(reservationData) {
                var reservation = {
                    id: Date.now(),
                    machine: reservationData.machine,
                    studentName: reservationData.studentName.trim(),
                    studentEmail: reservationData.studentEmail.trim(),
                    date: reservationData.date,
                    startTime: reservationData.startTime,
                    endTime: reservationData.endTime,
                    createdAt: new Date().toISOString()
                };
                
                var reservations = this.getAll();
                reservations.push(reservation);
                this.save(reservations);
                
                return reservation;
            },
            
            getConflicting: function(machineId, date) {
                return this.getAll().filter(function(reservation) {
                    return reservation.machine === machineId && reservation.date === date;
                });
            }
        };