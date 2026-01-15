import librosa
import numpy as np

def load_audio(file_path, sample_rate=44100):
    audio, sr = librosa.load(file_path, sr=sample_rate, mono=True)
    return audio, sr
