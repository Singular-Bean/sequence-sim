import {useEffect, useState} from "react";
import {hf_service_url} from "./util.js";
import "./HuggingFaceLoader.css"

export const HuggingFaceLoader = ( {children} )=>{
    const [loading, setLoading]=useState(true);

    useEffect(() => {
        const cacheBustPath = `/${Math.random().toString(16).slice(2, 8)}`;
        const cacheBustUrl = new URL(cacheBustPath, hf_service_url).toString();
        fetch(cacheBustUrl).then(()=>{
            new Promise(resolve => setTimeout(resolve, 1000)).then(() => {
                setLoading(false)
            })
        });
    }, []);

    if ( loading ) {
        return <div className="loader">
            Connecting to Hugging Face...
            <br/>
            It may take a few seconds to start the Hugging Face instance, please wait.
        </div>
    }

    return children
}
