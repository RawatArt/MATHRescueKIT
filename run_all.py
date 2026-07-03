import subprocess
import sys
import os

mappings = {
    "calculus": "content/CalculusRescueKit/*.html",
    "set": "content/SetTheoryRescueKit/*.html",
    "logic": "content/TheLogicRescueKit/*.html",
    "real": "content/RealNumberPolynomialRescueKit/*.html",
    "func": "content/TheFunctionRescueKit/*.html",
    "explog": "content/TheExpoLogRescueKit/*.html",
    "trig": "content/TrigonometryRescueKit/*.html",
    "analytic": "content/AnalyticGeometryConicsRescueKit/*.html",
    "matrix": "content/TheMatrixRescueKit/*.html",
    "vector": "content/TheVectorRescueKit/*.html",
    "complex": "content/ComplexNumberRescueKit/*.html",
    "seq": "content/SequenceSeriesRescueKit/*.html",
    "count": "content/CountingProbabilityRescueKit/*.html",
    "prob": "content/Probability*RescueKit/*.html",
    "stat": "content/StatisticsRescueKit/*.html"
}

os.chdir("d:/MATHRecaueKIT")

results = []
for subj, g in mappings.items():
    print(f"Running conversion for {subj}...")
    env = dict(os.environ, PYTHONIOENCODING="utf-8")
    cmd = [sys.executable, "convert.py", "--subject", subj, "--glob", g]
    result = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace', env=env)
    results.append(f"=== {subj} ===\n{result.stdout}\n")
    if result.stderr:
        results.append(f"STDERR for {subj}:\n{result.stderr}\n")

with open("run_all_output.txt", "w", encoding="utf-8") as f:
    f.writelines(results)

print("Done running all conversions. Output saved to run_all_output.txt")
