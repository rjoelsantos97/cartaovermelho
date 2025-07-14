export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Artigos Hoje</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Scraping Status</h3>
          <p className="text-sm text-muted-foreground">Desativado</p>
        </div>
        <div className="bg-card p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Jobs Pendentes</h3>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  )
}