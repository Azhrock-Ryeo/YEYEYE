"use client";

import { useEffect, useState } from "react";
import { loadWasmModule } from "#utils/stdwasm";

type wasm_add = (a: number, b: number) => number;

export default function Home() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [add, setAdd] = useState<wasm_add | null>(null);

    useEffect(() => {
        async function init() {
            try {
                const math = await loadWasmModule("example");
                const add = math.add as wasm_add;
                setAdd(() =>add);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Unknown error");
            } finally {
                setLoading(false);
            }
        }
        init();
    }, []);

    return (
        <main className="flex min-h-screen items-center justify-center">
            <div className="rounded-lg border p-6 shadow">
                <h1 className="mb-4 text-2xl font-bold">
                    Next.js + WASM
                </h1>

                {loading && <p>Loading...</p>}

                {error && (
                    <p className="text-red-500">
                        Error: {error}
                    </p>
                )}

                {!loading && !error && (
                    <p>10 + 5 = <strong>{add?.(10, 5) ?? 0}</strong></p>
                )}
            </div>
        </main>
    );
}