// import { StrictMode } from 'react';
// import { createRoot } from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom'; // add this import
// import './index.css';
// import App from './App.jsx';

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <BrowserRouter> {/* wrap App in BrowserRouter */}
//       <App />
//     </BrowserRouter>
//   </StrictMode>
// );

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux'; // Redux Provider
import store from './redux/store';      // Your Redux store
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}> {/* Wrap app in Redux Provider */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);

