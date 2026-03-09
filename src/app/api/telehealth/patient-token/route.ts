import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api-auth';

const DAILY_API_URL = 'https://api.daily.co/v1';

function getDailyKey(): string {
    const key = process.env.DAILY_API_KEY;
    if (!key) throw new Error('DAILY_API_KEY is not configured.');
    return key;
}

export async function POST(req: NextRequest) {
    // Any authenticated user may request their own patient token
    const { user, error: authError } = await requireAuth(req, [
        'PATIENT', 'SUPERADMIN', 'ADMIN', 'DOCTOR', 'RECEPTION',
    ]);
    if (authError) return authError;

    try {
        const key = getDailyKey();

        // Room name is always derived from the patient's own auth user ID,
        // which equals patients.id in our schema (set during registration).
        const roomName = `medfit-${user.id}`;
        const exp = Math.floor(Date.now() / 1000) + 3600;

        // ── Verify the room exists (provider must start session first) ─────────
        const roomRes = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
            headers: { Authorization: `Bearer ${key}` },
        });

        if (!roomRes.ok) {
            return NextResponse.json(
                { error: 'Your provider has not started the session yet. Please wait.' },
                { status: 404 }
            );
        }

        const room = await roomRes.json();

        // ── Mint a non-owner meeting token for the patient ─────────────────────
        const tokenRes = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${key}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                properties: {
                    room_name: roomName,
                    is_owner: false,
                    exp,
                    user_name: user.name || 'Patient',
                },
            }),
        });

        if (!tokenRes.ok) {
            return NextResponse.json({ error: 'Failed to mint patient token.' }, { status: 500 });
        }

        const { token } = await tokenRes.json();

        return NextResponse.json({ roomUrl: room.url, roomName, token });
    } catch (err: unknown) {
        console.error('[Telehealth] Patient token error:', err);
        const message = err instanceof Error ? err.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
