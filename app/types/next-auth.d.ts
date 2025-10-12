// types/next-auth.d.ts

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      surname?: string | null;
      phone?: string | null;
      typeDocument?: string | null;
      documentId?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    surname?: string | null;
    phone?: string | null;
    email?: string | null;
    image?: string | null;
    typeDocument?: string | null;
    documentId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    surname?: string | null;
    phone?: string | null;
    typeDocument?: string | null;
    documentId?: string | null;
  }
}
