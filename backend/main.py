import time, math, random, copy
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Evolutionary Paradigm API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])

# ---------- GP Node ----------

class Node:
    def __init__(self, op=None, value=None, left=None, right=None):
        self.op = op
        self.value = value
        self.left = left
        self.right = right

    def is_terminal(self):
        return self.op is None

    def depth(self):
        if self.is_terminal():
            return 0
        ld = self.left.depth() if self.left else 0
        rd = self.right.depth() if self.right else 0
        return 1 + max(ld, rd)

    def copy(self):
        return copy.deepcopy(self)

BINARY_OPS = ['+', '-', '*', '/']
UNARY_OPS = ['sin', 'cos']
PRECEDENCE = {'+': 1, '-': 1, '*': 2, '/': 2, 'sin': 3, 'cos': 3}

def safe_div(a, b):
    return a / b if abs(b) > 1e-6 else a

def safe_eval_op(op, a, b=None):
    if op == '+': return a + b
    if op == '-': return a - b
    if op == '*': return a * b
    if op == '/': return safe_div(a, b)
    if op == 'sin': return math.sin(a)
    if op == 'cos': return math.cos(a)
    return 0.0

def evaluate(node, x):
    if node.is_terminal():
        return x if node.value == 'x' else node.value
    try:
        if node.op in UNARY_OPS:
            val = evaluate(node.left, x)
            return safe_eval_op(node.op, val)
        left_val = evaluate(node.left, x)
        right_val = evaluate(node.right, x)
        result = safe_eval_op(node.op, left_val, right_val)
        if math.isinf(result) or math.isnan(result):
            return 0.0
        return max(min(result, 1e12), -1e12)
    except:
        return 0.0

# clean expression formatting with minimal parentheses
def to_string(node):
    if node.is_terminal():
        if node.value == 'x':
            return 'x'
        v = node.value
        if isinstance(v, float):
            if v == int(v):
                return str(int(v))
            return f"{v:.2f}"
        return str(v)

    if node.op in UNARY_OPS:
        inner = to_string(node.left)
        return f"{node.op}({inner})"

    left_str = to_string(node.left)
    right_str = to_string(node.right)
    parent_prec = PRECEDENCE.get(node.op, 0)

    # wrap left child only if strictly lower precedence
    if node.left and not node.left.is_terminal() and node.left.op in PRECEDENCE:
        if PRECEDENCE[node.left.op] < parent_prec:
            left_str = f"({left_str})"

    # wrap right child if lower precedence, or same precedence for - and /
    if node.right and not node.right.is_terminal() and node.right.op in PRECEDENCE:
        child_prec = PRECEDENCE[node.right.op]
        if child_prec < parent_prec or (child_prec == parent_prec and node.op in ('-', '/')):
            right_str = f"({right_str})"

    return f"{left_str} {node.op} {right_str}"

def random_terminal(use_constants=True):
    if random.random() < 0.4 and use_constants:
        return Node(value=round(random.uniform(-5, 5), 1))
    return Node(value='x')

def random_tree(depth, max_depth, ops):
    if depth >= max_depth or (depth > 0 and random.random() < 0.3):
        return random_terminal()
    op = random.choice(ops)
    if op in UNARY_OPS:
        return Node(op=op, left=random_tree(depth + 1, max_depth, ops))
    return Node(op=op,
                left=random_tree(depth + 1, max_depth, ops),
                right=random_tree(depth + 1, max_depth, ops))

def get_all_nodes(node, nodes=None):
    if nodes is None:
        nodes = []
    nodes.append(node)
    if node.left:
        get_all_nodes(node.left, nodes)
    if node.right:
        get_all_nodes(node.right, nodes)
    return nodes

def random_subtree(node):
    nodes = get_all_nodes(node)
    return random.choice(nodes)

def count_nodes(node):
    if node is None:
        return 0
    return 1 + count_nodes(node.left) + count_nodes(node.right)

def replace_subtree(root, target, replacement):
    if root is target:
        return replacement
    new_node = Node(op=root.op, value=root.value)
    if root.left:
        new_node.left = replace_subtree(root.left, target, replacement)
    if root.right:
        new_node.right = replace_subtree(root.right, target, replacement)
    return new_node

def subtree_crossover(p1, p2, max_depth):
    c1 = p1.copy()
    c2 = p2.copy()
    point1 = random_subtree(c1)
    point2 = random_subtree(c2)
    child = replace_subtree(c1, point1, point2.copy())
    # enforce depth limit
    if child.depth() > max_depth:
        return p1.copy()
    return child

def subtree_mutation(node, max_depth, ops):
    mutant = node.copy()
    point = random_subtree(mutant)
    new_depth = max(1, max_depth - 2)
    new_sub = random_tree(0, new_depth, ops)
    result = replace_subtree(mutant, point, new_sub)
    if result.depth() > max_depth:
        return node.copy()
    return result

def fitness_mse(node, dataset):
    total = 0.0
    for x, y in dataset:
        pred = evaluate(node, x)
        total += (pred - y) ** 2
    return total / len(dataset)

def tournament_select(population, fitnesses, k=5):
    idxs = random.sample(range(len(population)), min(k, len(population)))
    best_idx = min(idxs, key=lambda i: fitnesses[i])
    return population[best_idx].copy()

def target_function(x):
    return x**3 + 2*x**2 + x

# ---------- GP Runner ----------

class GPRequest(BaseModel):
    pop_size: int = 100
    generations: int = 50
    cx_rate: float = 0.7
    mut_rate: float = 0.2
    max_depth: int = 5
    sample_count: int = 50
    noise: float = 0.0
    x_min: float = -10.0
    x_max: float = 10.0
    use_sin: bool = False
    use_cos: bool = False

@app.post("/run/gp")
def run_gp(req: GPRequest):
    start = time.time()

    # build function set
    ops = list(BINARY_OPS)
    if req.use_sin:
        ops.append('sin')
    if req.use_cos:
        ops.append('cos')

    # generate dataset
    step = (req.x_max - req.x_min) / max(req.sample_count - 1, 1)
    xs = [req.x_min + i * step for i in range(req.sample_count)]
    dataset = []
    for x in xs:
        y = target_function(x) + random.gauss(0, req.noise) * (abs(target_function(x)) + 1)
        dataset.append((x, y))

    # init population
    population = [random_tree(0, req.max_depth, ops) for _ in range(req.pop_size)]
    convergence = []
    best_overall = None
    best_fitness_overall = float('inf')
    best_gen = 0

    for gen in range(req.generations):
        fitnesses = [fitness_mse(ind, dataset) for ind in population]

        # track best
        gen_best_idx = min(range(len(fitnesses)), key=lambda i: fitnesses[i])
        gen_best_fit = fitnesses[gen_best_idx]

        if gen_best_fit < best_fitness_overall:
            best_fitness_overall = gen_best_fit
            best_overall = population[gen_best_idx].copy()
            best_gen = gen

        convergence.append({"generation": gen, "fitness": round(best_fitness_overall, 6)})

        # elitism: keep the best
        new_pop = [population[gen_best_idx].copy()]

        while len(new_pop) < req.pop_size:
            r = random.random()
            if r < req.cx_rate:
                p1 = tournament_select(population, fitnesses)
                p2 = tournament_select(population, fitnesses)
                child = subtree_crossover(p1, p2, req.max_depth)
            elif r < req.cx_rate + req.mut_rate:
                p = tournament_select(population, fitnesses)
                child = subtree_mutation(p, req.max_depth, ops)
            else:
                child = tournament_select(population, fitnesses)
            new_pop.append(child)

        population = new_pop

    # generate predictions on sorted x
    sorted_data = sorted(dataset, key=lambda p: p[0])
    predictions = []
    for x, y_true in sorted_data:
        y_pred = evaluate(best_overall, x)
        predictions.append({
            "x": round(x, 4),
            "y_true": round(y_true, 4),
            "y_pred": round(y_pred, 4)
        })

    # dataset for scatter plot
    scatter = [{"x": round(x, 4), "y": round(y, 4)} for x, y in dataset]

    elapsed = (time.time() - start) * 1000
    expr = to_string(best_overall) if best_overall else "N/A"

    return {
        "expression": expr,
        "fitness": round(best_fitness_overall, 6),
        "generation_found": best_gen,
        "convergence": convergence,
        "predictions": predictions,
        "dataset": scatter,
        "time_ms": round(elapsed, 1)
    }

# ---------- DE Runner ----------

def sphere(vec):
    return sum(v ** 2 for v in vec)

class DERequest(BaseModel):
    pop_size: int = 30
    mutation_factor: float = 0.8
    crossover_rate: float = 0.9
    iterations: int = 100
    bounds_min: float = -10.0
    bounds_max: float = 10.0

@app.post("/run/de")
def run_de(req: DERequest):
    start = time.time()
    D = 2  # x, y
    N = req.pop_size
    F = req.mutation_factor
    CR = req.crossover_rate
    lo, hi = req.bounds_min, req.bounds_max

    # initialize population
    pop = [[random.uniform(lo, hi) for _ in range(D)] for _ in range(N)]
    fit = [sphere(ind) for ind in pop]

    best_idx = min(range(N), key=lambda i: fit[i])
    best_val = fit[best_idx]
    best_vec = list(pop[best_idx])
    best_iter = 0
    convergence = []

    for it in range(req.iterations):
        for i in range(N):
            # pick 3 distinct random indices != i
            candidates = [j for j in range(N) if j != i]
            r1, r2, r3 = random.sample(candidates, 3)

            # mutation: donor vector
            donor = [pop[r1][d] + F * (pop[r2][d] - pop[r3][d]) for d in range(D)]
            # clamp donor to bounds
            donor = [max(lo, min(hi, v)) for v in donor]

            # recombination: trial vector
            I_rand = random.randint(0, D - 1)
            trial = []
            for j in range(D):
                if random.random() <= CR or j == I_rand:
                    trial.append(donor[j])
                else:
                    trial.append(pop[i][j])

            # selection: greedy
            trial_fit = sphere(trial)
            if trial_fit <= fit[i]:
                pop[i] = trial
                fit[i] = trial_fit

        # track best per iteration
        it_best_idx = min(range(N), key=lambda i: fit[i])
        if fit[it_best_idx] < best_val:
            best_val = fit[it_best_idx]
            best_vec = list(pop[it_best_idx])
            best_iter = it

        convergence.append({"iteration": it, "fitness": round(best_val, 8)})

    # final population for scatter plot
    population_scatter = [{"x": round(ind[0], 4), "y": round(ind[1], 4), "fitness": round(sphere(ind), 6)} for ind in pop]

    elapsed = (time.time() - start) * 1000

    return {
        "best_vector": [round(v, 6) for v in best_vec],
        "best_value": round(best_val, 8),
        "iteration_found": best_iter,
        "convergence": convergence,
        "population": population_scatter,
        "time_ms": round(elapsed, 1)
    }

# ---------- Combined ----------

class AllRequest(BaseModel):
    gp: GPRequest = GPRequest()
    de: DERequest = DERequest()

@app.post("/run/all")
def run_all(req: AllRequest):
    gp_res = run_gp(req.gp)
    de_res = run_de(req.de)
    return {"gp": gp_res, "de": de_res}

@app.get("/")
def root():
    return {"status": "API running"}

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
