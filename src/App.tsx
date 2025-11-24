import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import ScreeningFlow from './pages/ScreeningFlow';
import Results from './pages/Results';
import BehavioralDemo from './pages/BehavioralDemo';
import NotFound from './pages/NotFound';
import WebcamScreening from './pages/WebcamScreening';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/screening" element={<ScreeningFlow />} />
          <Route path="/results" element={<Results />} />
          <Route path="/demo" element={<BehavioralDemo />} />
          <Route path="/webcam" element={<WebcamScreening />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;