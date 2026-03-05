import { useState, useEffect, useCallback } from 'react';
import { PatientService } from '@/services/patient.service';
import { Patient } from '@/types/patient';

export function useAdminPatients() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchPatients = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await PatientService.getPatients();
            setPatients(data);
        } catch (err: any) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    // Allows manual re-fetching when something outside the hook changes the DB.
    const mutate = async () => {
        await fetchPatients();
    };

    return { patients, isLoading, error, mutate, setPatients };
}
