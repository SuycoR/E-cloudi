import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Asegúrate que esté bien importado
import { RowDataPacket } from "mysql2";
import bcrypt from "bcrypt";

interface estructuraResultado extends RowDataPacket {
    ultimoID: number;
}

export async function POST(request:Request){
    //Que recibira este post? RPTA: Un formato JSON de register
    const data = await request.json();
    
    try{
        console.log(data);
        //Esto quiere decir que el resultado de la query la guardara en esa estructura
        data.contrasena = await bcrypt.hash(data.contrasena, 10);
        // Asegúrate de que la contraseña se ha cifrado correctamente
        console.log(data.contrasena);
        // Llamamos al procedimiento almacenado 'RegistrarUsuarios' con los datos del usuario
        const [rows] = await db.query<estructuraResultado[]>(
            "CALL RegistrarUsuarios(?, ?,?, ?,?, ?,?)",
            [
                data.nombre,
                data.apellido,
                data.tipo_identificacion,
                data.identificacion,
                data.email,
                data.telefono,
                data.contrasena
            ]
          );
        // El resultado del SP estará dentro del primer array → primer objeto → 'resultado'
        console.log(rows[0][0]?.ultimoID);
        return NextResponse.json("Usuario registrado satisfactoriamente")
        
        
    }
    catch{

    }

}
