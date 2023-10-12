import vosk from "vosk";
import path from "path";
import fs from "fs";
import mic from "mic";

const MODEL_PATH = path.join(__dirname, "../model");
const SAMPLE_RATE = 16000;

if (!fs.existsSync(MODEL_PATH)) {
  console.log(
    "Please download the model from https://alphacephei.com/vosk/models and unpack as " +
      MODEL_PATH +
      " in the current folder.",
  );
  process.exit();
}

vosk.setLogLevel(0);
const model = new vosk.Model(MODEL_PATH);
const rec = new vosk.Recognizer({ model: model, sampleRate: SAMPLE_RATE });

export const startRec = ({ onInput }: { onInput: (text: string) => void }) => {
  const micInstance = mic({
    rate: String(SAMPLE_RATE),
    channels: "1",
    debug: false,
    device: "default",
  });

  const micInputStream = micInstance.getAudioStream();

  micInputStream.on("data", function (data: any) {
    if (rec.acceptWaveform(data)) {
      onInput(rec.result().text);
    }
  });

  micInputStream.on("audioProcessExitComplete", function () {
    console.log("Cleaning up");
    console.log(rec.finalResult());
    rec.free();
    model.free();
  });

  process.on("SIGINT", function () {
    console.log("\nStopping");
    micInstance.stop();
  });

  micInstance.start();
};
