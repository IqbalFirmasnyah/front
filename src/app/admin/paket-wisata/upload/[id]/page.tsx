import ImageUploadPageClient from "./ImageUploadPageClient";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;       
  const paketId = Number(id);

  if (!Number.isFinite(paketId)) {
    return <div className="p-8">ID paket tidak valid.</div>;
  }

  return <ImageUploadPageClient paketId={paketId} />;
}
