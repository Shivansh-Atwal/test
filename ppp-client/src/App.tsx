import Routes from "./routes";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./theme/theme-provider";
import { FullscreenProvider } from './contexts/FullScreenContext';

function App() {
  const router = createBrowserRouter(Routes);

  return (
    <FullscreenProvider>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
    </FullscreenProvider>
  );
}

export default App;
