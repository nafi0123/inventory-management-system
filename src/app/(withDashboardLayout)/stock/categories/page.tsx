import { Suspense } from "react";
import CategoryClient from "./_components/CategoryClient";
import Loading from "./loading"; // আপনার তৈরি করা স্কেলিটন ফাইলটি ইমপোর্ট করুন

export default function Page() {
  return (
    // Suspense নিশ্চিত করবে যে যতক্ষণ CategoryClient তৈরি না হচ্ছে, ততক্ষণ Loading দেখাবে
    <Suspense fallback={<Loading />}>
      <CategoryClient />
    </Suspense>
  );
}