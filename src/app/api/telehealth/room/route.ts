import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, STAFF_ROLES } from '@/lib/api-auth';

const DAILY_API_URL = 'https://api.daily.co/v1';

function getDailyKey(): string {
    const key = process.env.DAILY_API_KEY;
    if (!key) throw new Error('DAILY_API_KEY is not configured.');
    return key;
}

export async function POST(req: NextRequest) {
    const { user, error: authError } = await requireAuth(req, [...STAFF_ROLES]);
    if (authError) return authError;

    try {
        const { patientId } = await req.json();
        if (!patientId) {
            return NextResponse.json({ error: 'patientId is required.' }, { status: 400 });
        }

        const key = getDailyKey();
        const roomName = `medfit-${patientId}`;
        const exp = Math.floor(Date.now() / 1000) + 3600; // 1-hour session

        // ── Get or create the Daily.co room ───────────────────────────────────
        let roomUrl: string;

        const getRes = await fetch(`${DAILY_API_URL}/rooms/${roomName}`, {
            headers: { Authorization: `Bearer ${key}` },
        });

        if (getRes.ok) {
            const room = await getRes.json();
            roomUrl = room.url;
        } else {
            const createRes = await fetch(`${DAILY_API_URL}/rooms`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${key}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: roomName,
                    privacy: 'private',
                    properties: {
                        exp,
                        enable_prejoin_ui: false,
                        start_video_off: false,
                        start_audio_off: false,
                    },
                }),
            });

            if (!createRes.ok) {
                const err = await createRes.json();
                return NextResponse.json(
                    { error: err.info || 'Failed to create Daily room.' },
                    { status: 500 }
                );
            }

            const room = await createRes.json();
            roomUrl = room.url;
        }

        // ── Mint an owner meeting token for the provider ───────────────────────
        const tokenRes = await fetch(`${DAILY_API_URL}/meeting-tokens`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${key}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                properties: {
                    room_name: roomName,
                    is_owner: true,
                    exp,
                    user_name: user.name || 'Provider',
                },
            }),
        });

        if (!tokenRes.ok) {
            return NextResponse.json({ error: 'Failed to mint provider token.' }, { status: 500 });
        }

        const { token: ownerToken } = await tokenRes.json();

        return NextResponse.json({ roomUrl, roomName, ownerToken });
    } catch (err: unknown) {
        console.error('[Telehealth] Room creation error:', err);
        const message = err instanceof Error ? err.message : 'Internal Server Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
