// src/services/patient.service.ts
import { supabase } from '@/lib/supabase';
import { Patient } from '@/types/patient';

/**
 * Capa de Servicios: PatientService
 * Responsabilidad exclusiva: Comunicarse con la base de datos de pacientes, 
 * aplicar reglas de negocio crudas (filtros, deduplicación), manejar errores,
 * y retornar datos que cumplan el Contrato de Dominio (Interface Patient).
 */
export class PatientService {
    /**
     * Extrae todos los pacientes.
     * Incluye una barrera de deduplicación a nivel de memoria para asegurar
     * que la UI jamás reciba "Clones", incluso si la DB llega a ensuciarse transitoriamente.
     */
    static async getPatients(): Promise<Patient[]> {
        try {
            const { data, error } = await supabase
                .from('patients')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[PatientService] Database error fetching patients:', error);
                throw new Error(error.message);
            }

            if (!data) return [];

            // [Nivel Enterprise: Filtro Anti-Clones / Deduplicación por Email]
            // Usamos un Map para garantizar unicidad algorítmica O(n).
            const uniquePatientsMap = new Map<string, any>();
            for (const row of data) {
                const emailKey = row.email?.toLowerCase();
                if (emailKey && !uniquePatientsMap.has(emailKey)) {
                    uniquePatientsMap.set(emailKey, row);
                }
            }

            const uniqueRows = Array.from(uniquePatientsMap.values());

            // Transformar DB (snake_case) a Contrato de Dominio (camelCase)
            return uniqueRows.map(row => ({
                id: row.id,
                name: row.name,
                email: row.email,
                phone: row.phone,
                address: row.address,
                dob: row.dob,
                activeTreatment: row.active_treatment,
                formsStatus: row.forms_status,
                approvalStatus: row.approval_status,
                requiredForms: row.required_forms || [],
                completedForms: row.completed_forms || [],
                createdAt: row.created_at,
                tenantId: row.tenant_id
            }));

        } catch (err: any) {
            console.error('[PatientService] Fatal error in getPatients:', err);
            throw err; // Burbujear error hacia el puente del Estado React.
        }
    }

    /**
     * Inserts a new patient record into the database mapping domain types to snake_case.
     */
    static async createPatient(patient: Patient, tenantId?: string): Promise<Patient> {
        const { error } = await supabase.from('patients').insert({
            id: patient.id,
            name: patient.name,
            email: patient.email,
            phone: patient.phone,
            address: patient.address,
            dob: patient.dob,
            active_treatment: patient.activeTreatment,
            forms_status: patient.formsStatus,
            approval_status: patient.approvalStatus,
            required_forms: patient.requiredForms,
            completed_forms: patient.completedForms,
            tenant_id: tenantId || undefined
        });

        if (error) {
            console.error('[PatientService] Database error creating patient:', error);
            throw new Error(error.message);
        }

        return patient;
    }

    /**
     * Updates an existing patient record in the database.
     */
    static async updatePatient(patientId: string, updates: Partial<Patient>): Promise<void> {
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.email !== undefined) dbUpdates.email = updates.email;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.address !== undefined) dbUpdates.address = updates.address;
        if (updates.dob !== undefined) dbUpdates.dob = updates.dob;
        if (updates.activeTreatment !== undefined) dbUpdates.active_treatment = updates.activeTreatment;
        if (updates.formsStatus !== undefined) dbUpdates.forms_status = updates.formsStatus;
        if (updates.approvalStatus !== undefined) dbUpdates.approval_status = updates.approvalStatus;
        if (updates.requiredForms !== undefined) dbUpdates.required_forms = updates.requiredForms;
        if (updates.completedForms !== undefined) dbUpdates.completed_forms = updates.completedForms;

        if (Object.keys(dbUpdates).length === 0) return;

        const { error } = await supabase.from('patients').update(dbUpdates).eq('id', patientId);

        if (error) {
            console.error(`[PatientService] Database error updating patient ${patientId}:`, error);
            throw new Error(error.message);
        }
    }

    /**
     * Deletes a patient from the database.
     */
    static async deletePatient(patientId: string): Promise<void> {
        const { error } = await supabase.from('patients').delete().eq('id', patientId);

        if (error) {
            console.error(`[PatientService] Database error deleting patient ${patientId}:`, error);
            throw new Error(error.message);
        }
    }
}
