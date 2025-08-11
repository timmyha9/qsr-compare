// src/app/page.tsx
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

import { fetchQSRProperties } from "../lib/notion";
import PropertyCompare from "../components/PropertyCompare";

export default async function Page() {
  const properties = await fetchQSRProperties(process.env.NOTION_DATABASE_ID!);

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="mb-8 rounded-lg bg-black/90 px-6 py-4 text-center shadow-lg">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-sm">
          QSR Property Compare
        </h1>
      </div>
      <PropertyCompare initialProperties={properties} />
    </main>
  );
}
