from faster_whisper import WhisperModel
import numpy as np, wave, json, sys
wf=wave.open(sys.argv[1]); A=np.frombuffer(wf.readframes(wf.getnframes()),np.int16).astype(np.float32)/32768
m=WhisperModel(sys.argv[2],device="cpu",compute_type="int8")
segs,_=m.transcribe(A,word_timestamps=True,beam_size=5,language="en")
out=[]
for s in segs:
    print(f"[{s.start:.2f}-{s.end:.2f}] {s.text}")
    out+= [{"w":w.word.strip(),"s":round(w.start,3),"e":round(w.end,3)} for w in s.words]
json.dump(out,open(sys.argv[3],"w"))
