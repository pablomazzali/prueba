export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-[#38BDF8] via-[#818CF8] to-[#C084FC] bg-clip-text text-transparent tracking-wide">
          STUDEN
        </h1>
        <p className="text-xl text-gray-600">
          Your AI-Powered Study Platform
        </p>
        <p className="text-sm text-gray-500">
          Setting up... Please wait
        </p>
      </div>
    </main>
  );
}
