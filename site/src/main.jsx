import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {App} from './App.jsx'
import {HuggingFaceLoader} from "./HuggingFaceLoader.jsx";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <HuggingFaceLoader>
            <App/>
        </HuggingFaceLoader>
    </StrictMode>,
)
