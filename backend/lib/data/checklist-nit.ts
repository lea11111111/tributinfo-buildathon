/**
 * PLANILLA 4 de Fernanda — Checklist de inscripción al NIT.
 *
 * ⚠️ PASOS PLACEHOLDER (estructura orientativa). Reemplazar con la guía
 * oficial del SIN ANTES de la demo.
 */
import type { PasoChecklist } from "../types/resultado";
import { FUENTE_PENDIENTE } from "./verificacion";

// TODO_FERNANDA: reemplazar con planilla 4 (guía oficial de inscripción al NIT)
export const CHECKLIST_NIT: PasoChecklist[] = [
  {
    paso: 1,
    titulo: "Reunir documentos personales",
    descripcion: "TODO_FERNANDA: documentos exactos según la guía del SIN.",
    documentosRequeridos: ["Cédula de identidad vigente", "Factura de luz del domicilio (TODO confirmar)"],
    fuente: FUENTE_PENDIENTE,
  },
  {
    paso: 2,
    titulo: "Registro en línea o presencial",
    descripcion: "TODO_FERNANDA: portal exacto y pasos del trámite.",
    documentosRequeridos: [],
    fuente: FUENTE_PENDIENTE,
  },
  {
    paso: 3,
    titulo: "Biometría y activación",
    descripcion: "TODO_FERNANDA: confirmar si requiere visita presencial y plazos.",
    documentosRequeridos: [],
    fuente: FUENTE_PENDIENTE,
  },
];
