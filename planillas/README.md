# Planillas tributarias (fuente de verdad)

Tablas copiadas del corpus oficial del SIN / Ley 843. El backend en `backend/lib/data/` debe reflejar estas celdas.

| Archivo | Contenido | Estado |
|---|---|---|
| `01-rts-categorias.csv` | Categorías y cuotas del Régimen Tributario Simplificado | Completa (D.S. 24484 Art. 17/18) |
| `02-impuestos-general.csv` | Alícuotas IVA / IT / IUE | Completa (Ley 843) |
| `03-calendario-vencimientos.csv` | Vencimientos por dígito NIT + RTS día 10 | Completa (regla base; feriados 2026 aparte) |
| `04-checklist-nit.csv` | Pasos de inscripción al NIT (RNC) | Completa para Persona Natural / RTS |

**Regla:** ningún monto inventado. Si falta un dato, la celda dice `NO ENCONTRADO`.

**Nota planilla 4:** el PDF `ANEXO-NIT.pdf` del catálogo SIN es un listado de NITs
(facturación 2018), no la guía. Usamos el Anexo Técnico RNC en siatinfo + RND
102500000017 / 102600000002. Resumen en `corpus/parsed/10-rnc-inscripcion-nit.md`.
