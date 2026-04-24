import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, ScatterChart, Scatter, Cell } from 'recharts';
import Section from '../components/Section';
import { runDE } from '../utils/api';

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="custom-tooltip">
            {label !== undefined && <p>x: <span className="tooltip-value">{label}</span></p>}
            {payload.map((p, i) => (
                <p key={i}>{p.name}: <span className="tooltip-value">{typeof p.value === 'number' ? p.value.toFixed(6) : p.value}</span></p>
            ))}
        </div>
    );
}

export default function OptimizeSection({ params, setParams, result, setResult }) {
    const [loading, setLoading] = useState(false);

    const update = (key, val) => setParams(prev => ({ ...prev, [key]: val }));

    const handleRun = async () => {
        setLoading(true);
        try {
            const data = await runDE(params);
            setResult(data);
        } catch (e) {
            console.error('DE run failed:', e);
        }
        setLoading(false);
    };

    // prepare scatter data with best point flagged
    const scatterData = result?.population?.map(p => ({
        ...p,
        isBest: result.best_vector && Math.abs(p.x - result.best_vector[0]) < 0.01 && Math.abs(p.y - result.best_vector[1]) < 0.01
    })) || [];

    return (
        <>
            <Section title="Objective Function" subtitle="Minimize f(x, y) = x² + y²">
                <div className="formula">
                    f(x, y) = x² + y²<br/>
                    Global minimum at (0, 0) with f(0, 0) = 0
                </div>
            </Section>

            <Section title="DE Parameters" subtitle="Configure the differential evolution search">
                <div className="controls-row">
                    <div className="control-group">
                        <label>Population Size (N): <strong>{params.pop_size}</strong></label>
                        <input type="range" min={10} max={100} step={5} value={params.pop_size}
                            onChange={e => update('pop_size', +e.target.value)} />
                        <div className="range-labels"><span>10</span><span>100</span></div>
                    </div>
                    <div className="control-group">
                        <label>Mutation Factor (F): <strong>{params.mutation_factor.toFixed(2)}</strong></label>
                        <input type="range" min={0.1} max={2.0} step={0.05} value={params.mutation_factor}
                            onChange={e => update('mutation_factor', +e.target.value)} />
                        <div className="range-labels"><span>0.1</span><span>2.0</span></div>
                    </div>
                </div>
                <div className="controls-row">
                    <div className="control-group">
                        <label>Crossover Rate (CR): <strong>{params.crossover_rate.toFixed(2)}</strong></label>
                        <input type="range" min={0} max={1} step={0.05} value={params.crossover_rate}
                            onChange={e => update('crossover_rate', +e.target.value)} />
                        <div className="range-labels"><span>0</span><span>1.0</span></div>
                    </div>
                    <div className="control-group">
                        <label>Iterations: <strong>{params.iterations}</strong></label>
                        <input type="range" min={10} max={500} step={10} value={params.iterations}
                            onChange={e => update('iterations', +e.target.value)} />
                        <div className="range-labels"><span>10</span><span>500</span></div>
                    </div>
                </div>
                <div className="controls-row">
                    <div className="control-group">
                        <label>Bounds: <strong>[{params.bounds_min}, {params.bounds_max}]</strong></label>
                        <input type="range" min={-10} max={-1} step={1} value={params.bounds_min}
                            onChange={e => update('bounds_min', +e.target.value)} />
                        <div className="range-labels"><span>-10</span><span>-1</span></div>
                    </div>
                    <div className="control-group">
                        <label>&nbsp;</label>
                        <input type="range" min={1} max={10} step={1} value={params.bounds_max}
                            onChange={e => update('bounds_max', +e.target.value)} />
                        <div className="range-labels"><span>1</span><span>10</span></div>
                    </div>
                </div>

                <button className="btn-primary" onClick={handleRun} disabled={loading}>
                    {loading ? <span className="spinner"></span> : null}
                    {loading ? 'Optimizing...' : 'Run DE'}
                </button>
            </Section>

            {result && (
                <>
                    <Section title="Results" subtitle="Optimization outcome">
                        <div className="results-grid">
                            <div className="result-item">
                                <div className="result-label">Best (x, y)</div>
                                <div className="result-value">({result.best_vector[0]}, {result.best_vector[1]})</div>
                            </div>
                            <div className="result-item">
                                <div className="result-label">Minimum Value</div>
                                <div className="result-value">{result.best_value}</div>
                            </div>
                            <div className="result-item">
                                <div className="result-label">Iteration Found</div>
                                <div className="result-value">{result.iteration_found}</div>
                            </div>
                            <div className="result-item">
                                <div className="result-label">Time</div>
                                <div className="result-value">{result.time_ms} ms</div>
                            </div>
                        </div>
                    </Section>

                    <Section title="Final Population" subtitle="Scatter of individuals with best point highlighted">
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={350}>
                                <ScatterChart>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="x" stroke="#64748b" tickMargin={10} type="number" name="x" />
                                    <YAxis dataKey="y" stroke="#64748b" tickMargin={10} width={60} type="number" name="y" />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Scatter data={scatterData} name="Population">
                                        {scatterData.map((entry, idx) => (
                                            <Cell
                                                key={idx}
                                                fill={entry.isBest ? '#ffffff' : '#6b7280'}
                                                r={entry.isBest ? 8 : 4}
                                                stroke={entry.isBest ? '#ffffff' : 'none'}
                                                strokeWidth={entry.isBest ? 2 : 0}
                                            />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </Section>

                    <Section title="Convergence" subtitle="Best fitness per iteration">
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={result.convergence}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="iteration" stroke="#64748b" tickMargin={10} />
                                    <YAxis stroke="#64748b" tickMargin={10} width={80} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="fitness" name="Best Fitness" stroke="#ffffff" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Section>
                </>
            )}

            {!result && (
                <div className="empty-state">
                    Configure parameters above and click Run DE to begin optimization
                </div>
            )}
        </>
    );
}
