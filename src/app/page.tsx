import { fetchQSRProperties } from "../lib/notion";
import PropertyCompareWrapper from "../components/PropertyCompare";

export default async function Home() {
  const databaseId = process.env.NOTION_DATABASE_ID!;
  const properties = await fetchQSRProperties(databaseId);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-white px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="inline-block rounded-xl bg-white px-6 py-3 text-3xl font-bold text-gray-800 shadow dark:bg-gray-900 dark:text-white">
          QSR Property Compare
        </h1>
      </div>
      <PropertyCompareWrapper initialProperties={properties} />
    </main>
  );
}


