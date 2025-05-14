import { Suspense } from "react";
import { redirect } from "next/navigation";

import { Results, ResultsSkeleton } from "./_components/result";

interface SearchPageProps {
  searchParams: Promise<{ term?: string }>;  // ← Note Promise<…>
}


export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const { term } = await searchParams;       // ← Await it here

  if (!term) {
    redirect("/");
  }

  return (
    <div className="h-full p-8 max-w-screen-2xl mx-auto">
      <Suspense fallback={<ResultsSkeleton />}>
        <Results term={term} />
      </Suspense>
    </div>
  );
}
