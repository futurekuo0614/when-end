
export default async function handler(req, res) {
  const { audio } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  const completion = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '你是一個日文到中文的即時口語翻譯助手。請把使用者的語音內容翻譯成自然流暢的中文。'
        },
        {
          role: 'user',
          content: `音訊（base64編碼）如下：${audio}`
        }
      ]
    })
  });

  const data = await completion.json();
  const translated = data.choices?.[0]?.message?.content ?? "翻譯失敗";
  res.status(200).json({ translation: translated });
}
