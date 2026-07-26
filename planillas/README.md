# Planillas tributarias (fuente de verdad)

Tablas copiadas del corpus oficial del SIN / Ley 843.
El backend en `backend/lib/data/` refleja estas celdas para `clasificar_regimen` y `calcular_impuestos`.

| Archivo | Contenido | Estado |
|---|---|---|
| `01-rts-categorias.csv` | Categorías y cuotas del Régimen Tributario Simplificado | Completa (D.S. 24484 Art. 17/18) |
| `02-impuestos-general.csv` | Alícuotas IVA / IT / IUE | Completa (Ley 843) |
| `03-calendario-vencimientos.csv` | Vencimientos por dígito NIT + RTS día 10 + STI día 22 + RAU 31 de octubre | Completa (regla base; feriados y prórrogas aparte) |
| `04-checklist-nit.csv` | Pasos de inscripción al NIT (RNC) | Completa para Persona Natural / RTS |
| `05-sti-categorias.csv` | Categorías y cuotas del Sistema Tributario Integrado | Completa (D.S. 23027 Art. 3–4; Art. 10 puede actualizar montos) |
| `06-rau-cuotas-2024.csv` | Cuotas por hectárea y límites del Régimen Agropecuario Unificado | Completa (RND 102500000038 + D.S. 24463 Anexo I) |

**Regla:** ningún monto inventado. Si falta un dato, la celda dice `NO ENCONTRADO`.

**Nota planilla 4:** el PDF `ANEXO-NIT.pdf` del catálogo SIN es un listado de NITs
(facturación 2018), no la guía. Usamos el Anexo Técnico RNC en siatinfo + RND
102500000017 / 102600000002. Resumen en `corpus/parsed/10-rnc-inscripcion-nit.md`.
