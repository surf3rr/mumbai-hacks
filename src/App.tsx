import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Calibration from './pages/Calibration';
import TaskA from './pages/TaskA';
import TaskB from './pages/TaskB';
import TaskC from './pages/TaskC';
import Results from './pages/Results';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/calibration" element={<Calibration />} />
          <Route path="/task-a" element={<TaskA />} />
          <Route path="/task-b" element={<TaskB />} />
          <Route path="/task-c" element={<TaskC />} />
          <Route path="/results" element={<Results />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;