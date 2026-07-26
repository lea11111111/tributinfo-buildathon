/**
 * PLANILLA 4 — Checklist de inscripción al NIT (RNC).
 * Fuente: planillas/04-checklist-nit.csv
 * Corpus: corpus/parsed/10-rnc-inscripcion-nit.md
 *
 * Prioriza Persona Natural / RTS (caso demo). Requisitos de personas
 * jurídicas viven en el Anexo Técnico RNC (siatinfo).
 */
import type { PasoChecklist } from "../types/resultado";

const LINK_RND_RNC =
  "https://www.impuestos.gob.bo/wp-content/uploads/2025/10/RND-102500000017.pdf";
const LINK_RND_RNC_MOD =
  "https://www.impuestos.gob.bo/wp-content/uploads/2026/01/RND-102600000002-1.pdf";
const LINK_REQ_PERSONAS =
  "https://siatinfo.impuestos.gob.bo/index.php/requisitos-para-la-inscripcion/requisitos-para-obtener-el-nit-para-personas";
const LINK_FAQ_RNC =
  "https://sac.impuestos.gob.bo/formularios/pdf/PREGUNTAS%20PREGUNTAS%20RCN.pdf";
const LINK_FINALIZACION =
  "https://siatinfo.impuestos.gob.bo/index.php/requisitos-para-la-inscripcion/conceptos-generales/finalizacion";

export const CHECKLIST_NIT: PasoChecklist[] = [
  {
    paso: 1,
    titulo: "Confirmar obligación de inscripción",
    descripcion:
      "Toda persona natural, sucesión indivisa, empresa unipersonal o jurídica que realice hechos gravados debe inscribirse en el Registro Nacional de Contribuyentes (RNC). La inscripción es gratuita.",
    documentosRequeridos: [],
    fuente: {
      norma: "RND Nº 102500000017",
      articulo: "Art. 2",
      link: LINK_RND_RNC,
    },
  },
  {
    paso: 2,
    titulo: "Elegir modalidad de inscripción",
    descripcion:
      "Podés inscribirte (a) en línea por SIAT en Línea en www.impuestos.gob.bo, o (b) de forma presencial en plataformas del SIN.",
    documentosRequeridos: [],
    fuente: {
      norma: "RND Nº 102500000017",
      articulo: "Art. 4",
      link: LINK_RND_RNC,
    },
  },
  {
    paso: 3,
    titulo: "Reunir requisitos — Persona Natural",
    descripcion:
      "Necesitás Cédula de Identidad (o Cédula de Extranjería) e información del domicilio tributario, comercial y habitual. Ya no se exige factura de luz ni croquis según la FAQ oficial del RNC.",
    documentosRequeridos: [
      "Cédula de Identidad o Cédula de Extranjería",
      "Datos del domicilio tributario",
      "Datos del domicilio comercial",
      "Datos del domicilio habitual",
    ],
    fuente: {
      norma: "Anexo Técnico RNC (siatinfo)",
      articulo: "Requisitos para obtener el NIT para Personas",
      link: LINK_REQ_PERSONAS,
    },
  },
  {
    paso: 4,
    titulo: "Datos adicionales si vas al Simplificado (RTS)",
    descripcion:
      "Si tu actividad está bajo el D.S. N° 24484 y 3698 (Régimen Tributario Simplificado), declarás detalle del capital destinado a la actividad, precio unitario de mercaderías/servicios y estimación de ventas anuales. La inscripción RTS puede hacerse en línea.",
    documentosRequeridos: [
      "Detalle del capital destinado a la actividad",
      "Precio unitario de mercaderías/servicios",
      "Estimación de ventas anuales",
    ],
    fuente: {
      norma: "Anexo Técnico RNC (siatinfo)",
      articulo: "Requisitos Personas — actividades D.S. 24484 y 3698",
      link: LINK_REQ_PERSONAS,
    },
  },
  {
    paso: 5,
    titulo: "Presentar la solicitud y adjuntar PDFs",
    descripcion:
      "Completá el registro en SIAT en Línea o en una plataforma del SIN. Los documentos digitales van en PDF: máximo 15 MB por archivo, hasta 5 archivos.",
    documentosRequeridos: ["Documentos de respaldo en PDF (según actividad)"],
    fuente: {
      norma: "Preguntas frecuentes RNC (jun 2025)",
      articulo: "Tamaño máximo de archivos adjuntos",
      link: LINK_FAQ_RNC,
    },
  },
  {
    paso: 6,
    titulo: "Biometría y validación (modalidad en línea)",
    descripcion:
      "Si pediste inscripción en línea, debés apersonarte a una plataforma del SIN para el registro biométrico y la validación de la documentación original o legalizada; ahí se finaliza y se genera el NIT. En modalidad plataformas, el NIT se genera al finalizar el trámite presencial. La inspección in situ del Art. 7 quedó derogada.",
    documentosRequeridos: ["Documentos originales (y/o legalizados si corresponde)"],
    fuente: {
      norma: "RND Nº 102600000002",
      articulo: "Art. Único (modifica Art. 8); deroga Art. 7",
      link: LINK_RND_RNC_MOD,
    },
  },
  {
    paso: 7,
    titulo: "Recibir credenciales y Documento de Exhibición NIT",
    descripcion:
      "El SIN envía al correo registrado las credenciales de SIAT en Línea, el enlace de SIAT en tus manos y el Buzón Tributario. Desde el Buzón descargás el Documento de Exhibición NIT y el reporte informativo tributario (régimen, impuestos y facturación).",
    documentosRequeridos: ["Correo electrónico activo del titular"],
    fuente: {
      norma: "RND Nº 102500000017 / Anexo Técnico finalización",
      articulo: "Art. 8",
      link: LINK_FINALIZACION,
    },
  },
];
