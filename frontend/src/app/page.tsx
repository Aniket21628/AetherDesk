import Chatbot from '../components/Chatbot';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">AI Support Chatbot</h1>
      <Chatbot />
    </main>
  );
}
