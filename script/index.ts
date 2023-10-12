import fs from "fs-extra";
import path from "path";
import { startRec } from "./record";
import { chatWithGPT } from "./chatgpt";
import fetch from "node-fetch";
const playSound = require("play-sound")();

let loading = false;

startRec({
  onInput: (text: string) => {
    if (text === "") return;
    if (loading) {
      console.log("Loading...");
      return;
    }
    loading = true;
    console.log("User:", text);

    if (text.length < 10) {
      loading = false;
      return
    }

    chatWithGPT(text).then((res) => {
      console.log("chatGPT:", res);
      // call VOICEVOX API
      const queryUrl = new URL("http://127.0.0.1:50021/audio_query");
      queryUrl.searchParams.append("speaker", "1");
      queryUrl.searchParams.append("text", res);
      fetch(queryUrl.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((res) => {
          const audioUrl = new URL("http://127.0.0.1:50021/synthesis");
          audioUrl.searchParams.append("speaker", "1");
          return fetch(audioUrl.toString(), {
            method: "POST",
            headers: { accept: "audio/wav", "Content-Type": "application/json" },
            body: JSON.stringify({ ...res, speedScale: 1.5 }),
          });
        })
        .then(async (res) => {
          // save audio
          const buffer = await res.buffer();
          const filename = path.join(__dirname, `./tmp.wav`);
          await fs.writeFile(filename, buffer);

          playSound.play(filename, undefined, (err) => {
            if (err) throw err;
            setTimeout(() => {
              loading = false;
            }, 500);
          });
        });
    });
  },
});
