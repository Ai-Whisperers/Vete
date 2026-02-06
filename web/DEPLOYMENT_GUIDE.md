# 🚀 Despliegue en Vercel (Guía Rápida)

He optimizado tu proyecto para trabajar nativamente con **Vercel**.

## ⚠️ IMPORTANTE: Ubicación

Para que funcione, **DEBES** estar dentro de la carpeta `web`.

1.  Abre tu terminal.
2.  Asegúrate de entrar a la carpeta correcta:
    ```bash
    cd web
    ```
3.  Ejecuta el comando de despliegue:
    ```bash
    npx vercel
    ```

## Pasos del Asistente de Vercel

Cuando ejecutes el comando, te preguntará varias cosas. Responde así:

- `Set up and deploy?` -> **Y** (Yes)
- `Which scope?` -> Selecciona tu cuenta.
- `Link to existing project?` -> **N** (No)
  _(Nota: Si ya creaste uno fallido antes, di No para crear uno nuevo limpio, o Sí para arreglar el anterior sobrescribiéndolo)_
- `Project name?` -> `veterinaria-app` (o el nombre que gustes)
- `In which directory?` -> `./` (Enter)
  _(Si muestra `No framework detected`, ¡ALTO! Estás en la carpeta incorrecta. Cancela con Ctrl+C, entra a `cd web` y empieza de nuevo)._
- `Want to modify these settings?` -> **N** (No)

¡Y listo! Vercel detectará **Next.js** automáticamente y te dará una URL funcionando.

## Cómo probar las clínicas

Una vez desplegado, tendrás una URL como `https://veterinaria-app.vercel.app`.
Prueba las siguientes rutas:

- **Adris:** `https://.../terrapet`
- **Petlife:** `https://.../petlife`
