import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET_KEY = "teste"; // Use a mesma chave configurada no EMQX

export async function POST(req) {
  try {
    const { username, clientId } = await req.json();
    if (!username || !clientId) {
      return NextResponse.json({ message: "Usuário e clientId são obrigatórios" }, { status: 400 });
    }

    // Gerar token JWT
    const token = jwt.sign({ username, clientId }, SECRET_KEY, { expiresIn: "1h" });

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
  }
}

