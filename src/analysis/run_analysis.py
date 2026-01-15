import sys, os
sys.path.append(os.path.abspath("."))

from src.analysis.dsp_features import extract_features
from src.analysis.effect_heuristics import estimate_effects

def analyze_audio(path):
    print("Extrayendo características DSP...")
    feats = extract_features(path)
    print("Características:", feats)

    print("\n Estimando efectos...")
    effects = estimate_effects(feats)
    print("Efectos estimados:", effects)

    return effects


if __name__ == "__main__":
    path = "data/raw/test.wav"   # tu archivo grabado
    print(f"Analizando: {path}")
    analyze_audio(path)
