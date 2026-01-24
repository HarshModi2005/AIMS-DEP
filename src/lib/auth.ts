import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { parseRollNumber } from "@/lib/utils";
import { parseRollNumber as parseStudentDetails } from "@/lib/student-utils";
import type { Role, DegreeType } from "@prisma/client";

declare module "next-auth" {
    interface User {
        rollNumber?: string;
        role?: Role;
    }
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            image?: string;
            rollNumber: string;
            role: Role;
        };
    }
}

class InvalidCredentials extends CredentialsSignin {
    code = "invalid_credentials"
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                    hd: "iitrpr.ac.in", // Restrict to IIT Ropar domain
                },
            },
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new InvalidCredentials();
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user || !user.password) {
                    throw new InvalidCredentials();
                }

                const isValid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!isValid) {
                    throw new InvalidCredentials();
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: `${user.firstName} ${user.lastName}`,
                    rollNumber: user.rollNumber,
                    role: user.role,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        async signIn({ user, account }) {
            // For Google sign in, check if user exists and create if not
            if (account?.provider === "google") {
                const email = user.email!;

                // Check if email is from IIT Ropar
                if (!email.endsWith("@iitrpr.ac.in")) {
                    return false;
                }

                const existingUser = await prisma.user.findUnique({
                    where: { email },
                    include: { student: true }, // Check if student profile exists
                });

                if (!existingUser) {
                    // Extract roll number from email using shared utility
                    const rollNumber = parseRollNumber(email) || email.split("@")[0].toUpperCase();

                    // Parse name
                    const nameParts = (user.name || "User").split(" ");
                    const firstName = nameParts[0] || "User";
                    const lastName = nameParts.slice(1).join(" ") || "";

                    // Parse student details
                    const studentDetails = parseStudentDetails(rollNumber);

                    // Create User and optionally Student in a transaction
                    await prisma.$transaction(async (tx) => {
                        const newUser = await tx.user.create({
                            data: {
                                email,
                                rollNumber,
                                firstName,
                                lastName,
                                profilePhoto: user.image,
                                role: "STUDENT",
                            },
                        });

                        // Create student profile if details are valid
                        if (studentDetails && studentDetails.degreeType !== "UNKNOWN") {
                            await tx.student.create({
                                data: {
                                    userId: newUser.id,
                                    department: studentDetails.department,
                                    yearOfEntry: studentDetails.yearOfEntry,
                                    degree: studentDetails.degree,
                                    degreeType: studentDetails.degreeType as DegreeType,
                                    currentStatus: "REGISTERED",
                                },
                            });
                        }
                    });
                } else {
                    // Existing user - check if student profile is missing
                    if (!existingUser.student && existingUser.role === "STUDENT") {
                        const studentDetails = parseStudentDetails(existingUser.rollNumber);

                        if (studentDetails && studentDetails.degreeType !== "UNKNOWN") {
                            await prisma.student.create({
                                data: {
                                    userId: existingUser.id,
                                    department: studentDetails.department,
                                    yearOfEntry: studentDetails.yearOfEntry,
                                    degree: studentDetails.degree,
                                    degreeType: studentDetails.degreeType as DegreeType,
                                    currentStatus: "REGISTERED",
                                },
                            });
                        }
                    }
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            // Only run on initial sign-in when user object is present
            if (user) {
                // For credentials auth, user data already includes rollNumber and role
                if (user.rollNumber && user.role) {
                    token.id = user.id;
                    token.rollNumber = user.rollNumber;
                    token.role = user.role;
                } else {
                    // For OAuth (Google), we need to fetch from DB
                    const dbUser = await prisma.user.findUnique({
                        where: { email: user.email! },
                        select: { id: true, rollNumber: true, role: true },
                    });
                    if (dbUser) {
                        token.id = dbUser.id;
                        token.rollNumber = dbUser.rollNumber;
                        token.role = dbUser.role;
                    }
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.rollNumber = token.rollNumber as string;
                session.user.role = token.role as Role;
            }
            return session;
        },
    },
});
