

import { Suspense } from "react";
import { redirect } from "next/navigation";

import { Results, ResultsSkeleton } from "./_components/result";

interface SearchPageProps {
  
  searchParams: Promise<{ term?: string }>;
}

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  // await the Promise to get your term
  const { term } = await searchParams;                       

  if (!term) {
    // redirects must happen before any JSX is returned
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
