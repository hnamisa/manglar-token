# Manglar Azul MRV

Proyecto final para el Hackathon Carbon Tokenization.

Manglar Azul MRV tokeniza creditos de carbono azul generados por conservacion y restauracion de manglares. La propuesta combina medicion MRV, hash de evidencia, emision de lotes EVM y retiro publico de creditos para reducir doble conteo y mejorar trazabilidad.

## Equipo

- Hiro Namisato Maetahara - Blockchain, smart contracts y despliegue EVM.
- John Nunez Perez - MRV, datos, producto, pitch y demo funcional.

## Problema

Los creditos de carbono de proyectos naturales suelen enfrentar baja trazabilidad, reportes dispersos, riesgo de doble conteo y poca visibilidad para compradores. En ecosistemas de manglar, ademas, el valor climatico convive con beneficios sociales y de biodiversidad que rara vez quedan conectados a la evidencia tecnica.

## Solucion

Manglar Azul MRV crea un flujo auditable:

1. El operador MRV consolida datos de satelite, drone, sensores y parcelas.
2. El pipeline calcula toneladas CO2e emitibles despues de fugas, incertidumbre y buffer de permanencia.
3. El contrato EVM emite un lote tokenizado por vintage y hash MRV.
4. El comprador retira creditos y obtiene un recibo publico con hash de certificado.

## Estructura

```text
manglar-token/
  contracts/                  Contrato EVM para registro, emision y retiro
  mrv/                        Pipeline Python de MRV reproducible
  data/                       Dataset y metadata de ejemplo
  scripts/                    Deploy Hardhat y demo textual
  test/                       Pruebas Hardhat
  demo/                       Demo web local sin dependencias
  docs/                       Submission, arquitectura, roadmap y guion
  assets/images/              Imagenes del pitch/demo
```

## Quick start local

```bash
cd manglar-token
python mrv/mrv_pipeline.py
node scripts/demo-flow.js
```

En Windows con PowerShell bloqueando wrappers de npm, usar `npm.cmd`:

```bash
npm.cmd install
npm.cmd run compile
npm.cmd test
```

Si Hardhat muestra un error con `AppData` en un entorno restringido, se puede redirigir su carpeta global a una ruta local:

```powershell
$root=(Resolve-Path '.').Path
$env:APPDATA="$root\.hardhat-global\Roaming"
$env:LOCALAPPDATA="$root\.hardhat-global\Local"
npm.cmd test
```

Abrir el demo funcional:

```text
demo/index.html
```

## Smart contract

Contrato principal: `contracts/ManglarCarbonCredit.sol`.

Funciones principales:

- `registerProject`: registra proyecto, ubicacion, operador y metadata.
- `issueBatch`: emite un lote de creditos asociado a `mrvHash` y `evidenceURI`.
- `transfer` / `safeTransferFrom`: transfiere creditos por lote.
- `retire`: quema creditos y crea recibo de retiro con `certificateHash`.
- `availableToRetire`: expone saldo no retirado por lote.

Unidad del token: `1 MACC = 1 tonelada CO2e verificada`.

## Resultado MRV de ejemplo

El dataset de ejemplo calcula:

- Delta bruto: `3,660 tCO2e`
- Delta neto: `3,580 tCO2e`
- Creditos emitibles: `2,731 MACC`
- Hash MRV: `0x3cbcd3d5dc5901126ac241f1ed3001f0264beebca291d27549e5a8a42cc8e1ba`

El dataset es ilustrativo para hackathon. En produccion debe reemplazarse por datos certificados por una metodologia y verificador acreditado.

## Despliegue LACNet / EVM

1. Copiar `.env.example` a `.env`.
2. Configurar `PRIVATE_KEY`, `LACNET_RPC_URL`, `LACNET_CHAIN_ID`, `PROJECT_STEWARD` e `INITIAL_BUYER`.
3. Generar el reporte MRV:

```bash
python mrv/mrv_pipeline.py
```

4. Compilar y desplegar:

```bash
npm run compile
npm run deploy:lacnet
```

La configuracion default usa `http://35.193.217.67` como RPC de hackathon, segun las guias entregadas.

## Entregables

- Ficha de submission: `docs/submission.md`
- Arquitectura: `docs/architecture.md`
- Guia de despliegue: `docs/deployment-lacnet.md`
- Guion de video demo: `docs/demo-script.md`
- Pitch deck editable: se genera en `pitch/output/output.pptx`
- Demo web: `demo/index.html`

## Estado de enlaces externos

- GitHub: pendiente de publicar desde esta carpeta.
- Pitch deck: pendiente de subir a Drive/Gamma/Canva si el curso exige URL.
- Video demo: usar `docs/demo-script.md` para grabar y subir un video de 2 a 5 minutos.

## Licencia

MIT. Proyecto open source para fines academicos y de hackathon.
