import Sidebar from "@/components/Sidebar"

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-row ">
      <Sidebar />

      {children}
    </div>
  )
}
