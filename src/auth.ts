import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import Credentials from 'next-auth/providers/credentials'
import type { Provider } from 'next-auth/providers'

// Credenciales de OAuth 2.0 (se leen solas de AUTH_GOOGLE_ID/SECRET y AUTH_GITHUB_ID/SECRET).
const providers: Provider[] = [Google, GitHub]

// Sesión simulada SOLO para pruebas E2E. Nunca definas E2E_TEST_MODE en producción.
if (process.env.E2E_TEST_MODE === 'true') {
  providers.push(
    Credentials({
      id: 'e2e',
      name: 'Sesión de prueba',
      credentials: {},
      authorize: async () => ({ id: 'e2e-user', name: 'Usuario E2E', email: 'e2e@test.local' }),
    }),
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: 'jwt' },
  pages: { signIn: '/' },
  trustHost: true,
})
