import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcrypt";

interface resultadoRow extends RowDataPacket {
  resultado: string;
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@gmail.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "******",
        },
      },
      async authorize(credentials) {
        console.log("Credenciales recibidas:");
        console.log(credentials);

        const [rows] = await db.query<resultadoRow[]>("CALL authUser(?)", [
          credentials?.email,
        ]);
        const resultadoJSON = rows[0][0]?.resultado;
        const data =
          typeof resultadoJSON === "string"
            ? JSON.parse(resultadoJSON)
            : resultadoJSON ?? [];
        console.log("Resultado JSON de la BD:", data);

        const isPasswordValid = await bcrypt.compare(
          credentials?.password as string,
          data.usuario.contrasena
        );
        if (data.ok && isPasswordValid) {
          return {
            id: data.usuario.id,
            name: data.usuario.nombre,
            email: data.usuario.email,
            surname: data.usuario.apellido,
            phone: data.usuario.telefono,
            typeDocument: data.usuario.tipo_identificacion,
            documentId: data.usuario.identificacion,
          };
        } else {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.surname = (user as unknown as { surname: string }).surname;
        token.phone = (user as unknown as { phone: string }).phone;
        token.typeDocument = (
          user as unknown as { typeDocument: string }
        ).typeDocument;
        token.documentId = (
          user as unknown as { documentId: string }
        ).documentId;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.surname = token.surname as string;
        session.user.phone = token.phone as string;
        session.user.typeDocument = token.typeDocument as string;
        session.user.documentId = token.documentId as string;
      }
      return session;
    },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nextAuth = (NextAuth as any)(authOptions);

export const auth = nextAuth.auth;
export const handlers = nextAuth.handlers;
