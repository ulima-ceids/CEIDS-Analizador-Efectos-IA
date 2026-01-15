def clamp(x, low, high):
    return max(low, min(high, x))

def estimate_effects(features):
    rms = features["rms_db"]
    centroid = features["centroid"]
    flatness = features["flatness"]
    zcr = features["zcr"]
    hp_ratio = features["hp_ratio"]
    reverb_ratio = features["reverb_ratio"]

    # --- Detectar distorsión ---
    distortion_prob = 0
    if rms > -22: distortion_prob += 0.4
    if flatness > 0.1: distortion_prob += 0.4
    if zcr > 0.05: distortion_prob += 0.4

    distortion_prob = min(distortion_prob, 1.0)

    # --- Parámetros MG-30 ---
    gain = clamp(int((distortion_prob * 0.7 + flatness * 0.3) * 100), 0, 100)

    tone = clamp(int((centroid / 5000) * 100), 0, 100)
    bass = clamp(int((1 - centroid/8000) * 70), 0, 100)
    mid = clamp(int((hp_ratio / 12) * 100), 0, 100)
    treble = clamp(int((centroid / 6000) * 100), 0, 100)

    reverb_amount = clamp(int(reverb_ratio * 300), 0, 100)

    return {
        "effect": "distortion" if distortion_prob > 0.5 else "overdrive",
        "gain": gain,
        "tone": tone,
        "bass": bass,
        "mid": mid,
        "treble": treble,
        "reverb": reverb_amount,
        "confidence": round(distortion_prob, 2)
    }
