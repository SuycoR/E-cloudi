import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, surname, email, phone } = body;

    // Validar entrada
    if (!id || !name || !surname || !email || !phone) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Llamar al procedimiento almacenado
    await db.query('CALL updateUsuario(?, ?, ?, ?, ?)', [
      id,
      name,
      surname,
      email,
      phone,
    ]);

    return NextResponse.json(
      { message: 'Usuario actualizado correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
