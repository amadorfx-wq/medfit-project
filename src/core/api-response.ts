/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  API RESPONSE BUILDERS — Core Infrastructure                     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Standardized response builders for all API routes.
 * Lives in src/core/ — no branding, reusable in any clinic instance.
 *
 * Usage:
 *   return apiResponse.ok(data);
 *   return apiResponse.error(err);   // AppError subclasses → correct status
 */

import { NextResponse } from 'next/server';
import { AppError } from './errors';

export const apiResponse = {
  ok: <T>(data: T, status = 200): NextResponse =>
    NextResponse.json(data, { status }),

  error: (err: unknown): NextResponse => {
    if (err instanceof AppError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.statusCode }
      );
    }
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('[API] Unhandled error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  },
};
