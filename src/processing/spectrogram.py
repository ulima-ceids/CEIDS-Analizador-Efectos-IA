import librosa
import numpy as np
import librosa.display
import matplotlib.pyplot as plt

def generate_mel_spectrogram(audio, sample_rate=44100, n_mels=128):
    mel = librosa.feature.melspectrogram(
        y=audio,
        sr=sample_rate,
        n_fft=2048,
        hop_length=512,
        n_mels=n_mels
    )
    mel_db = librosa.power_to_db(mel, ref=np.max)
    return mel_db

def show_spectrogram(mel_db):
    plt.figure(figsize=(10, 4))
    librosa.display.specshow(mel_db, x_axis='time', y_axis='mel')
    plt.colorbar(format='%+2.0f dB')
    plt.title('Mel-Spectrogram')
    plt.tight_layout()
    plt.show()
