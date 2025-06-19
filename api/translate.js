import fetch from 'node-fetch';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};

export default async function handler(req, res) {
  const { audio } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  try {
    // Decode base64 to binary buffer
    const buffer = Buffer.from(audio, 'base64');

    // Prepare form data for Whisper API
    const form = new FormData();
    form.append('file', buffer, {
      filename: 'audio.webm',
      contentType: 'audio/webm',
    });
    form.append('model', 'whisper-1');
    form.append('language', 'ja');

    const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        ...form.getHeaders(),
      },
      body: form,
    });

    const whisperData = await whisperRes.json();

    if (!whisperData.text) {
      throw new Error('Transcription failed');
    }

    // Translate from Japanese to Chinese
    const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: whisperData.text
          }
        ]
      })
    });

    const chatData = await chatRes.json();
    const translated = chatData.choices?.[0]?.message?.content ?? "翻譯失敗";

    res.status(200).json({ translation: translated });
  } catch (err) {
    console.error('[Translation Error]', err);
    res.status(500).json({ translation: '翻譯失敗' });
  }
}

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
