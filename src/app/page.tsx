import Chat from '@/components/Chat';

export default function Home() {
  return (
    <main className="h-screen bg-gray-50">
      <div className="h-full flex flex-col">
        <h1 className="text-3xl font-bold text-center py-4 text-gray-800 bg-gray-50">
          MCP Demo
        </h1>
        <div className="flex-1 min-h-0">
          <Chat />
        </div>
      </div>
    </main>
  );
}
