import {useEffect, useRef, useState} from 'react'
import './App.css'
import {hf_service_url} from "./util.js";

function PredictedPathSegments({predictedPath}) {
    const segments = predictedPath.slice(1).map((point, i) => {
        const {x, y, type} = point
        const previousValue = predictedPath[i];
        return {
            start: previousValue,
            end: {x, y},
            type
        }
    })

    const passSegments = segments.filter(s => s.type === 'pass');
    const totalPasses = passSegments.length;

    let passCounter = 0;

    const getColor = (type) => {
        switch (type) {
            case 'pass': {
                const index = passCounter++;
                if (totalPasses <= 1) return 'rgb(255, 255, 255)';
                // Linear interpolation from white (255) to black (0)
                const value = Math.round(255 * (1 - index / (totalPasses - 1)));
                return `rgb(${value}, ${value}, ${value})`;
            }
            case 'dribble': return 'blue';
            case 'shot': return 'red';
            default: return 'white'; 
        }
    }

    return segments.map(({start, end, type}, i) => {
        const color = getColor(type);
        const isArrow = type === 'pass' || type === 'dribble';

        if (isArrow) {
            // Calculate arrow head
            const angle = Math.atan2(end.y - start.y, end.x - start.x);
            const headLength = 1.5;
            const headAngle = Math.PI / 6; // 30 degrees

            const x1 = end.x - headLength * Math.cos(angle - headAngle);
            const y1 = end.y - headLength * Math.sin(angle - headAngle);
            const x2 = end.x - headLength * Math.cos(angle + headAngle);
            const y2 = end.y - headLength * Math.sin(angle + headAngle);

            return (
                <g key={i}>
                    <line x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={color} strokeWidth={0.5}/>
                    <path d={`M ${x1} ${y1} L ${end.x} ${end.y} L ${x2} ${y2}`} fill="none" stroke={color} strokeWidth={0.5}/>
                </g>
            )
        }

        return (
            <line key={i} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke={color} strokeWidth={0.5}/>
        )
    })
}

export function App() {
    const [startPoint, setStartPoint] = useState(null)
    const [currentPoint, setCurrentPoint] = useState(null)
    const [predictedPath, setPredictedPath] = useState([])
    const [busy, setBusy] = useState(false)
    const svgRef = useRef(null)

    const createLine = (start, end) => {
        console.log('Line created:', {start, end})
        setBusy(true)
        fetch(hf_service_url,
            {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({start, end})
            })
            .then(response => response.json())
            .then(result => {
                setPredictedPath([{...startPoint, type: 'pass'}, {...currentPoint, type: 'pass'}, ...result]);
            })
            .finally(() => setBusy(false))
    }

    const getMousePosition = (event) => {
        const svg = svgRef.current
        const point = svg.createSVGPoint()
        point.x = event.clientX
        point.y = event.clientY
        const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse())
        return {x: svgPoint.x, y: svgPoint.y}
    }

    const handleClick = (event) => {
        const point = getMousePosition(event)
        if (!startPoint) {
            setStartPoint(point)
            setCurrentPoint(point)
        } else {
            createLine(startPoint, point)
            setStartPoint(null)
            setCurrentPoint(null)
        }
    }

    const handleMouseMove = (event) => {
        if (startPoint) {
            const point = getMousePosition(event)
            setCurrentPoint(point)
        }
    }

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && startPoint) {
                setStartPoint(null)
                setCurrentPoint(null)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [startPoint])

    return (
        <div className="app">
            {busy ? <p>Simulating passes...</p> : <p>Click two points to define an initial pass anywhere on the pitch. A sequence of passes and final shot will be simulated and displayed</p>}
            <svg
                ref={svgRef}
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                viewBox="0 0 111 74"
                onClick={handleClick}
                onMouseMove={handleMouseMove}
            >
                <rect width="111" height="74" fill="#00a000"/>
                <g fill="none" stroke="#fff" strokeWidth="0.5" transform="translate(3 3)">
                    {/* border */}
                    <path d="M 0 0 h 105 v 68 h -105 Z"/>
                    {/* center line */}
                    <path d="M 52.5 0 v 68"/>
                    {/* center circle */}
                    <circle r="9.15" cx="52.5" cy="34"/>
                    {/* center mark */}
                    <circle r="0.75" cx="52.5" cy="34" fill="#fff" stroke="none"/>
                    {/* penalty area */}
                    <g>
                        {/* penalty area line */}
                        <path d="M 105 13.84 h -16.5 v 40.32 h 16.5"/>
                        {/* goal area line */}
                        <path d="M 105 24.84 h -5.5 v 18.32 h 5.5"/>
                        {/* penalty mark */}
                        <circle r="0.75" cx="94.06" cy="34" fill="#fff" stroke="none"/>
                        {/* penalty arc */}
                        <path d="M 88.5 26.733027 a 9.15 9.15 0 0 0 0 14.533946"/>
                    </g>
                    <path
                        id="Corner arcs"
                        d="M 2 0 a 2 2 0 0 1 -2 2M 0 66 a 2 2 0 0 1 2 2M 103 68 a 2 2 0 0 1 2 -2M 105 2 a 2 2 0 0 1 -2 -2"
                    />
                </g>
                {startPoint && currentPoint && (
                    <g>
                        <line
                            x1={startPoint.x}
                            y1={startPoint.y}
                            x2={currentPoint.x}
                            y2={currentPoint.y}
                            stroke="#ccc"
                            strokeWidth="0.5"
                        />
                        <circle cx={startPoint.x} cy={startPoint.y} r="1" fill="#00ff00"/>
                        <circle cx={currentPoint.x} cy={currentPoint.y} r="1" fill="#ff0000"/>
                    </g>
                )}
                <PredictedPathSegments predictedPath={predictedPath}/>
            </svg>
        </div>
    )
}
