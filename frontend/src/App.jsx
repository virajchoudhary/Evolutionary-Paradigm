import { useState } from 'react';
import './App.css';
import Footer from './components/Footer';
import TheorySection from './sections/TheorySection';
import RegressionSection from './sections/RegressionSection';
import OptimizeSection from './sections/OptimizeSection';
import CompareSection from './sections/CompareSection';

const DEFAULT_GP = {
    pop_size: 150,
    generations: 60,
    cx_rate: 0.7,
    mut_rate: 0.2,
    max_depth: 5,
    sample_count: 80,
    noise: 0.05,
    x_min: -5,
    x_max: 5,
    use_sin: false,
    use_cos: false
};

const DEFAULT_DE = {
    pop_size: 40,
    mutation_factor: 0.8,
    crossover_rate: 0.9,
    iterations: 100,
    bounds_min: -10,
    bounds_max: 10
};

export default function App() {
    const [activeTab, setActiveTab] = useState('theory');
    const [gpParams, setGpParams] = useState(DEFAULT_GP);
    const [deParams, setDeParams] = useState(DEFAULT_DE);
    const [gpResult, setGpResult] = useState(null);
    const [deResult, setDeResult] = useState(null);

    const tabs = [
        {
            id: 'theory',
            label: 'Theory',
            component: <TheorySection />
        },
        {
            id: 'regression',
            label: 'Regression',
            component: (
                <RegressionSection
                    params={gpParams}
                    setParams={setGpParams}
                    result={gpResult}
                    setResult={setGpResult}
                />
            )
        },
        {
            id: 'optimize',
            label: 'Optimize',
            component: (
                <OptimizeSection
                    params={deParams}
                    setParams={setDeParams}
                    result={deResult}
                    setResult={setDeResult}
                />
            )
        },
        {
            id: 'compare',
            label: 'Compare',
            component: (
                <CompareSection
                    gpParams={gpParams}
                    deParams={deParams}
                    gpResult={gpResult}
                    deResult={deResult}
                    setGpResult={setGpResult}
                    setDeResult={setDeResult}
                />
            )
        }
    ];

    return (
        <div className="app-layout">
            <nav className="sidebar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`sidebar-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
            <main className="main-content">
                <header className="app-header">
                    <h1>Evolutionary Paradigm</h1>
                    <p>Genetic Programming and Differential Evolution Lab</p>
                </header>
                <div className="page-content">
                    {tabs.find(t => t.id === activeTab).component}
                </div>
                <Footer />
            </main>
        </div>
    );
}
