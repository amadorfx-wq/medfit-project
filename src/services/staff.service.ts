// src/services/staff.service.ts
import { supabase } from '@/lib/supabase';
import { Staff } from '@/types/staff';

export class StaffService {
    /**
     * Extrae todos los miembros del personal
     */
    static async getStaff(): Promise<Staff[]> {
        const { data, error } = await supabase.from('staff').select('*').order('name');
        if (error) {
            console.error('[StaffService] Error fetching staff:', error);
            throw new Error(error.message);
        }

        return (data || []).map(row => ({
            id: row.id,
            name: row.name,
            email: row.email,
            role: row.role as Staff["role"],
            department: row.department,
            lastActive: row.last_active,
            address: row.address,
            phone: row.phone,
            licenseNumber: row.license_number,
            notes: row.notes,
            documents: row.documents || [],
            supabaseUserId: row.supabase_user_id
        }));
    }

    /**
     * Persiste un nuevo usuario en la base de datos de 'staff'
     */
    static async createStaff(staff: Staff, tenantId?: string): Promise<Staff> {
        const { error } = await supabase.from('staff').insert({
            id: staff.id,
            name: staff.name,
            email: staff.email,
            role: staff.role,
            department: staff.department,
            address: staff.address,
            phone: staff.phone,
            license_number: staff.licenseNumber,
            notes: staff.notes,
            documents: staff.documents,
            last_active: staff.lastActive,
            tenant_id: tenantId || undefined,
            supabase_user_id: staff.supabaseUserId
        });

        if (error) {
            console.error('[StaffService] Database error creating staff:', error);
            throw new Error(error.message);
        }

        return staff;
    }

    /**
     * Actualiza un miembro del staff existente
     */
    static async updateStaff(staffId: string, updates: Partial<Omit<Staff, "id">>): Promise<void> {
        const dbUpdates: any = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.email !== undefined) dbUpdates.email = updates.email;
        if (updates.role !== undefined) dbUpdates.role = updates.role;
        if (updates.department !== undefined) dbUpdates.department = updates.department;
        if (updates.lastActive !== undefined) dbUpdates.last_active = updates.lastActive;
        if (updates.supabaseUserId !== undefined) dbUpdates.supabase_user_id = updates.supabaseUserId;

        if (Object.keys(dbUpdates).length === 0) return;

        const { error } = await supabase.from('staff').update(dbUpdates).eq('id', staffId);
        if (error) {
            console.error(`[StaffService] Database error updating staff ${staffId}:`, error);
            throw new Error(error.message);
        }
    }

    /**
     * Elimina a un miembro del personal
     */
    static async deleteStaff(staffId: string): Promise<void> {
        const { error } = await supabase.from('staff').delete().eq('id', staffId);
        if (error) {
            console.error(`[StaffService] Database error deleting staff ${staffId}:`, error);
            throw new Error(error.message);
        }
    }

    /**
     * Carga un documento al Storage Bucket
     */
    static async uploadDocument(staffId: string, file: File): Promise<string> {
        const ext = file.name.split('.').pop();
        const fileName = `${Date.now()}_${file.name}`;
        const path = `${staffId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('staff-documents')
            .upload(path, file, { upsert: false });

        if (uploadError) {
            console.error('[StaffService] Storage upload error:', uploadError);
            throw new Error(uploadError.message);
        }

        const { data: publicData } = supabase.storage
            .from('staff-documents')
            .getPublicUrl(path);

        return publicData.publicUrl;
    }

    /**
     * Elimina un documento del Storage
     */
    static async deleteDocument(staffId: string, docName: string): Promise<void> {
        const path = `${staffId}/${docName.split('_').slice(1).join('_')}`; // Reverse engineered from fileName, though we might need exact path. Let's fix logic: Assuming docName is exact filename.

        // Actually, store.tsx implementation was:
        // await supabase.storage.from('staff-documents').remove([`${staffId}/${docName}`]);
        // Let's presume docName parameter IS the filename in the db.
        const { error } = await supabase.storage
            .from('staff-documents')
            .remove([`${staffId}/${docName}`]);

        if (error) {
            console.error('[StaffService] Storage delete error:', error);
            throw new Error(error.message);
        }
    }
}
