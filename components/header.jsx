export default function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              DrawAI
            </h1>
            <p className="text-muted-foreground mt-1">Draw anything, get instant AI insights</p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Powered by Gemini AI</p>
          </div>
        </div>
      </div>
    </header>
  )
}
