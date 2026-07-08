# Ficha Submission - Hackathon Carbon Tokenization

## Nombre del proyecto

Manglar Azul MRV

## Miembros del equipo y roles

- Hiro Namisato Maetahara: Blockchain lead, smart contracts, despliegue EVM y pruebas.
- John Núñez Perez: MRV/data lead, investigacion de problema, demo funcional y pitch.

## Descripcion del problema identificado

Los mercados de carbono necesitan trazabilidad fuerte para evitar doble conteo, greenwashing y baja confianza de compradores. En proyectos de carbono azul, como manglares, la evidencia MRV suele vivir fuera de cadena en reportes dispersos, lo que dificulta conectar datos climaticos, beneficios comunitarios, emision de creditos y retiro final.

## Resumen de la solucion

Manglar Azul MRV tokeniza creditos de carbono azul generados por conservacion y restauracion de manglares. El sistema calcula creditos emitibles desde datos MRV, ancla un hash de evidencia, emite lotes EVM por vintage y permite retirar creditos con recibos publicos. Asi, cada tonelada CO2e puede seguirse desde la medicion hasta su retiro.

## Tecnologias utilizadas

- Solidity 0.8.24 y contrato EVM autocontenido.
- Hardhat para compilacion, pruebas y despliegue.
- Python para pipeline MRV reproducible.
- HTML, CSS y JavaScript para demo funcional local.
- Hash SHA-256 para evidencia MRV y certificados.
- IPFS-style URIs para evidencia y metadata off-chain.
- Configuracion compatible con LACNet/LACChain hackathon RPC.

## Enlace al Pitch Deck

Local editable: `pitch/output/output.pptx`

URL publica pendiente de subir.

## Enlace al repositorio de GitHub

Pendiente de publicacion desde `manglar-token`.

## Enlace a video demo funcional

Pendiente de grabacion y subida. Guion listo en `docs/demo-script.md`.

Duracion objetivo: 2 a 5 minutos.

## Justificacion de impacto o escalabilidad

El proyecto mejora la confianza en creditos de carbono azul al conectar evidencia MRV, emision y retiro en una ruta auditable. Es escalable porque el contrato admite multiples proyectos, lotes, vintages y hashes de evidencia. El modelo puede extenderse a manglares de Peru, Ecuador, Colombia y otros ecosistemas costeros con metodologias acreditadas, manteniendo una capa comun de transparencia EVM.

## Alineacion con los objetivos de la hackathon

- Sostenibilidad: promueve conservacion y restauracion de manglares, mitigacion climatica y beneficios de biodiversidad.
- Innovacion blockchain: usa registros inmutables, tokenizacion y retiros verificables para reducir doble conteo.
- Viabilidad: incluye contrato, pruebas, pipeline MRV, demo y guia de despliegue.
- Escalabilidad: separa evidencia off-chain certificada de trazabilidad on-chain, permitiendo crecimiento por lotes/proyectos.

## Hoja de ruta futura

1. Integrar verificador externo y metodologia acreditada de carbono azul.
2. Publicar metadata MRV en IPFS/Filecoin y enlazar documentos firmados.
3. Conectar el contrato a una UI con wallet EVM y red LACNet.
4. Agregar roles DAO/comunidad para distribucion transparente de ingresos.
5. Auditar seguridad del contrato y preparar despliegue testnet/mainnet.
6. Piloto con un sitio de manglar y comprador institucional.
