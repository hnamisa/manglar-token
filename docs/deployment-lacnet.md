# Guia de despliegue EVM/LACNet

## Requisitos

- Node.js 20+.
- npm.
- Cuenta/wallet de testnet con clave privada.
- RPC de la red indicada por el hackathon.

## Configuracion

```bash
cp .env.example .env
```

Editar `.env`:

```text
PRIVATE_KEY=...
LACNET_RPC_URL=http://35.193.217.67
LACNET_CHAIN_ID=648529
PROJECT_STEWARD=0x...
INITIAL_BUYER=0x...
```

## Comandos

```bash
python mrv/mrv_pipeline.py
npm install
npm run compile
npm test
npm run deploy:lacnet
```

En PowerShell de Windows, si los wrappers estan bloqueados:

```bash
npm.cmd install
npm.cmd run compile
npm.cmd test
npm.cmd run deploy:lacnet
```

## Resultado esperado

El script imprime:

- direccion del contrato `ManglarCarbonCredit`;
- proyecto registrado;
- lote emitido;
- comprador inicial;
- toneladas emitidas;
- hash MRV anclado.

## Nota de seguridad

No usar claves privadas reales ni fondos de mainnet para el demo. Antes de produccion se recomienda auditoria, multisig para roles administrativos y validacion con una metodologia acreditada de carbono azul.
