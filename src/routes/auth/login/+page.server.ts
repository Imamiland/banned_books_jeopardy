import { redirect } from '@sveltejs/kit';

export async function load({ cookies, url }) {
  const domain = process.env.AUTH0_DOMAIN;
  const clientId = process.env.AUTH0_CLIENT_ID;
  const callbackUrl = process.env.AUTH0_CALLBACK_URL;

  if (!domain || !clientId || !callbackUrl || domain === 'dev.example.auth0.com') {
    redirect(303, '/auth/callback');
  }

  const state = crypto.randomUUID();
  cookies.set('auth0_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: url.protocol === 'https:',
    maxAge: 600,
    path: '/auth/callback'
  });

  const authorizeUrl = new URL(`https://${domain}/authorize`);
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', callbackUrl);
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('scope', process.env.AUTH0_SCOPE ?? 'openid profile email');
  authorizeUrl.searchParams.set('state', state);

  if (process.env.AUTH0_AUDIENCE) {
    authorizeUrl.searchParams.set('audience', process.env.AUTH0_AUDIENCE);
  }

  redirect(302, authorizeUrl.toString());
}
