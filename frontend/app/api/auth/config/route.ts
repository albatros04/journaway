export async function GET() { const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim(); return Response.json({ googleClientId: googleClientId || null }); }
