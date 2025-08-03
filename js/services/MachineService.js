var MachineService = {
            machines: [
                {
                    id: 'laser-cutter',
                    name: 'Laser Cutter',
                    description: '60W CO2 Laser for cutting and engraving wood, acrylic, fabric',
                    status: 'Available',
                    maintenanceStart: null,
                    maintenanceEnd: null,
                    maintenanceNotes: null,
                    maintenanceAdminNotes: null,
                    outOfOrderSince: null,
                    expectedOnline: null,
                    outOfOrderReason: null,
                    outOfOrderAdminNotes: null
                },
                {
                    id: 'dye-sublimation-printer',
                    name: 'Dye Sublimation Printer',
                    description: 'High-quality printer for fabric, ceramics, and promotional items',
                    status: 'Available',
                    maintenanceStart: null,
                    maintenanceEnd: null,
                    maintenanceNotes: null,
                    maintenanceAdminNotes: null,
                    outOfOrderSince: null,
                    expectedOnline: null,
                    outOfOrderReason: null,
                    outOfOrderAdminNotes: null
                },
                {
                    id: 'juki-sewing-machine',
                    name: 'Juki Sewing Machine',
                    description: 'Professional sewing machine for fabric projects and garment construction',
                    status: 'Available',
                    maintenanceStart: null,
                    maintenanceEnd: null,
                    maintenanceNotes: null,
                    maintenanceAdminNotes: null,
                    outOfOrderSince: null,
                    expectedOnline: null,
                    outOfOrderReason: null,
                    outOfOrderAdminNotes: null
                }
            ],
            
            getAll: function() {
                return this.machines;
            },
            
            findById: function(machineId) {
                for (var i = 0; i < this.machines.length; i++) {
                    if (this.machines[i].id === machineId) {
                        return this.machines[i];
                    }
                }
                return null;
            },
            
            getDisplayName: function(machineId) {
                var machine = this.findById(machineId);
                if (machine) {
                    return machine.name;
                } else {
                    return machineId.replace(/-/g, ' ') + ' (DELETED)';
                }
            },
            
            add: function(machineData) {
                var machineId = machineData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                
                for (var i = 0; i < this.machines.length; i++) {
                    if (this.machines[i].id === machineId) {
                        throw new Error('A machine with this name already exists');
                    }
                }
                
                var newMachine = {
                    id: machineId,
                    name: machineData.name,
                    description: machineData.description,
                    status: machineData.status,
                    maintenanceStart: machineData.maintenanceStart || null,
                    maintenanceEnd: machineData.maintenanceEnd || null,
                    maintenanceNotes: machineData.maintenanceNotes || null,
                    maintenanceAdminNotes: machineData.maintenanceAdminNotes || null,
                    outOfOrderSince: machineData.outOfOrderSince || null,
                    expectedOnline: machineData.expectedOnline || null,
                    outOfOrderReason: machineData.outOfOrderReason || null,
                    outOfOrderAdminNotes: machineData.outOfOrderAdminNotes || null
                };
                
                this.machines.push(newMachine);
                return newMachine;
            },
            
            update: function(machineId, updates) {
                var machineIndex = -1;
                for (var i = 0; i < this.machines.length; i++) {
                    if (this.machines[i].id === machineId) {
                        machineIndex = i;
                        break;
                    }
                }
                
                if (machineIndex === -1) {
                    throw new Error('Machine not found');
                }
                
                var machine = this.machines[machineIndex];
                var oldMachineId = machine.id;
                
                if (updates.name !== machine.name) {
                    var newMachineId = updates.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                    
                    for (var i = 0; i < this.machines.length; i++) {
                        if (i !== machineIndex && this.machines[i].id === newMachineId) {
                            throw new Error('A machine with this name already exists');
                        }
                    }
                    
                    machine.id = newMachineId;
                    this.updateReservationReferences(oldMachineId, newMachineId);
                }
                
                machine.name = updates.name;
                machine.description = updates.description;
                machine.status = updates.status;
                machine.maintenanceStart = updates.maintenanceStart || null;
                machine.maintenanceEnd = updates.maintenanceEnd || null;
                machine.maintenanceNotes = updates.maintenanceNotes || null;
                machine.maintenanceAdminNotes = updates.maintenanceAdminNotes || null;
                machine.outOfOrderSince = updates.outOfOrderSince || null;
                machine.expectedOnline = updates.expectedOnline || null;
                machine.outOfOrderReason = updates.outOfOrderReason || null;
                machine.outOfOrderAdminNotes = updates.outOfOrderAdminNotes || null;
                
                return machine;
            },
            
            delete: function(machineId) {
                var machineIndex = -1;
                for (var i = 0; i < this.machines.length; i++) {
                    if (this.machines[i].id === machineId) {
                        machineIndex = i;
                        break;
                    }
                }
                
                if (machineIndex === -1) {
                    throw new Error('Machine not found');
                }
                
                this.machines.splice(machineIndex, 1);
            },
            
            updateReservationReferences: function(oldMachineId, newMachineId) {
                var reservations = ReservationService.getAll();
                var updatedCount = 0;
                
                for (var i = 0; i < reservations.length; i++) {
                    if (reservations[i].machine === oldMachineId) {
                        reservations[i].machine = newMachineId;
                        updatedCount++;
                    }
                }
                
                if (updatedCount > 0) {
                    ReservationService.save(reservations);
                }
                
                return updatedCount;
            }
        };