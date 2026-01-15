import librosa
import numpy as np

def extract_features(path):
    audio, sr = librosa.load(path, sr=44100)

    rms = librosa.feature.rms(y=audio)[0]
    rms_db = float(20 * np.log10(np.mean(rms) + 1e-9))

    centroid = float(np.mean(librosa.feature.spectral_centroid(y=audio, sr=sr)))
    bandwidth = float(np.mean(librosa.feature.spectral_bandwidth(y=audio, sr=sr)))
    flatness = float(np.mean(librosa.feature.spectral_flatness(y=audio)))
    zcr = float(np.mean(librosa.feature.zero_crossing_rate(y=audio)))

    harmonic, percussive = librosa.effects.hpss(audio)
    h_energy = np.sum(harmonic**2)
    p_energy = np.sum(percussive**2)
    hp_ratio = float(10 * np.log10((h_energy + 1e-9) / (p_energy + 1e-9)))

    onsets = librosa.onset.onset_detect(y=audio, sr=sr)
    onset_count = int(len(onsets))

    tail_energy = float(np.mean(np.abs(audio[-int(sr*0.5):])))
    full_energy = float(np.mean(np.abs(audio)))
    reverb_ratio = float(tail_energy / (full_energy + 1e-9))

    return {
        "rms_db": rms_db,
        "centroid": centroid,
        "bandwidth": bandwidth,
        "flatness": flatness,
        "zcr": zcr,
        "hp_ratio": hp_ratio,
        "onset_count": onset_count,
        "reverb_ratio": reverb_ratio
    }
