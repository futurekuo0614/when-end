export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // audio can be big
    },
  },
};

export default async function handler(req, res) {
  const { audio } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  try {
    // Decode base64 to binary buffer
    const audioBuffer = Buffer.from(audio, 'base64');

    // Step 1: Transcription (Japanese speech to Japanese text)
    const formData = new FormData();
    formData.append('file', new Blob([audioBuffer], { type: 'audio/webm' }), 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'ja');

    const transcriptionRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    const transcriptionData = await transcriptionRes.json();
    const jpText = transcriptionData.text;

    // Step 2: Translate (Japanese text → Chinese)
    const translationRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: '你是一位專業翻譯，請將以下日文翻譯成自然流暢的中文。只回覆翻譯後的內容。'
          },
          {
            role: 'user',
            content: jpText
          }
        ],
      }),
    });

    const result = await translationRes.json();
    const translated = result.choices?.[0]?.message?.content ?? "翻譯失敗";

    res.status(200).json({ translation: translated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ translation: '翻譯失敗' });
  }
}
