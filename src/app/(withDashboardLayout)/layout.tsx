import Sidebar from "../components/Sidebar";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 bg-white">
        {children}
      </main>
    </div>
  );
}