import User from "@models/user";
import { connectToDb } from "@utils/database";
import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        })
    ],
    callbacks: {
        async session({ session }) {
            const sessionUser = await User.findOne({
                email: session.user.email
            })
            session.user.id = sessionUser._id.toString();
            return session;
        },
        async signIn({ profile }) {
            try {
                await connectToDb();
                // check if user exists
                const userExists = await User.findOne({
                    email: profile.email
                })
    
                if(!userExists) {
                    console.log('here is profile', profile)
                    await User.create({
                        email: profile.email,
                        username: profile.name.replace(' ', '').toLowerCase() + '12345678',
                        image: profile.picture
                    })
                }
                // otherwise create it
                return true;
            } catch(error) {
                console.log(error);
                return false;
            }
        }
    }
    
})

export {handler as GET, handler as POST};