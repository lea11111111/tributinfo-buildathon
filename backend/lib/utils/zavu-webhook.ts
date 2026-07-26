/**
 * Verificación de firmas de webhooks de Zavu.
 * Docs: https://docs.zavu.dev/guides/receiving-messages/security
 */
import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_AGE_SECONDS = 300;

export type ZavuInboundEvent = {
  id?: string;
  type?: string;
  timestamp?: number;
  senderId?: string;
  projectId?: string;
  data?: {
    messageId?: string;
    from?: string;
    to?: string;
    channel?: string;
    messageType?: string;
    text?: string;
    profileName?: string;
  };
};

export function verifyZavuSignature(
  signatureHeader: string | undefined,
  rawBody: string,
  secret: string,
): boolean {
  if (!signatureHeader || !secret) return false;

  const parts = signatureHeader.split(",");
  const timestampPart = parts.find((p) => p.startsWith("t="));
  const signaturePart = parts.find((p) => p.startsWith("v1="));
  if (!timestampPart || !signaturePart) return false;

  const timestamp = Number.parseInt(timestampPart.slice(2), 10);
  const signature = signaturePart.slice(3);
  if (!Number.isFinite(timestamp) || !signature) return false;

  const now = Math.floor(Date.now() / 1000);
  if (now - timestamp > MAX_AGE_SECONDS) return false;

  const signedPayload = `${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", secret).update(signedPayload).digest("hex");

  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
