import LineProvider from 'next-auth/providers/line'
import { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID as string,
      clientSecret: process.env.LINE_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: 'jwt', // JWTトークンによるセッション管理
  },
  // コールバックURLの設定
  callbacks: {
    async redirect({ url, baseUrl }) {
      // LINE Developer Consoleに登録されているコールバックURLを使用
      if (url.startsWith('/api/auth/callback/line')) {
        return process.env.NEXTAUTH_CALLBACK_URL || url
      }
      // デフォルトの動作
      return url.startsWith(baseUrl) ? url : baseUrl
    },
    async jwt({ token, account }) {
      console.info('jwt token:', token, 'account:', account)
      // 初回サインイン時にアカウント情報をトークンに追加
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          provider: account.provider,
        }
      }
      return token
    },
    async session({ session, token }) {
      console.info('session session:', session, 'token:', token)
      // セッションにトークン情報を追加
      if (session.user) {
        return {
          ...session,
          user: {
            ...session.user,
            accessToken: token.accessToken,
            provider: token.provider,
          },
        }
      }

      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
}
