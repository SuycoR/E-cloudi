import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcrypt";


// Aqui se hacen las configuraciones necesarias
// Aca se manejan proveedores, como github, google al momento de hacer login,
// pero como veremos usuarios autenticados en nuestra BD, esto no sera necesario
// Por que ya hize la pagina de registro.

interface resultadoRow extends RowDataPacket {
    resultado: string // Para que lo arrojado por mi stored tenga un tipo de dato
}
const authOptions = {

    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "email@gmail.com" },
                password: { label: "Password", type: "password", placeholder: "******" }
            },
            //credentials agarra el email y el password colocados
            async authorize(credentials) {

                console.log("Credenciales recibidas:");
                console.log(credentials);

                const [rows] = await db.query<resultadoRow[]>(
                    "CALL authUser(?)",
                    [credentials?.email])
                const resultadoJSON = rows[0][0]?.resultado;
                // Si ya es objeto, úsalo tal cual
                const data = typeof resultadoJSON === "string"
                    ? JSON.parse(resultadoJSON)
                    : resultadoJSON ?? [];
                console.log("Resultado JSON de la BD:", data);
                /*  Ejemplo de data:
                {
                    ok: true,
                    usuario: {
                        id: 101,
                        email: 'suycoriverap@gmail.com',
                        nombre: 'Pedro jesus',
                        apellido: 'Suyco rivera',
                        contrasena: '$2b$10$Y9eF5HphZmZtMP9FCZMQWeqo93lRbZ6trfzQAmZ6zwZ.0.8JQFoli',
                        telefono: '957199045',
                        identificacion: '72647844',
                        tipo_identificacion: 'DNI'
                    }
                
                */
                const isPasswordValid = await bcrypt.compare(credentials?.password as string, data.usuario.contrasena);
                if (data.ok && isPasswordValid) {
                    return {
                        id: data.usuario.id,
                        name: data.usuario.nombre,
                        email: data.usuario.email,
                        surname: data.usuario.apellido,
                        phone: data.usuario.telefono,
                        typeDocument: data.usuario.tipo_identificacion,
                        documentId: data.usuario.identificacion
                    };
                } else {
                    return null; // no autorizado

                }

            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({ token, user }: { token: any; user: any }) {
            if (user) {
                token.id = user.id;

                // ⚠️ Aquí usamos "as unknown" para acceder a campos extra
                token.surname = (user as unknown as { surname: string }).surname;
                token.phone = (user as unknown as { phone: string }).phone;
                token.typeDocument = (user as unknown as { typeDocument: string }).typeDocument;
                token.documentId = (user as unknown as { documentId: string }).documentId;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.surname = token.surname as string;
                session.user.phone = token.phone as string;
                session.user.typeDocument = token.typeDocument as string;
                session.user.documentId = token.documentId as string;
            }
            return session;
        }
    }
}

// For NextAuth v5 beta - TypeScript workaround

//const {handler,auth} = (NextAuth as any)(authOptions);
//export const { GET, POST } = handler;
//export {auth};
const handler = (NextAuth as any)(authOptions);

export const { auth, handlers: { GET, POST } } = handler;

//export const { auth, handlers: { GET, POST } }