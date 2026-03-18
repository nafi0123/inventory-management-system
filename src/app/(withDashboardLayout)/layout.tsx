import Sidebar from "../components/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#f3f4f6] overflow-hidden lg:p-4 gap-4">
      <Sidebar />

      <main className="flex-1 h-full pt-16 lg:pt-0 lg:m-0 m-3" >
        <div className="
          h-full 
          rounded-2xl lg:rounded-[2.5rem]
          bg-white 
          p-6 md:p-8 lg:p-10 
          shadow-sm border border-gray-100 
          overflow-y-auto
        ">
          {children}
        </div>
      </main>
    </div>
  );
}