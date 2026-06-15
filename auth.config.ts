import type { NextAuthConfig } from "next-auth";

const PUBLIC_PATHS = ["/", "/login", "/register", "/discover"];
const AUTH_PATHS = ["/login", "/register"];

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const { pathname } = nextUrl;
      const isLoggedIn = !!auth?.user;

      if (pathname.startsWith("/api")) return true;

      if (isLoggedIn && AUTH_PATHS.includes(pathname)) {
        return Response.redirect(new URL("/feed", nextUrl));
      }

      const isPublic =
        PUBLIC_PATHS.includes(pathname) ||
        pathname.startsWith("/discover") ||
        (pathname.startsWith("/") &&
          pathname.split("/").length === 2 &&
          !pathname.startsWith("/api"));

      if (!isLoggedIn && !isPublic) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
