import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, ScatterChart, Scatter } from 'recharts';
import Section from '../components/Section';
import { runGP } from '../utils/api';

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="custom-tooltip">
            <p>x: <span className="tooltip-value">{label}</span></p>
            {payload.map((p, i) => (
                <p key={i}>{p.name}: <span className="tooltip-value">{typeof p.value === 'number' ? p.value.toFixed(4) : p.value}</span></p>
            ))}
        </div>
    );
}

export default function RegressionSection({ params, setParams, result, setResult }) {
    const [loading, setLoading] = useState(false);

    const update = (key, val) => setParams(prev => ({ ...prev, [key]: val }));

    const handleRun = async () => {
        setLoading(true);
        try {
            const data = await runGP(params);
            setResult(data);
        } catch (e) {
            console.error('GP run failed:', e);
        }
        setLoading(false);
    };

    return (
        <>
            <Section title="Dataset Generator" subtitle="Target function: y = x³ + 2x² + x">
                <div className="controls-row">
                    <div className="control-group">
                        <label>Sample Count: <strong>{params.sample_count}</strong></label>
                        <input type="range" min={20} max={200} step={10} value={params.sample_count}
                            onChange={e => update('sample_count', +e.target.value)} />
                        <div className="range-labels"><span>20</span><span>200</span></div>
                    </div>
                    <div className="control-group">
                        <label>Noise Level: <strong>{params.noise.toFixed(2)}</strong></label>
                        <input type="range" min={0} max={0.5} step={0.01} value={params.noise}
                            onChange={e => update('noise', +e.target.value)} />
                        <div className="range-labels"><span>0</span><span>0.5</span></div>
                    </div>
                </div>
                <div className="controls-row">
                    <div className="control-group">
                        <label>X Min: <strong>{params.x_min}</strong></label>
                        <input type="range" min={-10} max={0} step={1} value={params.x_min}
                            onChange={e => update('x_min', +e.target.value)} />
                        <div className="range-labels"><span>-10</span><span>0</span></div>
                    </div>
                    <div className="control-group">
                        <label>X Max: <strong>{params.x_max}</strong></label>
                        <input type="range" min={0} max={10} step={1} value={params.x_max}
                            onChange={e => update('x_max', +e.target.value)} />
                        <div className="range-labels"><span>0</span><span>10</span></div>
                    </div>
                </div>
                {result?.dataset && (
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={280}>
                            <ScatterChart>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="x" stroke="#64748b" tickMargin={10} type="number" />
                                <YAxis dataKey="y" stroke="#64748b" tickMargin={10} width={60} />
                                <Tooltip content={<CustomTooltip />} />
                                <Scatter data={result.dataset} fill="#ffffff" fillOpacity={0.6} r={3} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </Section>

            <Section title="GP Parameters" subtitle="Configure the evolutionary search">
                <div className="controls-row">
                    <div className="control-group">
                        <label>Population Size: <strong>{params.pop_size}</strong></label>
                        <input type="range" min={20} max={500} step={10} value={params.pop_size}
                            onChange={e => update('pop_size', +e.target.value)} />
                        <div className="range-labels"><span>20</span><span>500</span></div>
                    </div>
                    <div className="control-group">
                        <label>Generations: <strong>{params.generations}</strong></label>
                        <input type="range" min={10} max={200} step={5} value={params.generations}
                            onChange={e => update('generations', +e.target.value)} />
                        <div className="range-labels"><span>10</span><span>200</span></div>
                    </div>
                </div>
                <div className="controls-row">
                    <div className="control-group">
                        <label>Crossover Rate: <strong>{params.cx_rate.toFixed(2)}</strong></label>
                        <input type="range" min={0} max={1} step={0.05} value={params.cx_rate}
                            onChange={e => update('cx_rate', +e.target.value)} />
                        <div className="range-labels"><span>0</span><span>1.0</span></div>
                    </div>
                    <div className="control-group">
                        <label>Mutation Rate: <strong>{params.mut_rate.toFixed(2)}</strong></label>
                        <input type="range" min={0} max={0.5} step={0.05} value={params.mut_rate}
                            onChange={e => update('mut_rate', +e.target.value)} />
                        <div className="range-labels"><span>0</span><span>0.5</span></div>
                    </div>
                    <div className="control-group">
                        <label>Max Tree Depth: <strong>{params.max_depth}</strong></label>
                        <input type="range" min={2} max={8} step={1} value={params.max_depth}
                            onChange={e => update('max_depth', +e.target.value)} />
                        <div className="range-labels"><span>2</span><span>8</span></div>
                    </div>
                </div>

                <div className="toggle-row">
                    <label className="toggle-label">
                        <input type="checkbox" checked={params.use_sin} onChange={e => update('use_sin', e.target.checked)} />
                        <div className={`toggle-switch ${params.use_sin ? 'active' : ''}`}></div>
                        sin(x)
                    </label>
                    <label className="toggle-label">
                        <input type="checkbox" checked={params.use_cos} onChange={e => update('use_cos', e.target.checked)} />
                        <div className={`toggle-switch ${params.use_cos ? 'active' : ''}`}></div>
                        cos(x)
                    </label>
                </div>

                <button className="btn-primary" onClick={handleRun} disabled={loading}>
                    {loading ? <span className="spinner"></span> : null}
                    {loading ? 'Evolving...' : 'Run GP'}
                </button>
            </Section>

            {result && (
                <>
                    <Section title="Results" subtitle="Best evolved expression">
                        <div className="results-grid">
                            <div className="result-item">
                                <div className="result-label">Expression</div>
                                <div className="result-value">{result.expression}</div>
                            </div>
                            <div className="result-item">
                                <div className="result-label">Fitness (MSE)</div>
                                <div className="result-value">{result.fitness}</div>
                            </div>
                            <div className="result-item">
                                <div className="result-label">Generation Found</div>
                                <div className="result-value">{result.generation_found}</div>
                            </div>
                            <div className="result-item">
                                <div className="result-label">Time</div>
                                <div className="result-value">{result.time_ms} ms</div>
                            </div>
                        </div>
                    </Section>

                    <Section title="Regression Plot" subtitle="True function vs GP prediction (sorted by x)">
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={result.predictions}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="x" stroke="#64748b" tickMargin={10} type="number" />
                                    <YAxis stroke="#64748b" tickMargin={10} width={60} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line type="monotone" dataKey="y_true" name="True" stroke="#ffffff" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                                    <Line type="monotone" dataKey="y_pred" name="Predicted" stroke="#6b7280" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Section>

                    <Section title="Convergence" subtitle="Best fitness across generations">
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={result.convergence}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="generation" stroke="#64748b" tickMargin={10} />
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
                    Configure parameters above and click Run GP to begin evolution
                </div>
            )}
        </>
    );
}
