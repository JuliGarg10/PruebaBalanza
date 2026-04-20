# Prueba Balanza (Web Serial)

Interfaz HTML para leer datos de una balanza por puerto serial desde Chrome/Edge usando Web Serial.

## Uso local

1. Instalar dependencias para la prueba por Node:

   npm install

2. Levantar servidor web para el front (requerido por Web Serial):

   python3 -m http.server 8080

3. Abrir en navegador:

   http://localhost:8080

## Despliegue

El repositorio incluye el workflow [deploy-pages.yml](.github/workflows/deploy-pages.yml) para publicar automaticamente en GitHub Pages al hacer push a `main`.

URL esperada luego del despliegue:

https://<usuario>.github.io/<repositorio>/
