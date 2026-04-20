/*
  Script simple para probar una balanza por puerto serial.
  Uso:
    1) npm install
    2) npm start

  Opcional por variables de entorno:
    PORT=/dev/tty.usbserial-XXXX BAUD=9600 node leer-balanza.js

  En Windows (PowerShell), usa por ejemplo:
    $env:PORT="COM3"; $env:BAUD="9600"; node .\leer-balanza.js

  Si no defines PORT en Windows, el script intenta detectar un COM automaticamente.
*/

const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");

const baudRate = Number(process.env.BAUD || 9600);

function extraerPeso(texto) {
  // Busca algo como: "12.34 kg" o "350 g"
  const match = texto.match(/(-?\d+(?:[.,]\d+)?)\s*(kg|g)\b/i);
  if (!match) return null;

  const valor = Number(match[1].replace(",", "."));
  const unidad = match[2].toLowerCase();

  return { valor, unidad };
}

async function resolverPuerto() {
  if (process.env.PORT) {
    return process.env.PORT;
  }

  if (process.platform === "win32") {
    const puertos = await SerialPort.list();
    const com = puertos
      .map((p) => p.path)
      .find((path) => /^COM\d+$/i.test(path));

    if (com) {
      console.log("PORT no definido. Usando puerto detectado:", com);
      return com;
    }

    throw new Error(
      "No se detecto ningun puerto COM. Conecta la balanza o define PORT=COMx"
    );
  }

  return "/dev/tty.usbserial-0001";
}

async function iniciar() {
  const portPath = await resolverPuerto();

  const port = new SerialPort({
    path: portPath,
    baudRate,
    dataBits: 8,
    stopBits: 1,
    parity: "none",
    autoOpen: true,
  });

  const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

  port.on("open", () => {
    console.log("Conectado a:", portPath, "baud:", baudRate);
    console.log("Esperando datos de la balanza...");
  });

  port.on("error", (err) => {
    console.error("Error del puerto serial:", err.message);
  });

  parser.on("data", (linea) => {
    const texto = String(linea).trim();
    if (!texto) return;

    console.log("RAW:", texto);

    const peso = extraerPeso(texto);
    if (peso) {
      console.log("PESO:", peso.valor, peso.unidad);
    }
  });

  process.on("SIGINT", () => {
    console.log("\nCerrando conexion...");
    port.close(() => process.exit(0));
  });
}

iniciar().catch((err) => {
  console.error("No se pudo iniciar la lectura:", err.message);
  process.exit(1);
});
