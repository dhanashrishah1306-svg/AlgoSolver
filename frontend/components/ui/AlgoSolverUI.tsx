"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

/* ---------------- Language Selector ---------------- */
function LanguageSelector({
    language,
    setLanguage,
}: {
    language: string;
    setLanguage: (lang: string) => void;
}) {
    return (
        <Card className="p-0 w-full">
            <CardContent className="flex items-center gap-3 p-4 h-24"> {/* taller padding and height */}
                <label className="text-sm font-medium text-purple-800">Language:</label>
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="flex-1 h-full px-3 border border-purple-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                    <option value="Python">Python</option>
                    <option value="C++">C++</option>
                    <option value="Java">Java</option>
                    <option value="JavaScript">JavaScript</option>
                </select>
            </CardContent>
        </Card>

    );
}

/* ---------------- Main UI ---------------- */
export default function AlgoSolverUI() {
    const [activeMenu, setActiveMenu] = useState("Home");
    const solverRef = useRef<HTMLDivElement | null>(null);
    const [problem, setProblem] = useState("");
    const [language, setLanguage] = useState("Python");
    const [solutions, setSolutions] = useState<any[]>([]);
    const [selected, setSelected] = useState<number | null>(null);
    const [hoverLine, setHoverLine] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    const introCards = [
        {
            title: "Ask Any DSA Problem",
            description: "Describe your problem in natural language.",
            image: "/images/slider1.jpg",
        },
        {
            title: "Multiple Approaches",
            description: "From brute force to optimal thinking.",
            image: "/images/solution.webp",
        },
        {
            title: "Deep Understanding",
            description: "Hover, listen, and truly learn.",
            image: "/images/final.webp",
        },
    ];

    /* ---------------- API Call ---------------- */
    const handleSolve = async () => {
        if (!problem.trim() || loading) return;

        setLoading(true);
        setSolutions([]);
        setSelected(null);
        setHoverLine(null);

        try {
            const res = await fetch("/api/solve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ problem, language }),
            });

            const data = await res.json();
            if (Array.isArray(data.solutions)) setSolutions(data.solutions);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const playAudio = (text: string) => {
        speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    };

    return (
        <div className="min-h-screen bg-[#f3e8ff] text-[#3b0764]">
            {/* ---------------- Navbar ---------------- */}
            <nav className="flex items-center justify-between px-10 py-6 bg-[#e9d5ff] shadow-md sticky top-0 z-30">
                <h1 className="text-2xl font-extrabold tracking-wide">AlgoSolver</h1>

                <div className="flex gap-8 text-lg">
                    {["Home", "Solutions"].map((menu) => (
                        <button
                            key={menu}
                            onClick={() => {
                                setActiveMenu(menu);
                                if (menu === "Solutions" && solverRef.current)
                                    solverRef.current.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="relative group transition-colors duration-300"
                        >
                            <span
                                className={`${activeMenu === menu
                                    ? "text-purple-900 font-semibold"
                                    : "text-purple-700"
                                    }`}
                            >
                                {menu}
                            </span>
                            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-purple-700 transition-all duration-300 group-hover:w-full" />
                        </button>
                    ))}
                </div>

                <Button className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white transition-shadow hover:shadow-lg">
                    Get Started
                </Button>
            </nav>

            {/* ---------------- Slider / Intro ---------------- */}
            <section className="px-10 py-16">
                <div className="max-w-5xl mx-auto text-center mb-14">
                    <h2 className="text-4xl font-extrabold mb-3">Learn DSA by Understanding</h2>
                    <p className="text-lg text-purple-700">
                        Go beyond memorizing solutions. AlgoSolver guides you through the complete thinking process, from the first intuitive idea to optimized, interview-ready solutions, helping you understand why each approach works.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
                    {introCards.map((card, idx) => (
                        <Card
                            key={idx}
                            className="overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-xl p-0"
                        >
                            <Image
                                src={card.image}
                                alt={card.title}
                                width={400}
                                height={200}
                                className="w-full h-52 object-cover"
                            />
                            <CardContent className="p-6">
                                <h3 className="text-xl font-semibold">{card.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{card.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
            {/* ---------------- Input ---------------- */}
            <div ref={solverRef} className="sticky top-[88px] bg-[#f3e8ff] px-10 py-4 z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    {/* Query Input */}
                    <Card className="md:col-span-2">
                        <CardContent className="flex gap-0 items-center">
                            <input
                                className="flex-1 h-12 px-3 border border-r-0 rounded-l-lg focus:ring-2 focus:ring-purple-400 text-sm"
                                placeholder="Ask a DSA problem..."
                                value={problem}
                                onChange={(e) => setProblem(e.target.value)}
                            />

                            <Button
                                onClick={handleSolve}
                                disabled={loading}
                                className="h-12 px-6 rounded-r-lg bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white hover:shadow-lg"
                            >
                                {loading ? "Solving..." : "Solve"}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Language Selector */}
                    <LanguageSelector language={language} setLanguage={setLanguage} />
                </div>
            </div>


            {/* ---------------- Loader ---------------- */}
            {loading && (
                <div className="flex flex-col items-center py-12">
                    <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full" />
                    <p className="mt-4 font-semibold">Thinking in {language}...</p>
                </div>
            )}

            {/* ---------------- Solutions ---------------- */}
            {solutions.length > 0 && (
                <div className="px-10 py-6 flex gap-4 overflow-x-auto">
                    {solutions.map((s, i) => (
                        <Card
                            key={i}
                            onClick={() => setSelected(i)}
                            className={`min-w-[320px] cursor-pointer transition-all duration-300 ${selected === i
                                ? "border-2 border-purple-500 bg-purple-50 shadow-lg scale-[1.02]"
                                : "bg-white hover:shadow-xl hover:-translate-y-1"
                                }`}
                        >
                            <CardContent className="p-4 space-y-3">
                                <h3 className="text-lg font-bold text-purple-800">{s.title}</h3>
                                <pre className="text-xs bg-gray-50 p-2 rounded line-clamp-5">{s.snippet}</pre>
                                <Button className="bg-purple-700 text-white w-full">Select</Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
            {/* ---------------- Selected Solution ---------------- */}
            {selected !== null && (
                <div className="px-10 py-6 flex flex-col md:flex-row gap-6 animate-fadeIn">
                    {/* Code Snippet */}
                    <Card className="flex-1 p-4 overflow-auto">
                        <SyntaxHighlighter
                            language={language}
                            style={vscDarkPlus}
                            showLineNumbers
                            wrapLines
                            lineProps={(lineNumber) => ({
                                onMouseEnter: () => setHoverLine(lineNumber),
                                onMouseLeave: () => setHoverLine(null),
                                className: "",
                            })}
                        >
                            {solutions[selected].snippet}
                        </SyntaxHighlighter>
                    </Card>

                    {/* Theory & Hover Explanation */}
                    <Card className="flex-1 p-4 flex flex-col space-y-4">
                        {/* Theory Section */}
                        <div>
                            <h2 className="font-semibold mb-1">Theory</h2>
                            <p className="whitespace-pre-line text-sm">{solutions[selected].theory}</p>
                        </div>

                        {/* Play Audio Button */}
                        {solutions[selected].audioText && (
                            <Button
                                className="bg-gradient-to-r from-purple-600 to-purple-800 text-white w-full hover:shadow-lg"
                                onClick={() => playAudio(solutions[selected].audioText)}
                            >
                                🔊 Play Explanation
                            </Button>
                        )}

                        {/* Hover Line Explanation */}
                        {hoverLine !== null &&
                            solutions[selected].lineExplanations?.[hoverLine] && (
                                <div className="p-3 bg-purple-50 border-l-4 border-purple-600 rounded">
                                    <p className="whitespace-pre-line text-sm font-medium text-purple-800">
                                        {solutions[selected].lineExplanations[hoverLine]}
                                    </p>
                                </div>
                            )}
                    </Card>
                </div>
            )}
        </div>
    );
}
