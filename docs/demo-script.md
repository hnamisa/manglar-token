# Guion de video demo funcional

Duracion objetivo: 2 a 5 minutos.

## 0:00 - 0:25 | Problema

Presentar: "Los creditos de carbono azul de manglares necesitan transparencia desde la medicion hasta el retiro. Hoy la evidencia puede estar fragmentada y es dificil evitar doble conteo."

Mostrar `docs/submission.md` o la portada del pitch.

## 0:25 - 1:05 | MRV

Ejecutar:

```bash
python mrv/mrv_pipeline.py
```

Explicar:

- dataset de cuatro zonas de manglar;
- delta bruto de carbono;
- descuentos por fuga, incertidumbre y buffer;
- emision final de 2,731 MACC;
- hash MRV reproducible.

## 1:05 - 1:45 | Blockchain

Mostrar `contracts/ManglarCarbonCredit.sol`.

Explicar funciones:

- `registerProject`;
- `issueBatch`;
- `transfer`;
- `retire`.

Ejecutar:

```bash
node scripts/demo-flow.js
```

## 1:45 - 2:45 | Demo web

Abrir `demo/index.html`.

Hacer clic en:

1. Registrar proyecto.
2. Emitir lote MRV.
3. Retirar 25 tCO2e.

Mostrar la bitacora y el certificado demo.

## 2:45 - 3:30 | Impacto y roadmap

Cerrar con:

"Manglar Azul MRV permite una ruta publica desde datos MRV hasta retiro de creditos. El siguiente paso es integrar verificador acreditado, publicar evidencia en IPFS y desplegar en LACNet con una UI de wallet."
