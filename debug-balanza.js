#!/usr/bin/env node
/*
  Script para debuggear puerto serial de balanza BBG.
  Muestra cada byte recibido en hexadecimal y ASCII.
  
  Uso:
    node debug-balanza.js COM3 9600
    node debug-balanza.js /dev/ttyUSB0 9600
*/

const { SerialPort } = require('serialport');
const args = process.argv.slice(2);
const portPath = args[0] || '/dev/ttyUSB0';
const baudRate = Number(args[1] || 9600);

console.log(`\n📻 Leyendo puerto: ${portPath} @ ${baudRate} baud`);
console.log(`Presiona Ctrl+C para salir.\n`);

const port = new SerialPort({
  path: portPath,
  baudRate,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  autoOpen: true,
});

port.on('open', () => {
  console.log('✓ Puerto abierto. Esperando datos...\n');
});

port.on('error', (err) => {
  console.error(`❌ Error: ${err.message}`);
  process.exit(1);
});

let buffer = Buffer.alloc(0);
let lineas = 0;

port.on('data', (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
  
  // Mostrar cada byte
  console.log(`\n[CHUNK] ${chunk.length} bytes recibidos:`);
  console.log(`  HEX:  ${chunk.toString('hex').toUpperCase().match(/.{1,2}/g).join(' ')}`);
  console.log(`  ASCII: ${chunk.toString('ascii').replace(/[\x00-\x1F\x7F]/g, '.')}`);
  console.log(`  UTF-8: ${chunk.toString('utf8').replace(/[\x00-\x1F\x7F]/g, '.')}`);
  
  // Detectar fin de línea típicos
  if (chunk.includes('\r\n')) {
    console.log(`  └─ Contiene CRLF (\\r\\n)`);
  }
  if (chunk.includes('\n')) {
    console.log(`  └─ Contiene LF (\\n)`);
  }
  if (chunk.includes('\r')) {
    console.log(`  └─ Contiene CR (\\r)`);
  }
});

process.on('SIGINT', () => {
  console.log('\n\n📊 Resumen:');
  console.log(`   Total de bytes recibidos: ${buffer.length}`);
  console.log(`   Buffer completo: ${buffer.toString('hex')}`);
  port.close(() => {
    console.log('\n✓ Puerto cerrado.\n');
    process.exit(0);
  });
});
