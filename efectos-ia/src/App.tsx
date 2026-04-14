import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell, Header } from '@/components/Layout';
import { AnalyzerPage }     from '@/features/analyzer/AnalyzerPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries:   { retry: 1, staleTime: 60_000 },
    mutations: { retry: 0 },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>
        <Header />
        <main>
          <AnalyzerPage />
        </main>
        <footer className="border-t border-[#141419] mt-16 py-6 text-center">
          <p className="text-xs font-mono" style={{ color: '#32323F' }}>
            EFECTOS-IA · Análisis DSP de Guitarra · v0.1.0
          </p>
        </footer>
      </AppShell>
    </QueryClientProvider>
  );
}

export default App;
