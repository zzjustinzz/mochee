"""Hộp nhạc "Tiệm bánh Mochee" – giai điệu tự sáng tác + Happy Birthday (giai điệu năm 1893, phạm vi công cộng).
Tổng hợp âm thanh bằng numpy (không dùng mẫu âm thanh có bản quyền)."""
import numpy as np, subprocess, sys
SR = 44100
BPM = 112
BEAT = 60 / BPM
NOTE = {'C':0,'C#':1,'D':2,'D#':3,'E':4,'F':5,'F#':6,'G':7,'G#':8,'A':9,'A#':10,'B':11}
def midi(n):
    name, octv = (n[:-1], int(n[-1]))
    return 12 * (octv + 1) + NOTE[name]
def freq(m): return 440 * 2 ** ((m - 69) / 12)

events = []  # (beat, midi, dur_beats, vel, voice)
t = 0.0
def mel(seq, oct_shift=0, vel=0.9):
    global t
    for n, d in seq:
        if n != 'r':
            events.append((t, midi(n) + 12 * oct_shift, d, vel, 'box'))
        t += d
CH = {'G':['G2','D3','G3','B3','D4'], 'D':['D3','A3','D4','F#4','A3'], 'Em':['E3','B3','E4','G4','B3'],
      'C':['C3','G3','C4','E4','G3'], 'Am':['A2','E3','A3','C4','E3'], 'D7':['D3','A3','C4','F#4','A3'], 'G7':['G2','D3','F4','B3','D4']}
def bars(chords, start):
    b = start
    for c in chords:
        notes = CH[c]
        if isinstance(c, str):
            events.append((b, midi(notes[0]), 3, 0.55, 'bass'))
            events.append((b + 1, midi(notes[2]), 1, 0.32, 'box'))
            events.append((b + 1, midi(notes[3]), 1, 0.28, 'box'))
            events.append((b + 2, midi(notes[2]), 1, 0.30, 'box'))
            events.append((b + 2, midi(notes[3]), 1, 0.26, 'box'))
        b += 3

# Intro: lấp lánh
intro_start = t
for i, n in enumerate(['G5','B5','D6','G6','D6','B6']):
    events.append((t + i * 0.5, midi(n), 0.5, 0.55, 'box'))
t += 3
for i, n in enumerate(['A5','C6','D6','F#6','D6','A5']):
    events.append((t + i * 0.5, midi(n), 0.5, 0.5, 'box'))
bars(['G','D'], intro_start)
t += 3

# Chủ đề A (tự sáng tác)
a_start = t
A1 = [('B4',1),('D5',1),('G5',1), ('F#5',1.5),('E5',.5),('D5',1), ('E5',1),('G5',1),('B4',1), ('C5',2),('E5',1),
      ('D5',1),('B4',.5),('C5',.5),('D5',1), ('A4',1),('F#4',1),('A4',1), ('G4',1),('A4',1),('F#4',1), ('G4',3)]
A2 = [('D5',1),('G5',1),('B5',1), ('A5',1.5),('G5',.5),('E5',1), ('D5',1),('B4',1),('G4',1), ('C5',1),('E5',1),('A5',1),
      ('G5',1),('F#5',.5),('E5',.5),('D5',1), ('F#5',1),('E5',1),('D5',1), ('E5',1),('D5',1),('A4',1), ('G4',1.5),('B4',.5),('D5',1)]
mel(A1, 1); bars(['G','D','Em','C','G','D','C','G'], a_start)
b2 = t; mel(A2, 1); bars(['G','C','G','Am','G','D','C','G'], b2)

# Happy Birthday (1893, phạm vi công cộng)
hb_pick = t
mel([('r',1),('r',1),('D5',.75),('D5',.25)], 0, 0.95)
hb_start = t
HB = [('E5',1),('D5',1),('G5',1), ('F#5',2),('D5',.75),('D5',.25), ('E5',1),('D5',1),('A5',1), ('G5',2),('D5',.75),('D5',.25),
      ('D6',1),('B5',1),('G5',1), ('F#5',1),('E5',1),('C6',.75),('C6',.25), ('B5',1),('G5',1),('A5',1), ('G5',3)]
mel(HB, 0, 0.95)
bars(['D'], hb_pick)
bars(['G','D','D','G','G','C','D7','G'], hb_start)

# Kết nhỏ quay về đầu
end = t
for i, n in enumerate(['B5','D6','G6']):
    events.append((t + i, midi(n), 1, 0.45, 'box'))
bars(['G'], end); t += 3
total_beats = t

# ---- tổng hợp
dur = total_beats * BEAT
tail = 3.0
N = int((dur + tail) * SR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)
def voice(f, length, kind):
    n = int(length * SR); tt = np.arange(n) / SR
    if kind == 'box':
        tau = 1.5 * (440 / f) ** 0.35
        env = np.exp(-tt / tau) * np.minimum(1, tt / 0.003)
        parts = [(1, 1.0), (2.0, 0.28), (3.0, 0.08), (4.16, 0.10), (5.93, 0.04)]
        s = sum(a * np.sin(2 * np.pi * f * r * tt + rng.random() * 6) * np.exp(-tt * (r - 1) * 1.8) for r, a in parts)
        return s * env
    else:  # bass: sin mềm như đàn kalimba trầm
        env = np.exp(-tt / 0.9) * np.minimum(1, tt / 0.008)
        return (np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt) * np.exp(-tt * 4)) * env
for (b, m, d, v, kind) in events:
    f = freq(m)
    start = int(b * BEAT * SR)
    length = 2.6 if kind == 'box' else 1.6
    s = voice(f, length, kind) * v * (0.24 if kind == 'box' else 0.22)
    pan = np.clip((m - 72) / 48, -0.25, 0.25)
    end_i = min(N, start + len(s)); s = s[:end_i - start]
    L[start:end_i] += s * np.cos((pan + 1) * np.pi / 4) ; R[start:end_i] += s * np.sin((pan + 1) * np.pi / 4)

# reverb: IR nhiễu tắt dần
ir_len = int(2.2 * SR)
ir_t = np.arange(ir_len) / SR
def ir(seed):
    r = np.random.default_rng(seed).standard_normal(ir_len) * np.exp(-ir_t / 0.55)
    r[:int(0.012 * SR)] = 0
    return r / np.sqrt((r ** 2).sum())
from scipy.signal import fftconvolve
wetL = fftconvolve(L, ir(1))[:N]; wetR = fftconvolve(R, ir(2))[:N]
L = L * 0.82 + wetL * 0.45; R = R * 0.82 + wetR * 0.45
# vòng lặp liền mạch: cộng phần đuôi vào đầu bài
loopN = int(dur * SR)
for ch in (L, R):
    ch[:N - loopN] += ch[loopN:N]
L = L[:loopN]; R = R[:loopN]
# lọc thông thấp nhẹ cho êm
from scipy.signal import butter, sosfilt
sos = butter(2, 7000, 'low', fs=SR, output='sos')
L = sosfilt(sos, L); R = sosfilt(sos, R)
peak = max(np.abs(L).max(), np.abs(R).max())
L, R = L / peak * 0.85, R / peak * 0.85
pcm = (np.stack([L, R], 1) * 32767).astype(np.int16)
import wave
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('seconds', round(dur, 1), 'events', len(events))
