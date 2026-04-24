import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import Section from '../components/Section';
import { runAll } from '../utils/api';

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="custom-tooltip">
            <p>Step: <span className="tooltip-value">{label}</span></p>
            {payload.map((p, i) => (
                <p key={i}>{p.name}: <span className="tooltip-value">{typeof p.value === 'number' ? p.value.toFixed(6) : p.value}</span></p>
            ))}
        </div>
    );
}

export default function CompareSection({ gpParams, deParams, gpResult, deResult, setGpResult, setDeResult }) {
    const [loading, setLoading] = useState(false);

    const handleRunBoth = async () => {
        setLoading(true);
        try {
            const data = await runAll(gpParams, deParams);
            setGpResult(data.gp);
            setDeResult(data.de);
        } catch (e) {
            console.error('Combined run failed:', e);
        }
        setLoading(false);
    };

    const hasResults = gpResult && deResult;

    // merge convergence data for overlaid chart
    const mergedConvergence = [];
    if (hasResults) {
        const maxLen = Math.max(gpResult.convergence.length, deResult.convergence.length);
        for (let i = 0; i < maxLen; i++) {
            mergedConvergence.push({
                step: i,
                gp: gpResult.convergence[i]?.fitness ?? null,
                de: deResult.convergence[i]?.fitness ?? null
            });
        }
    }

    // determine winner by fitness (lower is better)
    const gpWins = hasResults && gpResult.fitness <= deResult.best_value;

    return (
        <>
            <Section title="Run Both Algorithms" subtitle="Execute GP and DE with current parameters">
                <button className="btn-primary" onClick={handleRunBoth} disabled={loading}>
                    {loading ? <span className="spinner"></span> : null}
                    {loading ? 'Running Both...' : 'Run Both'}
                </button>
            </Section>

            {hasResults && (
                <>
                    <Section title="Results Comparison" subtitle="Side-by-side performance metrics">
                        <div className="compare-grid">
                            <div className={`compare-column ${gpWins ? 'winner' : ''}`}>
                                <h3>Genetic Programming {gpWins ? '(Winner)' : ''}</h3>
                                <div className="compare-stat">
                                    <span className="stat-label">Best Fitness</span>
                                    <span className="stat-value">{gpResult.fitness}</span>
                                </div>
                                <div className="compare-stat">
                                    <span className="stat-label">Generations</span>
                                    <span className="stat-value">{gpResult.convergence.length}</span>
                                </div>
                                <div className="compare-stat">
                                    <span className="stat-label">Found At</span>
                                    <span className="stat-value">Gen {gpResult.generation_found}</span>
                                </div>
                                <div className="compare-stat">
                                    <span className="stat-label">Time</span>
                                    <span className="stat-value">{gpResult.time_ms} ms</span>
                                </div>
                                <div className="compare-stat">
                                    <span className="stat-label">Expression</span>
                                    <span className="stat-value" style={{ fontSize: '0.85rem' }}>{gpResult.expression}</span>
                                </div>
                            </div>
                            <div className={`compare-column ${!gpWins ? 'winner' : ''}`}>
                                <h3>Differential Evolution {!gpWins ? '(Winner)' : ''}</h3>
                                <div className="compare-stat">
                                    <span className="stat-label">Best Fitness</span>
                                    <span className="stat-value">{deResult.best_value}</span>
                                </div>
                                <div className="compare-stat">
                                    <span className="stat-label">Iterations</span>
                                    <span className="stat-value">{deResult.convergence.length}</span>
                                </div>
                                <div className="compare-stat">
                                    <span className="stat-label">Found At</span>
                                    <span className="stat-value">Iter {deResult.iteration_found}</span>
                                </div>
                                <div className="compare-stat">
                                    <span className="stat-label">Time</span>
                                    <span className="stat-value">{deResult.time_ms} ms</span>
                                </div>
                                <div className="compare-stat">
                                    <span className="stat-label">Best Vector</span>
                                    <span className="stat-value">({deResult.best_vector[0]}, {deResult.best_vector[1]})</span>
                                </div>
                            </div>
                        </div>
                    </Section>

                    <Section title="Convergence Comparison" subtitle="GP vs DE fitness over steps">
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={350}>
                                <LineChart data={mergedConvergence}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="step" stroke="#64748b" tickMargin={10} />
                                    <YAxis stroke="#64748b" tickMargin={10} width={80} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line type="monotone" dataKey="gp" name="GP" stroke="#ffffff" strokeWidth={2.5} dot={false} isAnimationActive={false} connectNulls />
                                    <Line type="monotone" dataKey="de" name="DE" stroke="#6b7280" strokeWidth={2.5} dot={false} isAnimationActive={false} connectNulls />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Section>

                    <Section title="Algorithm Comparison" subtitle="Structural differences between GP and DE">
                        <table className="theory-table">
                            <thead>
                                <tr>
                                    <th>Metric</th>
                                    <th>Genetic Programming</th>
                                    <th>Differential Evolution</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Type</td>
                                    <td>Symbolic Regression</td>
                                    <td>Numerical Optimization</td>
                                </tr>
                                <tr>
                                    <td>Representation</td>
                                    <td>Variable-length syntax trees</td>
                                    <td>Fixed-length real-valued vectors</td>
                                </tr>
                                <tr>
                                    <td>Output</td>
                                    <td>Mathematical expression</td>
                                    <td>Optimal parameter vector</td>
                                </tr>
                                <tr>
                                    <td>Search Space</td>
                                    <td>Combinatorial (tree structures)</td>
                                    <td>Continuous (bounded reals)</td>
                                </tr>
                                <tr>
                                    <td>Mutation</td>
                                    <td>Subtree replacement</td>
                                    <td>Differential: v = x_r1 + F(x_r2 - x_r3)</td>
                                </tr>
                                <tr>
                                    <td>Crossover</td>
                                    <td>Subtree swap between parents</td>
                                    <td>Binomial recombination (CR)</td>
                                </tr>
                                <tr>
                                    <td>Selection</td>
                                    <td>Tournament selection</td>
                                    <td>Greedy (pairwise comparison)</td>
                                </tr>
                                <tr>
                                    <td>Strength</td>
                                    <td>Discovers interpretable models</td>
                                    <td>Fast convergence, few parameters</td>
                                </tr>
                                <tr>
                                    <td>Weakness</td>
                                    <td>Bloat, high computational cost</td>
                                    <td>Limited to fixed-dimension problems</td>
                                </tr>
                                <tr>
                                    <td>Best For</td>
                                    <td>Model discovery, symbolic AI</td>
                                    <td>Parameter tuning, function minimization</td>
                                </tr>
                            </tbody>
                        </table>
                    </Section>
                </>
            )}

            {!hasResults && (
                <div className="empty-state">
                    Click Run Both to execute GP and DE with current parameters, then compare results
                </div>
            )}
        </>
    );
}
