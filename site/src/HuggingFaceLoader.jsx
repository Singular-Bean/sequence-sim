import {useEffect, useState} from "react";
import {hf_service_url} from "./util.js";
import "./HuggingFaceLoader.css"

export const HuggingFaceLoader = ( {children} )=>{
    const [loading, setLoading]=useState(true);

    useEffect(() => {
        fetch(hf_service_url).then(()=>{
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