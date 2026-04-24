const API = 'http://127.0.0.1:8000';

export async function runGP(params) {
    const res = await fetch(`${API}/run/gp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error(`GP request failed: ${res.status}`);
    return res.json();
}

export async function runDE(params) {
    const res = await fetch(`${API}/run/de`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error(`DE request failed: ${res.status}`);
    return res.json();
}

export async function runAll(gpParams, deParams) {
    const res = await fetch(`${API}/run/all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gp: gpParams, de: deParams })
    });
    if (!res.ok) throw new Error(`Combined request failed: ${res.status}`);
    return res.json();
}

export async function healthCheck() {
    try {
        const res = await fetch(`${API}/health`);
        return res.ok;
    } catch {
        return false;
    }
}
