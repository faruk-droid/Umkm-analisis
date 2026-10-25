export async function readJsonResponse<T>(response: Response): Promise<T> {
  const body = await response.text();

  try {
    return JSON.parse(body) as T;
  } catch {
    const isHtml =
      response.headers.get("content-type")?.includes("text/html") ||
      /^\s*(?:<!doctype html|<html)\b/i.test(body);

    if (isHtml) {
      throw new Error(
        `Server mengembalikan halaman HTML (HTTP ${response.status}), bukan JSON. Pastikan aplikasi dan endpoint API berjalan pada deployment Next.js yang sama.`
      );
    }

    throw new Error(`Respon server tidak valid (HTTP ${response.status}).`);
  }
}
