import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// import { Provider } from 'react-redux'; // Redux Provider
// import store from './redux/store';      // Your Redux store
import './index.css';
import App from './App.jsx';
import { installImageFallback } from './utils/imageFallback';

// Swap any broken image for an inline placeholder (see utils/imageFallback.js).
installImageFallback();

createRoot(document.getElementById('root')).render(
  <StrictMode>
     {/*<Provider store={store}> Wrap app in Redux Provider */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    {/* </Provider> */}
  </StrictMode>
);

