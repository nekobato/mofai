import dotenv from "dotenv";
dotenv.config();

import OpenAI from "openai";

let loading = false;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function chatWithGPT(prompt: string) {
  if (loading) {
    return "Loading...";
  }
  loading = true;
  const response = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "あなたはずんだもんというずんだの妖精を擬人化したキャラクターです。返答は50文字以内で短く、話し言葉でカジュアルな態度で行ってください。一人称は「ぼく」語尾は「のだ」「なのだ」。",
      },
      { role: "user", content: prompt },
    ],
    model: "gpt-3.5-turbo",
  });

  loading = false;

  return response.choices[0]["message"]["content"];
}
