import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
            authorization: {
                params: {
                    scope: "read:user user:email repo",
                },
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, account }) {
            // Persist the OAuth access_token in the JWT right after sign-in
            if (account) {
                token.accessToken = account.access_token;
                token.githubId = account.providerAccountId;
            }
            return token;
        },
        async session({ session, token }: any) {
            // Make the access token available on the client-side session object
            session.accessToken = token.accessToken;
            session.user.id = token.sub;
            session.user.githubId = token.githubId;
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
