import Section from '../components/Section';

export default function TheorySection() {
    return (
        <>
            <Section title="Evolutionary Algorithm Variants" subtitle="Population-based stochastic search methods inspired by natural evolution">
                <div className="theory-grid">
                    <div className="theory-item">
                        <h4>Genetic Algorithms</h4>
                        <p>
                            Operate on fixed-length binary or real-valued chromosomes. Selection pressure
                            drives the population toward fitter solutions through crossover and mutation operators.
                            Fitness-proportionate or tournament selection chooses parents, while single-point or
                            uniform crossover recombines genetic material.
                        </p>
                    </div>
                    <div className="theory-item">
                        <h4>Evolution Strategies</h4>
                        <p>
                            Primarily designed for continuous parameter optimization. Use self-adaptive mutation
                            step sizes encoded directly in the individual. The (&#956;, &#955;) and (&#956; + &#955;)
                            selection schemes control elitism. Covariance Matrix Adaptation (CMA-ES) is the
                            state-of-the-art variant.
                        </p>
                    </div>
                    <div className="theory-item">
                        <h4>Evolutionary Programming</h4>
                        <p>
                            Emphasizes behavioral evolution over genotypic operators. Each individual is mutated
                            (no crossover) and selection is typically via stochastic tournament. Originally designed
                            for evolving finite state machines, now applied broadly to continuous optimization.
                        </p>
                    </div>
                    <div className="theory-item">
                        <h4>Genetic Programming</h4>
                        <p>
                            Evolves variable-length tree-structured programs. Individuals represent executable
                            expressions composed of function nodes and terminal leaves. Subtree crossover swaps
                            branches between parents; subtree mutation replaces a branch with a randomly generated one.
                        </p>
                    </div>
                </div>
            </Section>

            <Section title="Genetic Programming" subtitle="Tree-based symbolic regression through evolutionary operators">
                <div className="theory-item full-width" style={{ marginBottom: 24 }}>
                    <h4>Representation</h4>
                    <p>
                        Programs are encoded as syntax trees where internal nodes hold functions
                        (+, -, *, /, sin, cos) and leaf nodes hold terminals (variable x or random constants).
                        Tree depth controls expression complexity. Each individual is evaluated by computing
                        the output for every input sample and measuring error against the target.
                    </p>
                </div>

                <div className="theory-grid" style={{ marginBottom: 24 }}>
                    <div className="theory-item">
                        <h4>Function Set</h4>
                        <p>The set of allowed internal node operations. Must be closed under the input domain
                           to avoid runtime errors. Division is protected: a / b returns a when |b| &lt; 10⁻⁶.</p>
                        <div className="formula">
                            F = &#123; +, -, *, / &#125;<br/>
                            Optional: &#123; sin, cos &#125;
                        </div>
                    </div>
                    <div className="theory-item">
                        <h4>Terminal Set</h4>
                        <p>Leaf nodes that provide inputs to the tree. Consists of the independent variable
                           and ephemeral random constants drawn uniformly from [-5, 5].</p>
                        <div className="formula">
                            T = &#123; x, R &#125; where R ~ U[-5, 5]
                        </div>
                    </div>
                </div>

                <div className="theory-item full-width" style={{ marginBottom: 24 }}>
                    <h4>Fitness Evaluation</h4>
                    <p>Mean Squared Error between predicted and actual outputs over the training dataset:</p>
                    <div className="formula">
                        MSE = (1/n) * &#931; (y&#x0302;&#x1D62; - y&#x1D62;)&#xB2;
                    </div>
                </div>

                <div className="theory-item full-width" style={{ marginBottom: 24 }}>
                    <h4>Genetic Operators</h4>
                    <div className="algorithm">
                        <p><strong>Reproduction:</strong></p>
                        <p className="indent1">Copy selected individual unchanged to next generation</p>
                        <p style={{ marginTop: 12 }}><strong>Crossover (Subtree):</strong></p>
                        <p className="indent1">Select random subtree from parent A</p>
                        <p className="indent1">Select random subtree from parent B</p>
                        <p className="indent1">Replace subtree in A with subtree from B</p>
                        <p className="indent1">Enforce max depth constraint; reject if exceeded</p>
                        <p style={{ marginTop: 12 }}><strong>Mutation (Subtree):</strong></p>
                        <p className="indent1">Select random node in the tree</p>
                        <p className="indent1">Replace its subtree with a newly generated random subtree</p>
                        <p className="indent1">Enforce max depth constraint; reject if exceeded</p>
                    </div>
                </div>

                <div className="theory-item full-width">
                    <h4>GP Algorithm</h4>
                    <div className="algorithm">
                        <p><strong>procedure</strong> GeneticProgramming(popSize, maxGen, cxRate, mutRate):</p>
                        <p className="indent1">P &#8592; InitRandomPopulation(popSize, maxDepth)</p>
                        <p className="indent1"><strong>for</strong> gen = 0, 1, ..., maxGen - 1:</p>
                        <p className="indent2">Evaluate fitness of each individual in P</p>
                        <p className="indent2">Record best individual and fitness</p>
                        <p className="indent2">P' &#8592; &#123; best individual &#125;  (elitism)</p>
                        <p className="indent2"><strong>while</strong> |P'| &lt; popSize:</p>
                        <p className="indent3">r &#8592; random(0, 1)</p>
                        <p className="indent3"><strong>if</strong> r &lt; cxRate: subtree crossover on two tournament-selected parents</p>
                        <p className="indent3"><strong>else if</strong> r &lt; cxRate + mutRate: subtree mutation on tournament-selected individual</p>
                        <p className="indent3"><strong>else:</strong> reproduction of tournament-selected individual</p>
                        <p className="indent2">P &#8592; P'</p>
                        <p className="indent1"><strong>return</strong> best individual found across all generations</p>
                    </div>
                </div>
            </Section>

            <Section title="Differential Evolution" subtitle="Vector-based continuous optimization with mutation, recombination, and selection">
                <div className="theory-item full-width" style={{ marginBottom: 24 }}>
                    <h4>Step 1: Initialization</h4>
                    <p>Generate N random vectors within the parameter bounds:</p>
                    <div className="formula">
                        x&#x2C7C;&#x1D62; ~ U[x&#x2C7C;&#x1D38;&#x1D38;, x&#x2C7C;&#x1D41;&#x1D38;]  for j = 1, ..., D
                    </div>
                </div>

                <div className="theory-item full-width" style={{ marginBottom: 24 }}>
                    <h4>Step 2: Mutation</h4>
                    <p>For each target vector x&#x1D62;, generate a donor vector from three distinct random individuals:</p>
                    <div className="formula">
                        v&#x1D62; = x&#x1D63;&#x2081; + F &middot; (x&#x1D63;&#x2082; - x&#x1D63;&#x2083;)<br/><br/>
                        where F &#8712; [0, 2] is the mutation factor<br/>
                        r1, r2, r3 are distinct random indices &#8800; i
                    </div>
                </div>

                <div className="theory-item full-width" style={{ marginBottom: 24 }}>
                    <h4>Step 3: Recombination</h4>
                    <p>Binomial crossover between target and donor to produce trial vector:</p>
                    <div className="formula">
                        u&#x2C7C;&#x1D62; = v&#x2C7C;&#x1D62;  if rand&#x2C7C;&#x1D62; &#8804; CR or j = I_rand<br/>
                        u&#x2C7C;&#x1D62; = x&#x2C7C;&#x1D62;  otherwise<br/><br/>
                        CR &#8712; [0, 1] is crossover rate<br/>
                        I_rand ensures at least one component comes from donor
                    </div>
                </div>

                <div className="theory-item full-width" style={{ marginBottom: 24 }}>
                    <h4>Step 4: Selection</h4>
                    <p>Greedy selection keeps the better of target and trial:</p>
                    <div className="formula">
                        x&#x1D62;&#x209A;&#x207A;&#x00B9; = u&#x1D62; if f(u&#x1D62;) &#8804; f(x&#x1D62;)<br/>
                        x&#x1D62;&#x209A;&#x207A;&#x00B9; = x&#x1D62; otherwise
                    </div>
                </div>

                <div className="theory-item full-width">
                    <h4>DE Algorithm</h4>
                    <div className="algorithm">
                        <p><strong>procedure</strong> DifferentialEvolution(N, F, CR, maxIter, bounds):</p>
                        <p className="indent1">pop &#8592; InitRandom(N, bounds)</p>
                        <p className="indent1"><strong>for</strong> iter = 0, 1, ..., maxIter - 1:</p>
                        <p className="indent2"><strong>for</strong> i = 0, 1, ..., N - 1:</p>
                        <p className="indent3">Select r1, r2, r3 distinct, &#8800; i</p>
                        <p className="indent3">donor &#8592; pop[r1] + F * (pop[r2] - pop[r3])</p>
                        <p className="indent3">Clamp donor within bounds</p>
                        <p className="indent3">trial &#8592; BinomialCrossover(pop[i], donor, CR)</p>
                        <p className="indent3"><strong>if</strong> f(trial) &#8804; f(pop[i]): pop[i] &#8592; trial</p>
                        <p className="indent2">Record best fitness this iteration</p>
                        <p className="indent1"><strong>return</strong> best vector and value found</p>
                    </div>
                </div>
            </Section>

            <Section title="References" subtitle="Foundational texts and resources">
                <div className="theory-item full-width">
                    <ul>
                        <li>A.E. Eiben, J.E. Smith — Introduction to Evolutionary Computing, 2nd ed., Springer, 2015</li>
                        <li>W.B. Langdon, R. Poli, N.F. McPhee, J.R. Koza — Genetic Programming: An Introduction and Tutorial</li>
                        <li>Fleetwood — An Introduction to Differential Evolution (MASCOS, UQ)</li>
                        <li>J. Brownlee — Differential Evolution from Scratch in Python (Machine Learning Mastery)</li>
                    </ul>
                </div>
            </Section>
        </>
    );
}
