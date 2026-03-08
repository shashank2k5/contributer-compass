import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
        user: {
            id: string;
            githubId?: string;
        } & DefaultSession["user"];
    }

    interface User {
        githubId?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        accessToken?: string;
        githubId?: string;
    }
}
