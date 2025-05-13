import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Results, ResultsSkeleton } from "./_components/result";

interface PageProps {
  searchParams?: {
    term?: string;
  };
}

const SearchPage = ({ searchParams }: PageProps) => {
  if (!searchParams?.term) {
    redirect("/");
  }

  return (
    <div className="h-full p-8 max-w-screen-2xl mx-auto">
      <Suspense fallback={<ResultsSkeleton />}>
        <Results term={searchParams.term} />
      </Suspense>
    </div>
  );
};

export default SearchPage;
