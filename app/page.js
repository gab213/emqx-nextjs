"use client"; //bugou sem

import { useState, useEffect } from "react";
import mqtt from "mqtt";

export default function Home() {
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(null);
  const [mqttClient, setMqttClient] = useState(null);

  // Altere se seu EMQX estiver em outro IP ou porta
  const MQTT_BROKER = "mqtt://localhost:1883";

  // Sempre que o 'token' mudar, a gente tenta conectar
  useEffect(() => {
    if (!token) return;

    // Configurar conexão MQTT com JWT
    // 'username' e 'password' são passados ao broker
    // No EMQX, definimos 'JWT From' = username => então 'dispositivo01' = 'username' 
    const client = mqtt.connect(MQTT_BROKER, {
      username: "dispositivo01", // Tem que bater com o que passamos no /api/token
      password: token,          // Aqui vai o token JWT
      clientId: "client123",    // Mesma clientId usada no token
    });

    client.on("connect", () => {
      console.log("Conectado ao EMQX via MQTT + JWT!");
      // Exemplo: subscribe no tópico "test/topic"
      client.subscribe("test/topic");
    });

    client.on("message", (topic, payload) => {
      setMessage(`Tópico: ${topic}, Mensagem: ${payload.toString()}`);
    });

    client.on("error", (err) => {
      console.error("Erro MQTT:", err);
    });

    setMqttClient(client);

    // Clean up ao desmontar
    return () => {
      client.end();
    };
  }, [token]);

  // Chama /api/token para gerar o token
  const getToken = async () => {
    const response = await fetch("/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "dispositivo01", clientId: "client123" }),
    });
    const data = await response.json();

    if (data.token) {
      setToken(data.token);
      console.log("Token JWT gerado:", data.token);
    } else {
      console.error("Falha ao gerar token");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Cliente MQTT com JWT</h1>
      <button onClick={getToken}>Gerar Token e Conectar</button>
      {token && <p>Token JWT gerado (ver console): {token}</p>}

      <hr />
      <h2>Mensagens Recebidas</h2>
      <p>{message || "Nada recebido ainda..."}</p>
    </div>
  );
}

